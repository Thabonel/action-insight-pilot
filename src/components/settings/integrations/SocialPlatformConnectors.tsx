
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  status: string;
  description: string;
  profiles: number;
}

const SocialPlatformConnectors: React.FC = () => {
  const navigate = useNavigate();

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'buffer',
      name: 'Buffer',
      icon: '📊',
      status: 'disconnected',
      description: 'Simple social media scheduling and analytics',
      profiles: 0
    },
    {
      id: 'hootsuite',
      name: 'Hootsuite',
      icon: '🦉',
      status: 'connected',
      description: 'Comprehensive social media management',
      profiles: 5
    },
    {
      id: 'later',
      name: 'Later',
      icon: '📅',
      status: 'disconnected',
      description: 'Visual content calendar and scheduler',
      profiles: 0
    },
    {
      id: 'sprout-social',
      name: 'Sprout Social',
      icon: '🌱',
      status: 'disconnected',
      description: 'Enterprise social media management',
      profiles: 0
    },
    {
      id: 'ai_video_publisher',
      name: 'AI Video Publisher',
      icon: '🎬',
      status: 'disconnected',
      description: 'Create and publish videos with AI',
      profiles: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'pending': return 'yellow';
      case 'disconnected': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Social Media Platform Connectors</span>
          </CardTitle>
          <Button onClick={() => navigate('/connect-platforms')}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Platform
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {socialPlatforms.map(platform => (
            <div key={platform.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{platform.icon}</div>
                  <div>
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-${getStatusColor(platform.status)}-600 border-${getStatusColor(platform.status)}-300`}
                >
                  {platform.status}
                </Badge>
              </div>
              
              {platform.status === 'connected' && (
                <div className="text-sm text-green-600 mb-2">
                  ✅ {platform.profiles} social profile(s) connected
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/connect-platforms')}
              >
                {platform.status === 'connected' ? 'Manage' : 'Connect'}
              </Button>
            </div>
          ))}
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
