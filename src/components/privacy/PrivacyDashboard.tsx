import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useDataPrivacy } from '@/hooks/useDataPrivacy';
import { Download, Trash2, Shield, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PrivacyDashboard: React.FC = () => {
  const {
    privacySettings,
    exportRequests,
    deletionRequests,
    updatePrivacySettings,
    requestDataExport,
    requestDataDeletion,
    getDataProcessingPurposes,
    getDataRetentionInfo
  } = useDataPrivacy();
  
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleConsentChange = async (setting: string, value: boolean) => {
    setLoading(setting);
    const success = await updatePrivacySettings({ [setting]: value });
    
    if (success) {
      toast({
        title: "Privacy Settings Updated",
        description: `${setting} consent has been ${value ? 'granted' : 'withdrawn'}.`
      });
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(null);
  };

  const handleDataExport = async () => {
    setLoading('export');
    const requestId = await requestDataExport();
    
    if (requestId) {
      toast({
        title: "Export Requested",
        description: `Your data export request (${requestId}) has been submitted. You'll receive an email when ready.`
      });
    } else {
      toast({
        title: "Export Failed",
        description: "Failed to request data export. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(null);
  };

  const handleDataDeletion = async () => {
    setLoading('delete');
    const requestId = await requestDataDeletion();
    
    if (requestId) {
      toast({
        title: "Deletion Requested",
        description: `Your data deletion request (${requestId}) has been submitted. This action cannot be undone.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Deletion Failed", 
        description: "Failed to request data deletion. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(null);
  };

  const purposes = getDataProcessingPurposes();
  const retentionInfo = getDataRetentionInfo();

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">GDPR</div>
              <div className="text-sm text-muted-foreground">Compliant</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">CCPA</div>
              <div className="text-sm text-muted-foreground">Compliant</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{retentionInfo.accountData}</div>
              <div className="text-sm text-muted-foreground">Data Retention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {purposes.map((purpose) => (
            <div key={purpose.purpose} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{purpose.purpose}</h4>
                  {purpose.required && <Badge variant="secondary">Required</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{purpose.description}</p>
              </div>
              <Switch
                checked={purpose.consented}
                disabled={purpose.required || loading === purpose.purpose.toLowerCase()}
                onCheckedChange={(checked) => 
                  handleConsentChange(purpose.purpose.toLowerCase().replace(/\s+/g, '') + 'Consent', checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Right to Data Portability</h4>
              <p className="text-sm text-muted-foreground">
                Download all your personal data in a machine-readable format
              </p>
              {exportRequests.length > 0 && (
                <div className="mt-2">
                  <Badge variant="outline">
                    {exportRequests[exportRequests.length - 1].status}
                  </Badge>
                </div>
              )}
            </div>
            <Button
              onClick={handleDataExport}
              disabled={loading === 'export'}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === 'export' ? 'Processing...' : 'Export Data'}
            </Button>
          </div>

          {/* Data Deletion */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Right to be Forgotten</h4>
              <p className="text-sm text-muted-foreground">
                Request permanent deletion of all your personal data
              </p>
              {privacySettings.rightToBeDeletedRequested && (
                <div className="mt-2 flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Deletion request pending</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleDataDeletion}
              disabled={loading === 'delete' || privacySettings.rightToBeDeletedRequested}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading === 'delete' ? 'Processing...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(retentionInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between p-3 border rounded">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyDashboard;