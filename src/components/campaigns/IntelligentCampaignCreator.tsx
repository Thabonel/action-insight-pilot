
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  templateData: {
    name: string;
    type: string;
    description: string;
    budget?: string;
    targetAudience?: string;
    timeline?: string;
  };
}

interface IntelligentCampaignCreatorProps {
  onCampaignCreated: () => Promise<void>;
  selectedTemplate?: Template | null;
}

const IntelligentCampaignCreator: React.FC<IntelligentCampaignCreatorProps> = ({
  onCampaignCreated,
  selectedTemplate
}) => {
  const [formData, setFormData] = useState({
    name: selectedTemplate?.templateData.name || '',
    type: selectedTemplate?.templateData.type || '',
    description: selectedTemplate?.templateData.description || '',
    budget: selectedTemplate?.templateData.budget || '',
    targetAudience: selectedTemplate?.templateData.targetAudience || '',
    timeline: selectedTemplate?.templateData.timeline || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const campaignData = {
        ...formData,
        channel: 'multi-channel',
        status: 'active'
      };

      const response = await apiClient.createCampaign(campaignData);
      
      if (response.success) {
        toast({
          title: "Campaign Created",
          description: `Campaign "${formData.name}" has been created successfully.`
        });
        
        // Reset form
        setFormData({
          name: '',
          type: '',
          description: '',
          budget: '',
          targetAudience: '',
          timeline: ''
        });
        
        await onCampaignCreated();
      } else {
        throw new Error(response.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedTemplate ? `Create Campaign from "${selectedTemplate.name}" Template` : 'Create New Campaign'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Campaign Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Marketing</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="ppc">Pay-Per-Click</SelectItem>
                <SelectItem value="content">Content Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your campaign"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              placeholder="e.g., $5000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="e.g., Young professionals"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              placeholder="e.g., 3 months"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IntelligentCampaignCreator;
