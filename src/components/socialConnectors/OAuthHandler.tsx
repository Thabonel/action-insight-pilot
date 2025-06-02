
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { SocialPlatform, PlatformConnection, PlatformConfig, OAuthState } from '@/types/socialConnectors';

interface OAuthHandlerProps {
  platform: SocialPlatform;
  platformConfig: PlatformConfig;
  onSuccess: (connection: PlatformConnection) => void;
  onError: (error: string) => void;
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;
}

const OAuthHandler: React.FC<OAuthHandlerProps> = ({
  platform,
  platformConfig,
  onSuccess,
  onError,
  isConnecting,
  setIsConnecting
}) => {
  const [authStep, setAuthStep] = useState<'prepare' | 'authorizing' | 'processing' | 'complete'>('prepare');
  const [authUrl, setAuthUrl] = useState<string>('');

  useEffect(() => {
    // Check if we're returning from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      handleOAuthError(error);
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state);
      return;
    }

    generateAuthUrl();
  }, [platform]);

  const generateAuthUrl = async () => {
    try {
      // Create OAuth state
      const oauthState: OAuthState = {
        platform,
        userId: 'current-user-id', // This would come from your auth system
        returnUrl: window.location.pathname,
        timestamp: Date.now()
      };

      const response = await fetch('/api/social-auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          state: btoa(JSON.stringify(oauthState))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthUrl(data.authUrl);
      } else {
        onError('Failed to generate authorization URL');
      }
    } catch (error) {
      onError('Failed to initialize OAuth flow');
    }
  };

  const startOAuthFlow = () => {
    if (authUrl) {
      setAuthStep('authorizing');
      setIsConnecting(true);
      window.location.href = authUrl;
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    setAuthStep('processing');
    setIsConnecting(true);

    try {
      // Decode and validate state
      const oauthState: OAuthState = JSON.parse(atob(state));
      
      if (oauthState.platform !== platform) {
        throw new Error('Invalid OAuth state');
      }

      // Exchange code for token
      const response = await fetch('/api/social-auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          code,
          state
        })
      });

      if (response.ok) {
        const data = await response.json();
        const connection: PlatformConnection = {
          id: data.connectionId,
          platform,
          isConnected: true,
          userId: data.userId,
          profiles: data.profiles || [],
          lastSync: new Date().toISOString()
        };
        
        setAuthStep('complete');
        onSuccess(connection);
      } else {
        const errorData = await response.json();
        onError(errorData.error || 'Failed to complete authorization');
      }
    } catch (error) {
      onError('Failed to process authorization callback');
    } finally {
      setIsConnecting(false);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleOAuthError = (error: string) => {
    setIsConnecting(false);
    const errorMessages: Record<string, string> = {
      'access_denied': 'Authorization was cancelled by user',
      'invalid_request': 'Invalid authorization request',
      'invalid_client': 'Invalid client credentials',
      'invalid_grant': 'Invalid authorization grant',
      'unsupported_response_type': 'Unsupported response type'
    };
    
    onError(errorMessages[error] || `Authorization error: ${error}`);
    // Clean up URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const renderContent = () => {
    switch (authStep) {
      case 'prepare':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{platformConfig.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect to {platformConfig.name}</h2>
              <p className="text-gray-600">
                You'll be redirected to {platformConfig.name} to authorize access to your account
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What we'll access:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Your profile information</li>
                <li>• Your connected social media accounts</li>
                <li>• Permission to post content on your behalf</li>
                <li>• Access to basic analytics and engagement data</li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We only request the minimum permissions needed to enhance your social media workflow. 
                You can revoke access at any time.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button onClick={startOAuthFlow} className="flex-1" disabled={!authUrl}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to {platformConfig.name}
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        );

      case 'authorizing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="text-xl font-semibold">Redirecting to {platformConfig.name}...</h2>
            <p className="text-gray-600">Please complete the authorization process in the new window.</p>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="text-xl font-semibold">Processing Authorization...</h2>
            <p className="text-gray-600">We're setting up your connection. This may take a moment.</p>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
            <h2 className="text-xl font-semibold text-green-800">Successfully Connected!</h2>
            <p className="text-gray-600">Your {platformConfig.name} account is now connected and ready to use.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>OAuth Authorization</span>
          {isConnecting && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default OAuthHandler;
