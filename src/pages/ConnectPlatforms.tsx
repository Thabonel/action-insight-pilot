
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Zap,
  Users,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { SocialPlatform, PlatformConnection, PlatformConfig } from '@/types/socialConnectors';
import { useToast } from '@/hooks/use-toast';
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
import PlatformSelector from '@/components/socialConnectors/PlatformSelector';
import ConnectedAccountsDashboard from '@/components/socialConnectors/ConnectedAccountsDashboard';
import OAuthHandler from '@/components/socialConnectors/OAuthHandler';

const ConnectPlatforms: React.FC = () => {
  const [activeTab, setActiveTab] = useState('select');
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const platformConfigs: PlatformConfig[] = [
    {
      id: SocialPlatform.BUFFER,
      name: 'Buffer',
      description: 'Simple social media scheduling and analytics',
      icon: '📊',
      color: 'blue',
      features: ['Post Scheduling', 'Analytics', 'Team Collaboration', 'Multi-Platform'],
      supportedNetworks: ['Twitter', 'Facebook', 'LinkedIn', 'Instagram', 'Pinterest'],
      pricingInfo: 'Free plan available'
    },
    {
      id: SocialPlatform.HOOTSUITE,
      name: 'Hootsuite',
      description: 'Comprehensive social media management platform',
      icon: '🦉',
      color: 'indigo',
      features: ['Advanced Scheduling', 'Team Management', 'Social Listening', 'Reports'],
      supportedNetworks: ['Twitter', 'Facebook', 'LinkedIn', 'Instagram', 'YouTube', 'Pinterest'],
      pricingInfo: '30-day free trial'
    },
    {
      id: SocialPlatform.LATER,
      name: 'Later',
      description: 'Visual content calendar and Instagram scheduler',
      icon: '📅',
      color: 'pink',
      features: ['Visual Calendar', 'Auto-Posting', 'Link in Bio', 'User-Generated Content'],
      supportedNetworks: ['Instagram', 'Facebook', 'Twitter', 'Pinterest', 'TikTok'],
      pricingInfo: 'Free plan available'
    },
    {
      id: SocialPlatform.SPROUT_SOCIAL,
      name: 'Sprout Social',
      description: 'Enterprise social media management and analytics',
      icon: '🌱',
      color: 'green',
      features: ['Advanced Analytics', 'Social CRM', 'Team Workflows', 'Social Listening'],
      supportedNetworks: ['Twitter', 'Facebook', 'LinkedIn', 'Instagram', 'Pinterest'],
      pricingInfo: '30-day free trial'
    },
    {
      id: SocialPlatform.AI_VIDEO_PUBLISHER,
      name: 'AI Video Publisher',
      description: 'Create and publish videos with AI',
      icon: '🎬',
      color: 'purple',
      features: ['Auto Video Creation', 'Multiplatform Publishing', 'AI Optimization'],
      supportedNetworks: ['YouTube', 'TikTok', 'Instagram'],
      pricingInfo: 'Free during beta'
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      // This would call your API to get existing connections
      const response = await fetch('/api/social-connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handlePlatformSelect = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setActiveTab('connect');
  };

  const handleConnectionSuccess = (connection: PlatformConnection) => {
    setConnections(prev => [...prev.filter(c => c.platform !== connection.platform), connection]);
    setActiveTab('dashboard');
    toast({
      title: "Platform Connected!",
      description: `Successfully connected your ${connection.platform} account.`,
    });
  };

  const handleConnectionError = (error: string) => {
    toast({
      title: "Connection Failed",
      description: error,
      variant: "destructive",
    });
  };

  const disconnectPlatform = async (platform: SocialPlatform) => {
    try {
      const response = await fetch(`/api/social-connections/${platform}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setConnections(prev => prev.filter(c => c.platform !== platform));
        toast({
          title: "Platform Disconnected",
          description: `Your ${platform} account has been disconnected.`,
        });
      }
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect platform. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (platform: SocialPlatform) => {
    return connections.find(c => c.platform === platform);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Your Social Media Tools</h1>
          <p className="text-gray-600 mt-2">
            Integrate with your existing social media management platforms to enhance your workflow
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadConnections}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setActiveTab('select')}>
            <Zap className="h-4 w-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Connected Platforms</p>
                <p className="text-2xl font-bold">{connections.filter(c => c.isConnected).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Social Profiles</p>
                <p className="text-2xl font-bold">
                  {connections.reduce((total, conn) => total + conn.profiles.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Posts This Month</p>
                <p className="text-2xl font-bold">248</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold">6.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="select">Select Platform</TabsTrigger>
          <TabsTrigger value="connect">Connect Account</TabsTrigger>
          <TabsTrigger value="dashboard">Connected Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          <PlatformSelector
            platforms={platformConfigs}
            connections={connections}
            onPlatformSelect={handlePlatformSelect}
            onDisconnect={disconnectPlatform}
          />
        </TabsContent>

        <TabsContent value="connect" className="space-y-6">
          {selectedPlatform && (
            <OAuthHandler
              platform={selectedPlatform}
              platformConfig={platformConfigs.find(p => p.id === selectedPlatform)!}
              onSuccess={handleConnectionSuccess}
              onError={handleConnectionError}
              isConnecting={isConnecting}
              setIsConnecting={setIsConnecting}
            />
          )}
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <ConnectedAccountsDashboard
            connections={connections}
            onDisconnect={disconnectPlatform}
            onRefresh={loadConnections}
          />
        </TabsContent>
      </Tabs>
      <FloatingHelpButton helpSection="connectPlatforms" />
    </div>
  );
};

export default ConnectPlatforms;
