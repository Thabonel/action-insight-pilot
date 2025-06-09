
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
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  service: string;
  value: string;
  isValid: boolean;
  lastUpdated?: string;
}

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
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const aiServices: ApiKeyConfig[] = [
    {
      id: 'openai',
      name: 'OpenAI API Key',
      description: 'Required for AI content generation and video script creation',
      placeholder: 'sk-...',
      icon: '🧠',
      required: true,
      validation: (value) => value.startsWith('sk-') && value.length > 20
    },
    {
      id: 'json2video',
      name: 'json2video API Key',
      description: 'For automated video creation and rendering',
      placeholder: 'j2v_...',
      icon: '🎬',
      required: true,
      validation: (value) => value.length > 10
    },
    {
      id: 'blotato',
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
      id: 'twitter',
      name: 'Twitter (X) Bearer Token',
      description: 'For posting and managing Twitter content',
      placeholder: 'AAA...',
      icon: '𝕏',
      required: false,
      validation: (value) => value.length > 50
    },
    {
      id: 'facebook',
      name: 'Facebook Access Token',
      description: 'For Facebook page management and posting',
      placeholder: 'EAA...',
      icon: '📘',
      required: false,
      validation: (value) => value.startsWith('EAA') && value.length > 50
    },
    {
      id: 'instagram',
      name: 'Instagram Access Token',
      description: 'For Instagram content publishing',
      placeholder: 'IGQ...',
      icon: '📷',
      required: false,
      validation: (value) => value.length > 30
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Access Token',
      description: 'For LinkedIn company page posting',
      placeholder: 'AQX...',
      icon: '💼',
      required: false,
      validation: (value) => value.length > 30
    },
    {
      id: 'youtube',
      name: 'YouTube API Key',
      description: 'For YouTube channel management and uploads',
      placeholder: 'AIza...',
      icon: '📺',
      required: false,
      validation: (value) => value.startsWith('AIza') && value.length > 30
    },
    {
      id: 'tiktok',
      name: 'TikTok Access Token',
      description: 'For TikTok content publishing and management',
      placeholder: 'ttk_...',
      icon: '🎵',
      required: false,
      validation: (value) => value.length > 20
    },
    {
      id: 'snapchat',
      name: 'Snapchat OAuth Token',
      description: 'For Snapchat story and content management',
      placeholder: 'snap_...',
      icon: '👻',
      required: false,
      validation: (value) => value.length > 20
    },
    {
      id: 'pinterest',
      name: 'Pinterest OAuth Token',
      description: 'For Pinterest board and pin management',
      placeholder: 'pin_...',
      icon: '📌',
      required: false,
      validation: (value) => value.length > 20
    },
    {
      id: 'reddit',
      name: 'Reddit OAuth Token',
      description: 'For Reddit post and community management',
      placeholder: 'red_...',
      icon: '🔴',
      required: false,
      validation: (value) => value.length > 20
    }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (service: string, value: string) => {
    setSaving(prev => ({ ...prev, [service]: true }));
    
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service, api_key: value }),
      });

      if (response.ok) {
        setApiKeys(prev => ({
          ...prev,
          [service]: {
            service,
            value,
            isValid: true,
            lastUpdated: new Date().toISOString()
          }
        }));
        
        toast({
          title: "API Key Saved",
          description: `Successfully saved ${service} API key`,
        });
      } else {
        throw new Error('Failed to save API key');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [service]: false }));
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

  const renderApiKeyRow = (config: ApiKeyConfig) => {
    const currentKey = apiKeys[config.id];
    const isVisible = visibleKeys[config.id];
    const isSaving = saving[config.id];
    const [inputValue, setInputValue] = useState(currentKey?.value || '');
    const isValid = validateApiKey(config, inputValue);
    const hasChanges = inputValue !== (currentKey?.value || '');

    useEffect(() => {
      setInputValue(currentKey?.value || '');
    }, [currentKey]);

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
              {currentKey?.isValid && (
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
              placeholder={config.placeholder}
              value={isVisible ? inputValue : (inputValue ? maskApiKey(inputValue) : '')}
              onChange={(e) => setInputValue(e.target.value)}
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
        </div>

        {currentKey?.lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {new Date(currentKey.lastUpdated).toLocaleDateString()}
          </p>
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
                Your API keys are encrypted and only accessible to you. We never store them in plain text.
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
                    OpenAI and json2video keys are required for full functionality.
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
