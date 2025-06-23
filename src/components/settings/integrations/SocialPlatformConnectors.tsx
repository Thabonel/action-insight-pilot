import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SocialPlatformConnection } from '@/lib/api-client-interface';
import { Twitter, Linkedin, Facebook, RefreshCw, Loader2, Link, CheckCircle, AlertTriangle } from 'lucide-react';

const SocialPlatformConnectors: React.FC = () => {
  const [connections, setConnections] = useState<SocialPlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await apiClient.socialPlatforms.getPlatformConnections();
      
      if (response.success && response.data) {
        setConnections(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch connections');
      }
    } catch (error) {
      console.error('Failed to fetch social platform connections:', error);
      toast({
        title: "Error",
        description: "Failed to load social platform connections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const response = await apiClient.socialPlatforms.initiatePlatformConnection(platform);
      if (response.success && response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error(response.error || 'Failed to initiate connection');
      }
    } catch (error) {
      console.error('Failed to initiate social platform connection:', error);
      toast({
        title: "Error",
        description: "Failed to initiate social platform connection",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    setDisconnecting(platform);
    try {
      await apiClient.socialPlatforms.disconnectPlatform(platform);
      toast({
        title: "Disconnected",
        description: `Disconnected from ${platform}`,
      });
      await fetchConnections();
    } catch (error) {
      console.error('Failed to disconnect social platform:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect social platform",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(null);
    }
  };

  const handleSync = async (platform: string) => {
    setSyncing(platform);
    try {
      await apiClient.socialPlatforms.syncPlatformData(platform);
      toast({
        title: "Syncing",
        description: `Syncing data from ${platform}`,
      });
      await fetchConnections();
    } catch (error) {
      console.error('Failed to sync social platform data:', error);
      toast({
        title: "Error",
        description: "Failed to sync social platform data",
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleTest = async (platform: string) => {
    setTesting(platform);
    try {
      await apiClient.socialPlatforms.testPlatformConnection(platform);
      toast({
        title: "Testing",
        description: `Testing connection to ${platform}`,
      });
      await fetchConnections();
    } catch (error) {
      console.error('Failed to test social platform connection:', error);
      toast({
        title: "Error",
        description: "Failed to test social platform connection",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const getStatus = (platform: string) => {
    const connection = connections.find(conn => conn.platform === platform);
    if (!connection) return 'disconnected';
    return connection.connection_status;
  };

  const platformConfigs = [
    {
      name: 'Twitter',
      icon: <Twitter className="h-6 w-6" />,
      description: 'Connect your Twitter account to manage tweets and engagement',
      isConnected: connections.some(conn => conn.platform === 'twitter' && conn.connection_status === 'connected'),
      connectHandler: () => handleConnect('twitter'),
      disconnectHandler: () => handleDisconnect('twitter'),
      syncHandler: () => handleSync('twitter'),
      testHandler: () => handleTest('twitter'),
      connecting: connecting === 'twitter',
      syncing: syncing === 'twitter',
      testing: testing === 'twitter',
      disconnecting: disconnecting === 'twitter',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-6 w-6" />,
      description: 'Connect your LinkedIn account for professional networking',
      isConnected: connections.some(conn => conn.platform === 'linkedin' && conn.connection_status === 'connected'),
      connectHandler: () => handleConnect('linkedin'),
      disconnectHandler: () => handleDisconnect('linkedin'),
      syncHandler: () => handleSync('linkedin'),
      testHandler: () => handleTest('linkedin'),
      connecting: connecting === 'linkedin',
      syncing: syncing === 'linkedin',
      testing: testing === 'linkedin',
      disconnecting: disconnecting === 'linkedin',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-6 w-6" />,
      description: 'Connect your Facebook account for social media management',
      isConnected: connections.some(conn => conn.platform === 'facebook' && conn.connection_status === 'connected'),
      connectHandler: () => handleConnect('facebook'),
      disconnectHandler: () => handleDisconnect('facebook'),
      syncHandler: () => handleSync('facebook'),
      testHandler: () => handleTest('facebook'),
      connecting: connecting === 'facebook',
      syncing: syncing === 'facebook',
      testing: testing === 'facebook',
      disconnecting: disconnecting === 'facebook',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Platform Connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading connections...
            </div>
          ) : (
            <div className="space-y-4">
              {platformConfigs.map((platform, index) => (
                <Card key={index}>
                  <CardContent className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-1 flex items-center space-x-2">
                      {platform.icon}
                      <span className="font-semibold">{platform.name}</span>
                    </div>
                    <div className="col-span-1 text-sm text-gray-500">{platform.description}</div>
                    <div className="col-span-1 flex justify-end space-x-2">
                      {getStatus(platform.name.toLowerCase()) === 'connected' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={platform.syncHandler}
                            disabled={platform.syncing}
                          >
                            {platform.syncing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync
                              </>
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={platform.testHandler}
                            disabled={platform.testing}
                          >
                            {platform.testing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <Link className="mr-2 h-4 w-4" />
                                Test
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={platform.disconnectHandler}
                            disabled={platform.disconnecting}
                          >
                            {platform.disconnecting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Disconnecting...
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Disconnect
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
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
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPlatformConnectors;
