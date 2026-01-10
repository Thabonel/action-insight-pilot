
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialPlatform, PlatformConnection, PlatformConfig } from '@/types/socialConnectors';

interface PlatformSelectorProps {
  platforms: PlatformConfig[];
  connections: PlatformConnection[];
  onPlatformSelect: (platform: SocialPlatform) => void;
  onDisconnect: (platform: SocialPlatform) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  platforms,
  connections,
  onPlatformSelect,
  onDisconnect
}) => {
  const getConnectionStatus = (platform: SocialPlatform) => {
    return connections.find(c => c.platform === platform);
  };

  const getStatusColor = (connection?: PlatformConnection) => {
    if (!connection) return 'gray';
    return connection.isConnected ? 'green' : 'yellow';
  };

  const getStatusText = (connection?: PlatformConnection) => {
    if (!connection) return 'Not Connected';
    return connection.isConnected ? 'Connected' : 'Pending';
  };


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Social Media Platform</h2>
        <p className="text-gray-600">
          Connect with your existing social media management tools to enhance your AI-powered workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const connection = getConnectionStatus(platform.id);

          return (
            <Card key={platform.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{platform.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-${getStatusColor(connection)}-600 border-${getStatusColor(connection)}-300`}
                    >
                      {getStatusText(connection)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {platform.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Supported Networks */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Supported Networks</h4>
                  <div className="flex flex-wrap gap-1">
                    {platform.supportedNetworks.map((network) => (
                      <Badge key={network} variant="outline" className="text-xs">
                        {network}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pricing Info */}
                {platform.pricingInfo && (
                  <div className="text-sm text-gray-600">
                    💰 {platform.pricingInfo}
                  </div>
                )}

                {/* Connection Status & Actions */}
                {connection?.isConnected ? (
                  <div className="space-y-2">
                    <div className="text-sm text-green-600 font-medium">
                      ✅ Connected • {connection.profiles.length} profile(s)
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDisconnect(platform.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => onPlatformSelect(platform.id)}
                    >
                      Connect {platform.name}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Why Connect Your Existing Tools?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep using the interface you're familiar with</li>
                <li>• Our AI enhances your existing workflow, doesn't replace it</li>
                <li>• Seamlessly push AI-generated content to your preferred platform</li>
                <li>• Maintain your current team collaboration and approval processes</li>
                <li>• Access advanced analytics from your existing tool</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSelector;
