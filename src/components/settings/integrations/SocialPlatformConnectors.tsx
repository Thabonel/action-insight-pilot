import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SocialPlatformConnection, ApiResponse } from '@/lib/api-client-interface';

const SocialPlatformConnectors: React.FC = () => {
  const [connections, setConnections] = useState<SocialPlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const result = await apiClient.socialPlatforms.getPlatformConnections() as ApiResponse<SocialPlatformConnection[]>;
      
      if (result.success && result.data) {
        setConnections(result.data);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  interface ConnectionResponse {
    success: boolean;
    message?: string;
  }

  const handleConnect = async (platform: string) => {
    try {
      setActionLoading(platform);
      const result = await apiClient.socialPlatforms.initiatePlatformConnection(platform) as ApiResponse<ConnectionResponse>;

      if (result.success) {
        toast({
          title: "Platform Connected",
          description: `Successfully connected to ${platform}`,
        });
        await fetchConnections();
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platform}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      setActionLoading(platform);
      await apiClient.socialPlatforms.disconnectPlatform(platform);
      
      toast({
        title: "Platform Disconnected",
        description: `Successfully disconnected from ${platform}`,
      });
      await fetchConnections();
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect from ${platform}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSync = async (platform: string) => {
    try {
      setActionLoading(`sync-${platform}`);
      await apiClient.socialPlatforms.syncPlatformData(platform);
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced data from ${platform}`,
      });
      await fetchConnections();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: `Failed to sync data from ${platform}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTest = async (platform: string) => {
    try {
      setActionLoading(`test-${platform}`);
      await apiClient.socialPlatforms.testPlatformConnection(platform);
      
      toast({
        title: "Connection Test Successful",
        description: `Connection to ${platform} is working properly`,
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: `Connection to ${platform} is not working`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Platform Connectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Platform Connectors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connections.map((connection) => (
          <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-medium">{connection.platform}</h3>
                <p className="text-sm text-gray-500">{connection.account_name}</p>
              </div>
              <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                {connection.status}
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              {connection.status === 'connected' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(connection.platform)}
                    disabled={actionLoading === `test-${connection.platform}`}
                  >
                    {actionLoading === `test-${connection.platform}` ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(connection.platform)}
                    disabled={actionLoading === `sync-${connection.platform}`}
                  >
                    {actionLoading === `sync-${connection.platform}` ? 'Syncing...' : 'Sync'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(connection.platform)}
                    disabled={actionLoading === connection.platform}
                  >
                    {actionLoading === connection.platform ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleConnect(connection.platform)}
                  disabled={actionLoading === connection.platform}
                  size="sm"
                >
                  {actionLoading === connection.platform ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SocialPlatformConnectors;
