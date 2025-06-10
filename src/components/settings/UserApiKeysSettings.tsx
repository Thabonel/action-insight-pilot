import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Check,
  AlertCircle,
  Video,
  Share2,
  Shield,
  Brain,
  Globe,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SecretsService, SecretMetadata } from '@/lib/services/secrets-service';

interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  icon: string;
  required: boolean;
  validation?: (value: string) => boolean;
}

const UserApiKeysSettings: React.FC = () => {
  const [secrets, setSecrets] = useState<SecretMetadata[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const aiServices: ApiKeyConfig[] = [
    {
      id: 'openai_api_key',
      name: 'OpenAI API Key',
      description: 'Required for AI content generation and video script creation',
      placeholder: 'sk-...',
      icon: '🧠',
      required: true,
      validation: (value) => value.startsWith('sk-') && value.length > 20
    },
    {
      id: 'anthropic_api_key',
      name: 'Anthropic Claude API Key',
      description: 'Alternative to OpenAI for advanced reasoning and analytics',
      placeholder: 'sk-ant-...',
      icon: '🤖',
      required: false,
      validation: (value) => value.startsWith('sk-ant-') && value.length > 20
    },
    {
      id: 'json2video_api_key',
      name: 'json2video API Key',
      description: 'For automated video creation and rendering',
      placeholder: 'j2v_...',
      icon: '🎬',
      required: true,
      validation: (value) => value.length > 10
    },
    {
      id: 'blotato_api_key',
      name: 'Blotato API Key',
      description: 'For video enhancement and processing',
      placeholder: 'blt_...',
      icon: '🎥',
      required: false,
      validation: (value) => value.length > 8
    }
  ];

  const socialPlatforms: ApiKeyConfig[] = [
    {
      id: 'twitter_bearer_token',
      name: 'Twitter (X) Bearer Token',
      description: 'For posting and managing Twitter content',
      placeholder: 'AAA...',
      icon: '𝕏',
      required: false,
      validation: (value) => value.length > 50
    },
    {
      id: 'facebook_access_token',
      name: 'Facebook Access Token',
      description: 'For Facebook page management and posting',
      placeholder: 'EAA...',
      icon: '📘',
      required: false,
      validation: (value) => value.startsWith('EAA') && value.length > 50
    },
    {
      id: 'instagram_access_token',
      name: 'Instagram Access Token',
      description: 'For Instagram content publishing',
      placeholder: 'IGQ...',
      icon: '📷',
      required: false,
      validation: (value) => value.length > 30
    },
    {
      id: 'linkedin_access_token',
      name: 'LinkedIn Access Token',
      description: 'For LinkedIn company page posting',
      placeholder: 'AQX...',
      icon: '💼',
      required: false,
      validation: (value) => value.length > 30
    },
    {
      id: 'youtube_api_key',
      name: 'YouTube API Key',
      description: 'For YouTube channel management and uploads',
      placeholder: 'AIza...',
      icon: '📺',
      required: false,
      validation: (value) => value.startsWith('AIza') && value.length > 30
    },
    {
      id: 'tiktok_access_token',
      name: 'TikTok Access Token',
      description: 'For TikTok content publishing and management',
      placeholder: 'ttk_...',
      icon: '🎵',
      required: false,
      validation: (value) => value.length > 20
    }
  ];

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      setLoading(true);
      const secretsList = await SecretsService.listSecrets();
      setSecrets(secretsList);
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (serviceId: string, value: string) => {
    setSaving(prev => ({ ...prev, [serviceId]: true }));
    
    try {
      await SecretsService.saveSecret(serviceId, value);
      await fetchSecrets(); // Refresh the list
      setInputValues(prev => ({ ...prev, [serviceId]: '' }));
      
      toast({
        title: "API Key Saved",
        description: `Successfully saved ${serviceId} API key`,
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const deleteApiKey = async (serviceId: string) => {
    try {
      await SecretsService.deleteSecret(serviceId);
      await fetchSecrets(); // Refresh the list
      
      toast({
        title: "API Key Deleted",
        description: `Successfully deleted ${serviceId} API key`,
      });
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = (service: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const maskApiKey = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '*'.repeat(value.length);
    return '*'.repeat(value.length - 4) + value.slice(-4);
  };

  const validateApiKey = (config: ApiKeyConfig, value: string) => {
    if (config.required && !value) return false;
    if (value && config.validation) return config.validation(value);
    return true;
  };

  const hasSecret = (serviceId: string) => {
    return secrets.some(secret => secret.service_name === serviceId);
  };

  const getSecretMetadata = (serviceId: string) => {
    return secrets.find(secret => secret.service_name === serviceId);
  };

  const renderApiKeyRow = (config: ApiKeyConfig) => {
    const isVisible = visibleKeys[config.id];
    const isSaving = saving[config.id];
    const inputValue = inputValues[config.id] || '';
    const isValid = validateApiKey(config, inputValue);
    const hasChanges = inputValue.length > 0;
    const secretExists = hasSecret(config.id);
    const secretMeta = getSecretMetadata(config.id);

    return (
      <div key={config.id} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{config.icon}</span>
              <Label htmlFor={config.id} className="font-medium">
                {config.name}
              </Label>
              {config.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
              {secretExists && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              id={config.id}
              type={isVisible ? "text" : "password"}
              placeholder={secretExists ? "Key is saved securely" : config.placeholder}
              value={inputValue}
              onChange={(e) => setInputValues(prev => ({ ...prev, [config.id]: e.target.value }))}
              className={!isValid && inputValue ? "border-red-300" : ""}
            />
            {!isValid && inputValue && (
              <div className="flex items-center space-x-1 mt-1 text-red-600 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>Invalid format</span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleVisibility(config.id)}
            disabled={!inputValue}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            onClick={() => saveApiKey(config.id, inputValue)}
            disabled={!isValid || !hasChanges || isSaving}
          >
            {isSaving ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>

          {secretExists && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteApiKey(config.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {secretMeta && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>Last updated: {new Date(secretMeta.updated_at).toLocaleDateString()}</p>
            {secretMeta.last_used_at && (
              <p>Last used: {new Date(secretMeta.last_used_at).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>User API Keys</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>User API Keys</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Securely manage your personal API keys for AI services and social media platforms
        </p>
      </CardHeader>
      <CardContent>
        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">🔒 Secure & Encrypted</h4>
              <p className="text-sm text-green-800">
                Your API keys are encrypted with AES-GCM and only accessible to you. We never store them in plain text.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ai-services" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-services" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Services</span>
            </TabsTrigger>
            <TabsTrigger value="social-platforms" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Social Platforms</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-services" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">🧠 AI & Video Creation Tools</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    These API keys enable AI-powered content generation and video creation features.
                    OpenAI key is required for full functionality, Claude can be used as an alternative for analytics.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {aiServices.map(renderApiKeyRow)}
            </div>
          </TabsContent>

          <TabsContent value="social-platforms" className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900">📱 Social Media Platform Access</h4>
                  <p className="text-sm text-purple-800 mt-1">
                    Connect your social media accounts to enable direct posting and content management.
                    These tokens allow the platform to post on your behalf.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {socialPlatforms.map(renderApiKeyRow)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserApiKeysSettings;
