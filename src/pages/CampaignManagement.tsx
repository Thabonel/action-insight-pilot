
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CampaignOverview from '@/components/campaigns/CampaignOverview';
import CampaignCreator from '@/components/campaigns/CampaignCreator';
import CampaignTemplates from '@/components/campaigns/CampaignTemplates';
import BrandAmbassador from '@/components/campaigns/BrandAmbassador';
import BlogCreator from '@/components/campaigns/BlogCreator';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const CampaignManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'create' | 'templates' | 'brand-ambassador' | 'blog-creator'>('overview');

  const handleTemplateSelect = (_templateId: string) => {
    setActiveView('create');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Campaign Intelligence Hub</h1>
        <p className="text-slate-600">Manage campaigns, create content, and leverage AI-powered tools</p>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as typeof activeView)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="brand-ambassador">Brand Ambassador</TabsTrigger>
          <TabsTrigger value="blog-creator">Blog Creator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CampaignOverview />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CampaignCreator />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <CampaignTemplates onTemplateSelect={handleTemplateSelect} />
        </TabsContent>

        <TabsContent value="brand-ambassador" className="space-y-4">
          <BrandAmbassador />
        </TabsContent>

        <TabsContent value="blog-creator" className="space-y-4">
          <BlogCreator />
        </TabsContent>
      </Tabs>
      <PageHelpModal helpKey="campaigns" />
    </div>
  );
};

export default CampaignManagement;
