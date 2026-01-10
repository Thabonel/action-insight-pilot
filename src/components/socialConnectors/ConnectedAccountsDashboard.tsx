import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlatformConnection, SocialPlatform } from '@/types/socialConnectors';

interface ConnectedAccountsDashboardProps {
  connections: PlatformConnection[];
  onDisconnect: (platform: SocialPlatform) => void;
  onRefresh: () => void;
}

const ConnectedAccountsDashboard: React.FC<ConnectedAccountsDashboardProps> = ({
  connections,
  onDisconnect,
  onRefresh
}) => {
  const [selectedConnection, setSelectedConnection] = useState<PlatformConnection | null>(null);

  const getPlatformIcon = (platform: SocialPlatform) => {
    const icons = {
      [SocialPlatform.BUFFER]: '📊',
      [SocialPlatform.HOOTSUITE]: '🦉',
      [SocialPlatform.LATER]: '📅',
      [SocialPlatform.SPROUT_SOCIAL]: '🌱'
    };
    return icons[platform] || '📱';
  };

  const getPlatformName = (platform: SocialPlatform) => {
    const names = {
      [SocialPlatform.BUFFER]: 'Buffer',
      [SocialPlatform.HOOTSUITE]: 'Hootsuite', 
      [SocialPlatform.LATER]: 'Later',
      [SocialPlatform.SPROUT_SOCIAL]: 'Sprout Social'
    };
    return names[platform] || platform;
  };

  const getConnectionHealth = (connection: PlatformConnection) => {
    if (!connection.isConnected) return { status: 'error', text: 'Disconnected', color: 'red' };
    
    const now = new Date();
    const lastSync = connection.lastSync ? new Date(connection.lastSync) : null;
    const tokenExpires = connection.accessTokenExpires ? new Date(connection.accessTokenExpires) : null;
    
    if (tokenExpires && tokenExpires < now) {
      return { status: 'warning', text: 'Token Expired', color: 'yellow' };
    }
    
    if (lastSync && (now.getTime() - lastSync.getTime()) > 24 * 60 * 60 * 1000) {
      return { status: 'warning', text: 'Sync Needed', color: 'yellow' };
    }
    
    return { status: 'healthy', text: 'Connected', color: 'green' };
  };

  const connectedPlatforms = connections.filter(c => c.isConnected);
  const totalProfiles = connections.reduce((sum, c) => sum + c.profiles.length, 0);

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Connected Platforms</h3>
          <p className="text-gray-600 mb-4">
            Connect your social media management tools to get started with AI-enhanced posting.
          </p>
          <Button onClick={() => window.location.hash = '#select'}>
            Connect Your First Platform
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Connected Platforms</p>
              <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Social Profiles</p>
              <p className="text-2xl font-bold">{totalProfiles}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">AI Posts This Week</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map((connection) => {
          const health = getConnectionHealth(connection);

          return (
            <Card key={connection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getPlatformIcon(connection.platform)}</div>
                    <div>
                      <CardTitle className="text-lg">{getPlatformName(connection.platform)}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={`text-${health.color}-600 border-${health.color}-300`}
                        >
                          {health.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    Settings
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Connected Profiles */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Connected Profiles ({connection.profiles.length})
                  </h4>
                  <div className="space-y-2">
                    {connection.profiles.slice(0, 3).map((profile) => (
                      <div key={profile.id} className="flex items-center space-x-2 text-sm">
                        {profile.avatarUrl && (
                          <img 
                            src={profile.avatarUrl} 
                            alt={profile.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-medium">{profile.platform}</span>
                        <span className="text-gray-600">@{profile.username}</span>
                      </div>
                    ))}
                    {connection.profiles.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{connection.profiles.length - 3} more profiles
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Sync */}
                {connection.lastSync && (
                  <div className="text-sm text-gray-600">
                    Last synced: {new Date(connection.lastSync).toLocaleDateString()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Schedule Post
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDisconnect(connection.platform)}
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <span>Schedule AI Post</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={onRefresh}>
              <span>Sync All Platforms</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectedAccountsDashboard;
