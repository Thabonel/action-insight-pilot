
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Mail, Share2, Target } from 'lucide-react';

interface CampaignTemplatesProps {
  onTemplateSelect: (templateId: string) => void;
}

const CampaignTemplates: React.FC<CampaignTemplatesProps> = ({ onTemplateSelect }) => {
  const templates = [
    {
      id: 'email-newsletter',
      title: 'Email Newsletter',
      description: 'Weekly newsletter template with engaging content blocks',
      category: 'Email',
      icon: Mail,
      tags: ['Email', 'Newsletter', 'Content']
    },
    {
      id: 'product-launch',
      title: 'Product Launch',
      description: 'Complete product launch campaign with multi-channel approach',
      category: 'Product',
      icon: Target,
      tags: ['Launch', 'Product', 'Multi-channel']
    },
    {
      id: 'social-media',
      title: 'Social Media Campaign',
      description: 'Coordinated social media posts across multiple platforms',
      category: 'Social',
      icon: Share2,
      tags: ['Social', 'Content', 'Engagement']
    },
    {
      id: 'lead-generation',
      title: 'Lead Generation',
      description: 'Capture leads with landing pages and nurture sequences',
      category: 'Lead Gen',
      icon: FileText,
      tags: ['Leads', 'Landing Page', 'Nurture']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Campaign Templates</h2>
        <p className="text-slate-600">Choose from pre-built templates to get started quickly</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{template.title}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">{template.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  onClick={() => onTemplateSelect(template.id)}
                  className="w-full"
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignTemplates;
