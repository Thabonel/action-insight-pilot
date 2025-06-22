
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Loader2, Sparkles, TestTube, Clock } from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  audience: string;
  template: string;
  status: string;
}

const IntelligentCampaignBuilder: React.FC = () => {
  const [campaign, setCampaign] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    content: '',
    audience: '',
    template: '',
    status: 'draft'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [isSuggestingTime, setIsSuggestingTime] = useState(false);
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);
  const [suggestedTime, setSuggestedTime] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (field: keyof EmailCampaign, value: string) => {
    setCampaign(prev => ({ ...prev, [field]: value }));
  };

  const generateEmailContent = async () => {
    if (!campaign.template || !campaign.audience || !campaign.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in campaign name, template, and audience before generating content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const contentData = JSON.stringify({
        template: campaign.template,
        audience: campaign.audience,
        campaign_name: campaign.name
      });
      
      const response = await apiClient.generateEmailContent(contentData);
      if (response.success && response.data) {
        setCampaign(prev => ({
          ...prev,
          subject: response.data.subject || prev.subject,
          content: response.data.content || prev.content
        }));
        toast({
          title: "Content Generated",
          description: "AI has generated email content for your campaign!",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate email content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateABVariants = async () => {
    if (!campaign.subject || !campaign.content) {
      toast({
        title: "Missing Content",
        description: "Please generate or enter email content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVariants(true);
    try {
      const variantData = JSON.stringify({
        audience: campaign.audience,
        campaign_type: 'email',
        template: campaign.template
      });
      
      const response = await apiClient.generateABVariants(variantData);
      if (response.success && response.data) {
        setGeneratedVariants(response.data.variants || []);
        toast({
          title: "A/B Variants Generated",
          description: "Multiple email variants have been created for testing!",
        });
      }
    } catch (error) {
      toast({
        title: "Variant Generation Failed",
        description: "Failed to generate A/B variants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const suggestOptimalSendTime = async () => {
    setIsSuggestingTime(true);
    try {
      const timeData = JSON.stringify({
        audience: campaign.audience,
        campaign_type: 'email',
        template: campaign.template
      });
      
      const response = await apiClient.suggestSendTime(timeData);
      if (response.success && response.data) {
        setSuggestedTime(response.data.optimal_time || 'Tuesday 10:00 AM');
        toast({
          title: "Optimal Time Suggested",
          description: "AI has analyzed your audience to suggest the best send time!",
        });
      }
    } catch (error) {
      toast({
        title: "Time Suggestion Failed",
        description: "Failed to suggest optimal send time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTime(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Intelligent Email Campaign Builder
          </CardTitle>
          <CardDescription>
            Create high-converting email campaigns with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={campaign.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select
                value={campaign.audience || ''}
                onValueChange={(value) => handleInputChange('audience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing-customers">Existing Customers</SelectItem>
                  <SelectItem value="prospects">Prospects</SelectItem>
                  <SelectItem value="subscribers">Newsletter Subscribers</SelectItem>
                  <SelectItem value="inactive-users">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select
              value={campaign.template || ''}
              onValueChange={(value) => handleInputChange('template', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="welcome">Welcome Series</SelectItem>
                <SelectItem value="product-announcement">Product Announcement</SelectItem>
                <SelectItem value="re-engagement">Re-engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateEmailContent}
              disabled={isGenerating}
              variant="outline"
              className="flex-1 min-w-fit"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Content
            </Button>
            <Button
              onClick={generateABVariants}
              disabled={isGeneratingVariants}
              variant="outline"
              className="flex-1 min-w-fit"
            >
              {isGeneratingVariants ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              A/B Variants
            </Button>
            <Button
              onClick={suggestOptimalSendTime}
              disabled={isSuggestingTime}
              variant="outline"
              className="flex-1 min-w-fit"
            >
              {isSuggestingTime ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              Suggest Time
            </Button>
          </div>

          {suggestedTime && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Optimal Send Time:</span>
                <Badge variant="secondary">{suggestedTime}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={campaign.subject || ''}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              placeholder="Enter email content or use AI generation"
              value={campaign.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* A/B Variants Section */}
      {generatedVariants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>A/B Test Variants</CardTitle>
            <CardDescription>
              Choose variants to test against your main campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {generatedVariants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Variant {index + 1}</Badge>
                    <Button size="sm" variant="ghost">
                      Select
                    </Button>
                  </div>
                  <h4 className="font-medium mb-1">{variant.subject}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{variant.preview}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentCampaignBuilder;
