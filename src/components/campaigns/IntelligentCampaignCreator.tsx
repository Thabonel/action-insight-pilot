
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Loader2, Sparkles, Target } from 'lucide-react';

const IntelligentCampaignCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    description: '',
    budget: '',
    targetAudience: '',
    timeline: '1_month'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createCampaign = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide campaign name and description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating campaign with data:', formData);
      
      // Convert budget to number and create campaign object
      const campaignData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        target_audience: formData.targetAudience,
        timeline: formData.timeline
      };
      
      const result = await apiClient.createCampaign(campaignData);
      
      if (result.success && result.data) {
        toast({
          title: "Campaign Created",
          description: "Your intelligent campaign has been created successfully!",
        });
        
        // Reset form
        setFormData({
          name: '',
          type: 'email',
          description: '',
          budget: '',
          targetAudience: '',
          timeline: '1_month'
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Failed to create campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Intelligent Campaign Creator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type</label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="mixed">Multi-Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your campaign goals and objectives"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget ($)</label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Enter campaign budget"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Timeline</label>
              <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_week">1 Week</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="6_months">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Audience</label>
            <Textarea
              rows={2}
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Describe your target audience demographics and interests"
            />
          </div>

          <Button onClick={createCampaign} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Campaign...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Create Intelligent Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentCampaignCreator;
