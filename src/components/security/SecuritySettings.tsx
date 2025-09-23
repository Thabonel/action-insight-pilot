import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings: React.FC = () => {
  const { securitySettings, updateSecuritySettings, tokenManager } = useSecurityContext();
  const { toast } = useToast();

  const handleRevokeAllSessions = async () => {
    try {
      await tokenManager.revokeTokens();
      toast({
        title: "Sessions Revoked",
        description: "All active sessions have been terminated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshTokens = async () => {
    try {
      const success = await tokenManager.refreshTokens();
      if (success) {
        toast({
          title: "Tokens Refreshed",
          description: "Authentication tokens have been refreshed.",
          variant: "default",
        });
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh tokens. Please sign in again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Authentication Security</span>
          </CardTitle>
          <CardDescription>
            Manage your session and authentication security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh">Automatic Token Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh authentication tokens before they expire
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={securitySettings.autoRefresh}
              onCheckedChange={(checked) => 
                updateSecuritySettings({ autoRefresh: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="encrypt-storage">Secure Token Storage</Label>
              <p className="text-sm text-muted-foreground">
                Enable additional security for stored authentication data (handled by Supabase)
              </p>
            </div>
            <Switch
              id="encrypt-storage"
              checked={securitySettings.encryptStorage}
              onCheckedChange={(checked) => 
                updateSecuritySettings({ encryptStorage: checked })
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Session Management</Label>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRefreshTokens}
                className="flex items-center space-x-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Refresh Tokens</span>
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRevokeAllSessions}
                className="flex items-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Revoke All Sessions</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Security Recommendations</span>
          </CardTitle>
          <CardDescription>
            Best practices to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Two-factor authentication is enabled (via Supabase Auth)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>API keys are encrypted and stored securely</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>All database access is protected with Row Level Security</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Regular security updates are applied automatically</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;