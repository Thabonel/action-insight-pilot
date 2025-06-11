
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const SocialPlatformConnectors: React.FC = () => {
  const { 
    connections, 
    isLoading, 
    connectPlatform, 
    disconnectPlatform, 
    testConnection, 
    getPlatformStatus 
  } = useSocialPlatforms();

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'buffer',
      name: 'Buffer',
      icon: '📊',
      description: 'Simple social media scheduling and analytics'
    },
    {
      id: 'hootsuite',
      name: 'Hootsuite',
      icon: '🦉',
      description: 'Comprehensive social media management'
    },
    {
      id: 'later',
      name: 'Later',
      icon: '📅',
      description: 'Visual content calendar and scheduler'
    },
    {
      id: 'sprout-social',
      name: 'Sprout Social',
      icon: '🌱',
      description: 'Enterprise social media management'
    },
    {
      id: 'ai_video_publisher',
      name: 'AI Video Publisher',
      icon: '🎬',
      description: 'Create and publish videos with AI'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'error': return 'red';
      case 'disconnected': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getConnectedProfilesCount = (platformId: string): number => {
    const connection = connections.find(conn => conn.platform_name === platformId);
    return connection?.connection_metadata?.profiles_count || 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading platform connections...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Social Media Platform Connectors</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {socialPlatforms.map(platform => {
            const status = getPlatformStatus(platform.id);
            const profilesCount = getConnectedProfilesCount(platform.id);
            
            return (
              <div key={platform.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <div>
                      <h3 className="font-medium">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(status)}-600 border-${getStatusColor(status)}-300`}
                    >
                      {status}
                    </Badge>
                  </div>
                </div>
                
                {status === 'connected' && (
                  <div className="text-sm text-green-600 mb-2">
                    ✅ {profilesCount} social profile(s) connected
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (status === 'connected') {
                        disconnectPlatform(platform.id);
                      } else {
                        connectPlatform(platform.id);
                      }
                    }}
                  >
                    {status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                  
                  {status === 'connected' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => testConnection(platform.id)}
                    >
                      Test
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">AI-Enhanced Social Media Workflow</h4>
              <p className="text-sm text-blue-800">
                Connect your existing social media tools (Buffer, Hootsuite, Later, Sprout Social) to push AI-generated content directly to your familiar interface. Your team can continue using their preferred tools while benefiting from our AI content generation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialPlatformConnectors;
