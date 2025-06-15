
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Settings, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import { useToast } from '@/hooks/use-toast';

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  icon: string;
  authMethod: 'oauth';
  docsUrl: string;
}

const SocialPlatformConnectors: React.FC = () => {
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { connections, isLoading, connectPlatform, disconnectPlatform, getPlatformStatus, reload } = useSocialPlatforms();

  const platforms: SocialPlatform[] = [
    {
      id: 'buffer',
      name: 'Buffer',
      description: 'Schedule and publish content across social platforms',
      icon: '📊',
      authMethod: 'oauth',
      docsUrl: 'https://buffer.com/developers/api'
    },
    {
      id: 'hootsuite',
      name: 'Hootsuite',
      description: 'Enterprise social media management',
      icon: '🦉',
      authMethod: 'oauth',
      docsUrl: 'https://developer.hootsuite.com/'
    },
    {
      id: 'later',
      name: 'Later',
      description: 'Visual content calendar and publishing',
      icon: '📅',
      authMethod: 'oauth',
      docsUrl: 'https://developers.later.com/'
    },
    {
      id: 'sprout_social',
      name: 'Sprout Social',
      description: 'Complete social media management platform',
      icon: '🌱',
      authMethod: 'oauth',
      docsUrl: 'https://developers.sproutsocial.com/'
    }
  ];

  useEffect(() => {
    // Listen for OAuth completion messages from popup windows
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth_success') {
        toast({
          title: "Platform Connected!",
          description: `Successfully connected to ${event.data.platform}.`,
        });
        reload();
        setConnecting(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.data.platform);
          return newSet;
        });
      } else if (event.data.type === 'oauth_error') {
        toast({
          title: "Connection Failed",
          description: event.data.error,
          variant: "destructive",
        });
        setConnecting(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.data.platform);
          return newSet;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast, reload]);

  const handleConnect = async (platform: SocialPlatform) => {
    setConnecting(prev => new Set(prev).add(platform.id));
    
    try {
      const response = await connectPlatform(platform.id);
      
      if (response && response.authorization_url) {
        // Open OAuth popup
        const popup = window.open(
          response.authorization_url,
          `oauth_${platform.id}`,
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Check if popup was blocked
        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }

        // Monitor popup closure without oauth completion
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setConnecting(prev => {
              const newSet = new Set(prev);
              newSet.delete(platform.id);
              return newSet;
            });
          }
        }, 1000);
      }
    } catch (error) {
      console.error(`Failed to connect to ${platform.name}:`, error);
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform.id);
        return newSet;
      });
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : `Failed to connect to ${platform.name}`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    try {
      await disconnectPlatform(platform.id);
      toast({
        title: "Platform Disconnected",
        description: `Successfully disconnected from ${platform.name}.`,
      });
    } catch (error) {
      console.error(`Failed to disconnect from ${platform.name}:`, error);
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect from ${platform.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'error': return AlertCircle;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Social Media Platform Connectors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5" />
          <span>Social Media Platform Connectors</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => {
            const status = getPlatformStatus(platform.id);
            const StatusIcon = getStatusIcon(status);
            const isConnecting = connecting.has(platform.id);
            
            return (
              <div key={platform.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h3 className="font-medium">{platform.name}</h3>
                      <div className="flex items-center space-x-1">
                        {StatusIcon && <StatusIcon className={`h-3 w-3 text-${getStatusColor(status)}-600`} />}
                        <Badge 
                          variant="outline" 
                          className={`text-${getStatusColor(status)}-600 border-${getStatusColor(status)}-300`}
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{platform.description}</p>
                
                {status === 'connected' ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect(platform)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        `Connect ${platform.name}`
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a 
                        href={platform.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        API Documentation
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">🔐</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Secure OAuth Integration</h4>
              <p className="text-sm text-blue-800">
                Connections use industry-standard OAuth 2.0 authentication. Your credentials are encrypted and stored securely. 
                You can revoke access at any time through the platform's settings or by disconnecting here.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialPlatformConnectors;
