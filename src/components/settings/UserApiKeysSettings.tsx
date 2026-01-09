
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Video,
  Share2,
  Globe
} from 'lucide-react';
import LogoMarkIcon from '@/components/LogoMarkIcon';
import SecurityBanner from './api-keys/SecurityBanner';
import SectionBanner from './api-keys/SectionBanner';
import ApiKeySection from './api-keys/ApiKeySection';
import { aiServices, socialPlatforms } from './api-keys/ApiKeyConfig';
import { useApiKeys } from './api-keys/useApiKeys';

const UserApiKeysSettings: React.FC = () => {
  const {
    secrets,
    visibleKeys,
    saving,
    loading,
    inputValues,
    saveApiKey,
    deleteApiKey,
    toggleVisibility,
    handleInputChange
  } = useApiKeys();

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
        <SecurityBanner />

        <Tabs defaultValue="ai-services" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-services" className="flex items-center space-x-2">
              <LogoMarkIcon className="h-4 w-4" />
              <span>AI Services</span>
            </TabsTrigger>
            <TabsTrigger value="social-platforms" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Social Platforms</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-services" className="space-y-4">
            <SectionBanner
              icon={Video}
              title="🧠 AI & Video Creation Tools"
              description="These API keys enable AI-powered content generation and video creation features. OpenAI key is required for full functionality, Claude can be used as an alternative for analytics."
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              textColor="text-blue-900"
            />
            
            <ApiKeySection
              configs={aiServices}
              secrets={secrets}
              inputValues={inputValues}
              visibleKeys={visibleKeys}
              saving={saving}
              onInputChange={handleInputChange}
              onToggleVisibility={toggleVisibility}
              onSave={saveApiKey}
              onDelete={deleteApiKey}
            />
          </TabsContent>

          <TabsContent value="social-platforms" className="space-y-4">
            <SectionBanner
              icon={Globe}
              title="📱 Social Media Platform Access"
              description="Connect your social media accounts to enable direct posting and content management. These tokens allow the platform to post on your behalf."
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
              textColor="text-purple-900"
            />
            
            <ApiKeySection
              configs={socialPlatforms}
              secrets={secrets}
              inputValues={inputValues}
              visibleKeys={visibleKeys}
              saving={saving}
              onInputChange={handleInputChange}
              onToggleVisibility={toggleVisibility}
              onSave={saveApiKey}
              onDelete={deleteApiKey}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserApiKeysSettings;
