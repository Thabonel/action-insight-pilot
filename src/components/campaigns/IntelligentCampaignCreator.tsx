
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Wand2, Target, Calendar, DollarSign } from 'lucide-react';

const IntelligentCampaignCreator: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    channel: '',
    description: '',
    budget: '',
    targetAudience: '',
    timeline: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const campaignTypes = [
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'conversion', label: 'Conversion' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'retention', label: 'Customer Retention' }
  ];

  const channels = [
    { value: 'email', label: 'Email Marketing' },
    { value: 'social', label: 'Social Media' },
    { value: 'content', label: 'Content Marketing' },
    { value: 'paid', label: 'Paid Advertising' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.type || !formData.channel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const campaignData = {
        name: formData.name,
        type: formData.type,
        channel: formData.channel,
        status: 'draft',
        description: formData.description
      };

      const response = await apiClient.createCampaign(campaignData);
      
      if (response.success) {
        toast({
          title: "Campaign Created",
          description: `"${formData.name}" has been created successfully`,
        });
        
        // Reset form
        setFormData({
          name: '',
          type: '',
          channel: '',
          description: '',
          budget: '',
          targetAudience: '',
          timeline: ''
        });
      } else {
        throw new Error(response.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : 'Failed to create campaign',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="h-6 w-6 text-purple-600" />
          <span>Intelligent Campaign Creator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <Label htmlFor="type">Campaign Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="channel">Channel *</Label>
              <Select value={formData.channel} onValueChange={(value) => handleInputChange('channel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Enter budget amount"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your campaign goals and strategy"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="Define your target audience"
                  rows={2}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 3 months, Q1 2025"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            onClick={handleCreateCampaign}
            disabled={isCreating}
            className="px-8"
          >
            {isCreating ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentCampaignCreator;
