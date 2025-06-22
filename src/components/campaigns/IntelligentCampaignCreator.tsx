
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient, type CreateCampaignData } from '@/lib/api-client';
import { Sparkles, Target, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';

const IntelligentCampaignCreator: React.FC = () => {
  const [campaign, setCampaign] = useState<Partial<CreateCampaignData>>({
    name: '',
    type: '',
    description: '',
    budget: '',
    targetAudience: '',
    timeline: '',
    channel: '',
    status: 'draft'
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof CreateCampaignData, value: string) => {
    setCampaign(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCampaign = async () => {
    // Validate required fields
    if (!campaign.name || !campaign.type || !campaign.description || !campaign.budget || !campaign.targetAudience || !campaign.timeline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create complete campaign data with required fields
      const campaignData: CreateCampaignData = {
        name: campaign.name,
        type: campaign.type,
        description: campaign.description,
        budget: campaign.budget,
        targetAudience: campaign.targetAudience,
        timeline: campaign.timeline,
        channel: campaign.channel || 'multi-channel',
        status: campaign.status || 'draft'
      };

      const response = await apiClient.createCampaign(campaignData);
      if (response.success) {
        toast({
          title: "Campaign Created",
          description: "Your intelligent campaign has been created successfully!",
        });
        // Reset form
        setCampaign({
          name: '',
          type: '',
          description: '',
          budget: '',
          targetAudience: '',
          timeline: '',
          channel: '',
          status: 'draft'
        });
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Intelligent Campaign Creator
          </CardTitle>
          <CardDescription>
            Create data-driven campaigns with AI-powered insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Campaign Name
              </Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={campaign.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-type">Campaign Type</Label>
              <Select
                value={campaign.type || ''}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Marketing</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="content">Content Marketing</SelectItem>
                  <SelectItem value="ppc">Pay-Per-Click</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals and strategy"
              value={campaign.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget
              </Label>
              <Input
                id="budget"
                placeholder="e.g., $5,000"
                value={campaign.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </Label>
              <Select
                value={campaign.timeline || ''}
                onValueChange={(value) => handleInputChange('timeline', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-audience" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target Audience
              </Label>
              <Input
                id="target-audience"
                placeholder="e.g., Young professionals 25-35"
                value={campaign.targetAudience || ''}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Primary Channel</Label>
              <Select
                value={campaign.channel || ''}
                onValueChange={(value) => handleInputChange('channel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="search">Search Engine</SelectItem>
                  <SelectItem value="display">Display Advertising</SelectItem>
                  <SelectItem value="multi-channel">Multi-Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateCampaign}
              disabled={isCreating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Create Intelligent Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentCampaignCreator;
