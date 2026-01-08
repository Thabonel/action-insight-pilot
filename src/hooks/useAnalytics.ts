import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEventData {
  timestamp?: string;
  url?: string;
  user_agent?: string;
  field_name?: string;
  is_empty?: boolean;
  time_spent_ms?: number;
  assistance_type?: string;
  success?: boolean;
  error_message?: string;
  [key: string]: unknown;
}

interface AnalyticsEvent {
  event_type: string;
  event_data: AnalyticsEventData;
  user_id?: string;
  session_id?: string;
}

export const useAnalytics = () => {
  const trackEvent = useCallback(async (eventType: string, eventData: AnalyticsEventData = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Track form field interactions
      const analyticsEvent: AnalyticsEvent = {
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          url: window.location.pathname,
          user_agent: navigator.userAgent.substring(0, 255) // Limit length
        },
        user_id: user?.id,
        session_id: sessionStorage.getItem('session_id') || `session_${Date.now()}`
      };

      // Store session ID for consistency
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', analyticsEvent.session_id!);
      }

      // For now, log to console - can be enhanced to send to analytics service
      console.log('Analytics Event:', analyticsEvent);

      // Optional: Store critical events in database for analysis
      if (['campaign_form_abandon', 'field_help_requested', 'ai_assistance_used'].includes(eventType)) {
        await supabase.from('user_analytics_events').insert([{
          event_type: eventType,
          event_data: analyticsEvent.event_data,
          user_id: user?.id
        }]);
      }

    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Fail silently to not disrupt user experience
    }
  }, []);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackEvent('field_focus', { field_name: fieldName });
  }, [trackEvent]);

  const trackFieldBlur = useCallback((fieldName: string, isEmpty: boolean, timeSpent: number) => {
    trackEvent('field_blur', { 
      field_name: fieldName, 
      is_empty: isEmpty,
      time_spent_ms: timeSpent 
    });
  }, [trackEvent]);

  const trackAIAssistanceUsed = useCallback((assistanceType: string, fieldName: string) => {
    trackEvent('ai_assistance_used', { 
      assistance_type: assistanceType,
      field_name: fieldName 
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((success: boolean, errorMessage?: string) => {
    trackEvent('campaign_form_submit', { 
      success,
      error_message: errorMessage 
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackFieldFocus,
    trackFieldBlur,
    trackAIAssistanceUsed,
    trackFormSubmit
  };
};