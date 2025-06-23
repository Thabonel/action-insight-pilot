import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, CheckCircle, AlertCircle, RefreshCw, Unlink2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SocialPlatformConnection, OAuthResponse } from '@/lib/api-client-interface';

interface SocialPlatformConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  connectHandler: () => void;
  disconnectHandler: () => void;
  syncHandler: () => void;
  testHandler: () => void;
  connecting: boolean;
  syncing: boolean;
  testing: boolean;
}

const SocialPlatformConnectors: React.FC = () => {
  const [connections, setConnections] = useState<SocialPlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await apiClient.socialPlatforms.getPlatformConnections();
      setConnections(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const initiatePlatformConnection = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      const response = await apiClient.socialPlatforms.initiatePlatformConnection(platform);
      
      if (response.success && response.data?.authorization_url) {
        const popup = window.open(
          response.data.authorization_url,
          'social-auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        const handlePopupMessage = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data.platform === platform && event.data.code && event.data.state) {
            try {
              const completeResponse = await apiClient.socialPlatforms.completePlatformConnection(
                platform,
                event.data.code,
                event.data.state
              );
              if (completeResponse.success) {
                toast({
                  title: "Platform Connected",
                  description: `${platform} has been successfully connected!`,
                });
                fetchConnections();
              } else {
                throw new Error(completeResponse.error || 'Failed to complete connection');
              }
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to complete connection';
              toast({
                title: "Connection Failed",
                description: errorMessage,
                variant: "destructive",
              });
            } finally {
              setConnectingPlatform(null);
              popup?.close();
              window.removeEventListener('message', handlePopupMessage);
            }
          }
        };

        window.addEventListener('message', handlePopupMessage);
      } else {
        throw new Error(response.error || 'Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Failed to initiate platform connection:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate platform connection",
        variant: "destructive",
      });
      setConnectingPlatform(null);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    setDisconnectingPlatform(platform);
    try {
      await apiClient.socialPlatforms.disconnectPlatform(platform);
      toast({
        title: "Platform Disconnected",
        description: `${platform} has been successfully disconnected.`,
      });
      fetchConnections();
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect platform",
        variant: "destructive",
      });
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  const testPlatformConnection = async (platform: string) => {
    setTestingPlatform(platform);
    try {
      const result = await apiClient.socialPlatforms.testPlatformConnection(platform);
      if (result.success) {
        toast({
          title: "Connection Tested",
          description: `${platform} connection is healthy.`,
        });
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Failed to test platform connection:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test platform connection",
        variant: "destructive",
      });
    } finally {
      setTestingPlatform(null);
    }
  };

  const syncPlatformData = async (platform: string) => {
    setSyncingPlatform(platform);
    try {
      const result = await apiClient.socialPlatforms.syncPlatformData(platform);
      if (result.success) {
        toast({
          title: "Platform Synced",
          description: `${platform} data has been synced.`,
        });
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Failed to sync platform data:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync platform data",
        variant: "destructive",
      });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const getPlatformStatus = (platform: string) => {
    const connection = connections.find(c => c.platform_name === platform);
    return connection?.connection_status || 'disconnected';
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: <svg viewBox="0 0 32 32" fill="currentColor" height="1em" width="1em"><path d="M32 16c0-8.837-7.163-16-16-16C7.163 0 0 7.163 0 16c0 7.937 5.813 14.531 13.5 15.75V20.406h-3.938v-4.406h3.938v-3.438c0-3.906 2.387-6.062 5.875-6.062 1.688 0 3.125.125 3.562.188v4.062h-2.438c-1.906 0-2.531.938-2.531 2.281v2.969h4.906l-.656 4.406h-4.25v11.344C26.187 30.531 32 23.937 32 16z"/></svg>,
      description: 'Connect to Facebook to manage your social presence.',
      isConnected: getPlatformStatus('facebook') === 'connected',
      connectHandler: () => initiatePlatformConnection('facebook'),
      disconnectHandler: () => disconnectPlatform('facebook'),
      syncHandler: () => syncPlatformData('facebook'),
      testHandler: () => testPlatformConnection('facebook'),
      connecting: connectingPlatform === 'facebook',
      syncing: syncingPlatform === 'facebook',
      testing: testingPlatform === 'facebook',
    },
    {
      name: 'Twitter',
      icon: <svg viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em"><path d="M512 97.248c-19.04 8.352-41.056 13.968-64.512 16.608 22.032-13.2 41.296-34.272 56.528-58.976-20.176 12.096-42.688 20.64-66.56 25.408-18.944-20.48-45.616-33.12-74.752-33.12-52.096 0-94.352 42.256-94.352 94.352 0 7.424.848 14.784 2.448 21.888-78.8-3.984-148.928-41.936-195.072-99.84 0 16.32 8.256 30.72 20.992 39.488-18.032-.576-35.088-5.472-49.424-13.568v1.152c0 22.528 16.032 41.296 37.312 45.568-7.728 2.08-15.984 3.216-24.384 3.216-3.072 0-6.128-.192-9.136-.576 6.128 18.528 23.904 32.016 44.8 32.384-15.744 12.336-35.472 19.792-56.896 19.792-3.728 0-7.376-.224-10.912-.64 19.2 12.288 41.664 19.584 65.344 19.584 78.432 0 121.6-64.736 121.6-121.6 0-1.856-.032-3.696-.08-5.52 8.352-6.048 15.504-13.472 21.216-22.08 4.608-8.944 7.04-19.152 7.04-30.368 0-6.112-.208-12.128-.624-18.096 12.96 9.392 28.32 14.912 44.8 14.912 53.76 0 82.944-44.768 82.944-82.944 0-1.296-.016-2.592-.048-3.888 4.768 3.408 9.92 6.4 15.472 8.96z"/></svg>,
      description: 'Connect to Twitter to automate your tweets and engage with your audience.',
      isConnected: getPlatformStatus('twitter') === 'connected',
      connectHandler: () => initiatePlatformConnection('twitter'),
      disconnectHandler: () => disconnectPlatform('twitter'),
      syncHandler: () => syncPlatformData('twitter'),
      testHandler: () => testPlatformConnection('twitter'),
      connecting: connectingPlatform === 'twitter',
      syncing: syncingPlatform === 'twitter',
      testing: testingPlatform === 'twitter',
    },
    {
      name: 'Instagram',
      icon: <svg viewBox="0 0 448 512" fill="currentColor" height="1em" width="1em"><path d="M224,304a80,80,0,1,0-80-80A80,80,0,0,0,224,304Zm0-128a48,48,0,1,1-48,48A48,48,0,0,1,224,176ZM336,80H112A48,48,0,0,0,64,128V384a48,48,0,0,0,48,48H336a48,48,0,0,0,48-48V128A48,48,0,0,0,336,80ZM384,128a16,16,0,1,1-16-16A16,16,0,0,1,384,128Z"/><path d="M400,32H48A48,48,0,0,0,0,80V432a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V80A48,48,0,0,0,400,32ZM373.33,400H74.67a32,32,0,0,1-32-32V144a32,32,0,0,1,32-32H373.33a32,32,0,0,1,32,32V368A32,32,0,0,1,373.33,400Z"/></svg>,
      description: 'Connect to Instagram to schedule posts and analyze your audience engagement.',
      isConnected: getPlatformStatus('instagram') === 'connected',
      connectHandler: () => initiatePlatformConnection('instagram'),
      disconnectHandler: () => disconnectPlatform('instagram'),
      syncHandler: () => syncPlatformData('instagram'),
      testHandler: () => testPlatformConnection('instagram'),
      connecting: connectingPlatform === 'instagram',
      syncing: syncingPlatform === 'instagram',
      testing: testingPlatform === 'instagram',
    },
    {
      name: 'LinkedIn',
      icon: <svg viewBox="0 0 448 512" fill="currentColor" height="1em" width="1em"><path d="M100.28,448H8.22V148.96h92.06ZM53.79,108.13a54.11,54.11,0,1,1,54.08-54.11A54.08,54.08,0,0,1,53.79,108.13ZM440,448H348V302.42c0-34.63-12.35-62.34-43.46-62.34a49.11,49.11,0,0,0-40.81,21.67h-.27V148.96h92.8v224c0,41.34,30.67,70.3,72.06,70.3Z"/></svg>,
      description: 'Connect to LinkedIn to reach professionals and grow your network.',
      isConnected: getPlatformStatus('linkedin') === 'connected',
      connectHandler: () => initiatePlatformConnection('linkedin'),
      disconnectHandler: () => disconnectPlatform('linkedin'),
      syncHandler: () => syncPlatformData('linkedin'),
      testHandler: () => testPlatformConnection('linkedin'),
      connecting: connectingPlatform === 'linkedin',
      syncing: syncingPlatform === 'linkedin',
      testing: testingPlatform === 'linkedin',
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Platform Connectors</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {socialPlatforms.map((platform) => (
              <Card key={platform.name} className="bg-white shadow-sm">
                <CardContent className="flex flex-col space-y-4 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <h3 className="text-lg font-semibold">{platform.name}</h3>
                    {platform.isConnected && (
                      <Badge variant="secondary">Connected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{platform.description}</p>
                  <div className="flex justify-end space-x-2">
                    {!platform.isConnected ? (
                      <Button
                        variant="outline"
                        onClick={platform.connectHandler}
                        disabled={platform.connecting}
                      >
                        {platform.connecting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={platform.testHandler}
                          disabled={platform.testing}
                        >
                          {platform.testing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Test
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={platform.disconnectHandler}
                          disabled={platform.disconnecting}
                        >
                          {platform.disconnecting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Unlink2 className="mr-2 h-4 w-4" />
                          )}
                          Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialPlatformConnectors;
