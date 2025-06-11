
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Share2, Settings, ExternalLink, Loader2 } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  icon: string;
  connectMethod: (apiKey: string) => Promise<any>;
}

const SocialPlatformConnectors: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { connectService } = useIntegrations();

  const platforms: SocialPlatform[] = [
    {
      id: 'buffer',
      name: 'Buffer',
      description: 'Schedule and publish content across social platforms',
      status: 'disconnected',
      icon: '📊',
      connectMethod: (apiKey: string) => apiClient.integrations.connectBuffer(apiKey)
    },
    {
      id: 'hootsuite',
      name: 'Hootsuite',
      description: 'Enterprise social media management',
      status: 'disconnected',
      icon: '🦉',
      connectMethod: (apiKey: string) => apiClient.integrations.connectHootsuite(apiKey)
    },
    {
      id: 'later',
      name: 'Later',
      description: 'Visual content calendar and publishing',
      status: 'disconnected',
      icon: '📅',
      connectMethod: (apiKey: string) => apiClient.integrations.connectLater(apiKey)
    },
    {
      id: 'sprout_social',
      name: 'Sprout Social',
      description: 'Complete social media management platform',
      status: 'disconnected',
      icon: '🌱',
      connectMethod: (apiKey: string) => apiClient.integrations.connectSproutSocial(apiKey)
    },
    {
      id: 'video_publisher',
      name: 'AI Video Publisher',
      description: 'AI-powered video content generation and publishing',
      status: 'disconnected',
      icon: '🎥',
      connectMethod: (apiKey: string) => apiClient.integrations.connectVideoPublisher(apiKey)
    }
  ];

  const handleConnect = async (platform: SocialPlatform) => {
    const apiKey = apiKeys[platform.id];
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to connect",
        variant: "destructive",
      });
      return;
    }

    setConnecting(prev => new Set(prev).add(platform.id));
    try {
      await platform.connectMethod(apiKey);
      setApiKeys(prev => ({ ...prev, [platform.id]: '' }));
    } catch (error) {
      console.error(`Failed to connect to ${platform.name}:`, error);
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform.id);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'gray';
      default: return 'gray';
    }
  };

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
          {platforms.map(platform => (
            <div key={platform.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <h3 className="font-medium">{platform.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-${getStatusColor(platform.status)}-600 border-${getStatusColor(platform.status)}-300`}
                    >
                      {platform.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{platform.description}</p>
              
              {platform.status === 'disconnected' ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Connect</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect to {platform.name}</DialogTitle>
                      <DialogDescription>
                        Enter your {platform.name} API key to connect and start publishing content.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`${platform.id}-api-key`}>API Key</Label>
                        <Input
                          id={`${platform.id}-api-key`}
                          type="password"
                          placeholder="Enter your API key"
                          value={apiKeys[platform.id] || ''}
                          onChange={(e) => setApiKeys(prev => ({ 
                            ...prev, 
                            [platform.id]: e.target.value 
                          }))}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleConnect(platform)}
                          disabled={connecting.has(platform.id) || !apiKeys[platform.id]}
                          className="flex-1"
                        >
                          {connecting.has(platform.id) ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                        <Button variant="outline" asChild>
                          <a 
                            href={`https://${platform.name.toLowerCase()}.com/developers`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline">Disconnect</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialPlatformConnectors;
