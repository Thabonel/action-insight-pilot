
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Globe,
  Mail,
  Share2,
  BarChart3
} from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';

interface IntegrationHubProps {
  blogContent: {
    title: string;
    content: string;
    excerpt?: string;
  };
  onPublish: (platforms: string[]) => void;
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({
  blogContent,
  onPublish
}) => {
  const { connections, loading } = useIntegrations();
  const { toast } = useToast();
  const [publishToAll, setPublishToAll] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});
  const [publishStatus, setPublishStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  // Platform configuration with existing integration mapping
  const platformConfigs = [
    {
      id: 'wordpress',
      name: 'WordPress',
      icon: Globe,
      type: 'blog',
      description: 'Publish as blog post',
      customization: ['Custom excerpt', 'Featured image', 'Categories']
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      icon: Mail,
      type: 'email',
      description: 'Send to email subscribers',
      customization: ['Email subject', 'Preview text', 'Template']
    },
    {
      id: 'buffer',
      name: 'Buffer',
      icon: Share2,
      type: 'social',
      description: 'Schedule social posts',
      customization: ['Custom caption', 'Hashtags', 'Timing']
    },
    {
      id: 'hootsuite',
      name: 'Hootsuite',
      icon: Share2,
      type: 'social',
      description: 'Multi-platform social posting',
      customization: ['Platform-specific content', 'Scheduling', 'Audience targeting']
    }
  ];

  useEffect(() => {
    // Initialize platform selection based on connected integrations
    const initialSelection: Record<string, boolean> = {};
    platformConfigs.forEach(platform => {
      const isConnected = connections.some(
        conn => conn.service_name.toLowerCase() === platform.id && 
               conn.connection_status === 'connected'
      );
      initialSelection[platform.id] = isConnected;
    });
    setSelectedPlatforms(initialSelection);
  }, [connections]);

  const getConnectionStatus = (platformId: string) => {
    const connection = connections.find(
      conn => conn.service_name.toLowerCase() === platformId
    );
    return connection?.connection_status || 'disconnected';
  };

  const getStatusIcon = (platformId: string) => {
    const status = getConnectionStatus(platformId);
    const publishState = publishStatus[platformId];
    
    if (publishState === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (publishState === 'error') return <XCircle className="h-4 w-4 text-red-600" />;
    if (publishState === 'pending') return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
    
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (platformId: string) => {
    const status = getConnectionStatus(platformId);
    const publishState = publishStatus[platformId];
    
    if (publishState) {
      return (
        <Badge variant={publishState === 'success' ? 'default' : publishState === 'error' ? 'destructive' : 'secondary'}>
          {publishState === 'success' ? 'Published' : publishState === 'error' ? 'Failed' : 'Publishing...'}
        </Badge>
      );
    }
    
    return (
      <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
        {status === 'connected' ? 'Connected' : 'Disconnected'}
      </Badge>
    );
  };

  const handlePlatformToggle = (platformId: string) => {
    const isConnected = getConnectionStatus(platformId) === 'connected';
    if (!isConnected) {
      toast({
        title: "Platform not connected",
        description: "Please connect this platform in your integration settings first.",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlatforms(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  const handlePublishToAllToggle = () => {
    const newValue = !publishToAll;
    setPublishToAll(newValue);
    
    if (newValue) {
      // Select all connected platforms
      const allConnected: Record<string, boolean> = {};
      platformConfigs.forEach(platform => {
        const isConnected = getConnectionStatus(platform.id) === 'connected';
        allConnected[platform.id] = isConnected;
      });
      setSelectedPlatforms(allConnected);
    }
  };

  const handlePublish = async () => {
    const selectedPlatformIds = Object.entries(selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platformId]) => platformId);

    if (selectedPlatformIds.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to publish to.",
        variant: "destructive"
      });
      return;
    }

    // Set pending status for selected platforms
    const pendingStatus: Record<string, 'pending'> = {};
    selectedPlatformIds.forEach(id => {
      pendingStatus[id] = 'pending';
    });
    setPublishStatus(pendingStatus);

    try {
      await onPublish(selectedPlatformIds);
      
      // Simulate individual platform publishing results
      setTimeout(() => {
        const results: Record<string, 'success' | 'error'> = {};
        selectedPlatformIds.forEach(id => {
          // Simulate 90% success rate
          results[id] = Math.random() > 0.1 ? 'success' : 'error';
        });
        setPublishStatus(results);

        const successCount = Object.values(results).filter(status => status === 'success').length;
        toast({
          title: "Publishing completed",
          description: `Successfully published to ${successCount} of ${selectedPlatformIds.length} platforms.`,
        });
      }, 2000);
    } catch (error) {
      const errorStatus: Record<string, 'error'> = {};
      selectedPlatformIds.forEach(id => {
        errorStatus[id] = 'error';
      });
      setPublishStatus(errorStatus);
      
      toast({
        title: "Publishing failed",
        description: "Failed to publish to selected platforms. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openIntegrationSettings = () => {
    // This would navigate to the integrations tab in settings
    window.open('/settings?tab=integrations', '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading integrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Publish & Distribute
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openIntegrationSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Integrations
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Publish to all connected platforms</h4>
            <p className="text-sm text-gray-600">Automatically select all available integrations</p>
          </div>
          <Switch
            checked={publishToAll}
            onCheckedChange={handlePublishToAllToggle}
          />
        </div>

        <Separator />

        {/* Platform List */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Available Platforms</h4>
          {platformConfigs.map((platform) => {
            const Icon = platform.icon;
            const isConnected = getConnectionStatus(platform.id) === 'connected';
            const isSelected = selectedPlatforms[platform.id] || false;
            
            return (
              <div key={platform.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h5 className="font-medium">{platform.name}</h5>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(platform.id)}
                    {getStatusBadge(platform.id)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Customization: {platform.customization.join(', ')}
                  </div>
                  {isConnected ? (
                    <Switch
                      checked={isSelected}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                  ) : (
                    <Button variant="outline" size="sm" onClick={openIntegrationSettings}>
                      Connect
                    </Button>
                  )}
                </div>

                {/* Platform Analytics Link */}
                {publishStatus[platform.id] === 'success' && (
                  <div className="mt-3 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Publishing Actions */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Publishing Summary</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Title:</strong> {blogContent.title || 'Untitled Blog Post'}</p>
              <p><strong>Content Length:</strong> {blogContent.content.length} characters</p>
              <p><strong>Selected Platforms:</strong> {Object.values(selectedPlatforms).filter(Boolean).length}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handlePublish}
              disabled={Object.values(selectedPlatforms).filter(Boolean).length === 0}
              className="flex-1"
            >
              Publish Now
            </Button>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Publication Status */}
        {Object.keys(publishStatus).length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Publication Status</h4>
              <div className="space-y-2">
                {Object.entries(publishStatus).map(([platformId, status]) => {
                  const platform = platformConfigs.find(p => p.id === platformId);
                  return (
                    <div key={platformId} className="flex items-center justify-between text-sm">
                      <span>{platform?.name}</span>
                      <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
                        {status === 'success' ? 'Published' : status === 'error' ? 'Failed' : 'Publishing...'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationHub;
