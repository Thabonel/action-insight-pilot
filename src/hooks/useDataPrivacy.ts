import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DataPrivacySettings {
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  thirdPartyConsent: boolean;
  dataRetentionDays: number;
  rightToBeDeletedRequested: boolean;
}

interface DataExportRequest {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
}

interface DataDeletionRequest {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  confirmationRequired: boolean;
}

export const useDataPrivacy = () => {
  const [privacySettings, setPrivacySettings] = useState<DataPrivacySettings>({
    dataProcessingConsent: false,
    marketingConsent: false,
    analyticsConsent: false,
    thirdPartyConsent: false,
    dataRetentionDays: 730, // 2 years default
    rightToBeDeletedRequested: false
  });

  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);

  // GDPR/CCPA Compliance Functions
  const updatePrivacySettings = useCallback(async (
    settings: Partial<DataPrivacySettings>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update in database
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPrivacySettings(prev => ({ ...prev, ...settings }));
      
      // Log consent changes for audit trail
      await logPrivacyEvent('settings_updated', settings);
      
      return true;
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      return false;
    }
  }, []);

  const requestDataExport = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create export request
      const requestId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newRequest: DataExportRequest = {
        requestId,
        status: 'pending',
        requestedAt: new Date()
      };

      // Store request in database
      const { error } = await supabase
        .from('data_export_requests')
        .insert({
          request_id: requestId,
          user_id: user.id,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      setExportRequests(prev => [...prev, newRequest]);
      
      // Log the request
      await logPrivacyEvent('data_export_requested', { requestId });
      
      // Trigger background processing (would be handled by edge function)
      await fetch('/api/privacy/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ requestId })
      });

      return requestId;
    } catch (error) {
      console.error('Failed to request data export:', error);
      return null;
    }
  }, []);

  const requestDataDeletion = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const requestId = `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newRequest: DataDeletionRequest = {
        requestId,
        status: 'pending',
        requestedAt: new Date(),
        confirmationRequired: true
      };

      // Store request in database
      const { error } = await supabase
        .from('data_deletion_requests')
        .insert({
          request_id: requestId,
          user_id: user.id,
          status: 'pending',
          requested_at: new Date().toISOString(),
          confirmation_required: true
        });

      if (error) throw error;

      setDeletionRequests(prev => [...prev, newRequest]);
      setPrivacySettings(prev => ({ ...prev, rightToBeDeletedRequested: true }));
      
      // Log the request
      await logPrivacyEvent('data_deletion_requested', { requestId });
      
      return requestId;
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      return null;
    }
  }, []);

  const getDataProcessingPurposes = useCallback(() => {
    return [
      {
        purpose: 'Account Management',
        description: 'Creating and managing your user account',
        required: true,
        consented: true
      },
      {
        purpose: 'Service Delivery',
        description: 'Providing marketing automation and campaign management',
        required: true,
        consented: true
      },
      {
        purpose: 'Analytics',
        description: 'Understanding how you use our platform to improve services',
        required: false,
        consented: privacySettings.analyticsConsent
      },
      {
        purpose: 'Marketing Communications',
        description: 'Sending you product updates and promotional materials',
        required: false,
        consented: privacySettings.marketingConsent
      },
      {
        purpose: 'Third-party Integrations',
        description: 'Connecting with social media and email platforms',
        required: false,
        consented: privacySettings.thirdPartyConsent
      }
    ];
  }, [privacySettings]);

  const getDataRetentionInfo = useCallback(() => {
    return {
      accountData: `${privacySettings.dataRetentionDays} days`,
      analyticsData: '26 months (Google Analytics standard)',
      backupData: '90 days after deletion',
      logData: '12 months',
      crashReports: '180 days'
    };
  }, [privacySettings.dataRetentionDays]);

  const logPrivacyEvent = useCallback(async (
    eventType: string,
    details: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('privacy_audit_log')
        .insert({
          user_id: user.id,
          event_type: eventType,
          details,
          timestamp: new Date().toISOString(),
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Failed to log privacy event:', error);
    }
  }, []);

  return {
    privacySettings,
    exportRequests,
    deletionRequests,
    updatePrivacySettings,
    requestDataExport,
    requestDataDeletion,
    getDataProcessingPurposes,
    getDataRetentionInfo
  };
};

// Helper function to get user IP (simplified)
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}