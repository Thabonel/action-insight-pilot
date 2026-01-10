import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';
import { Loader2, Sparkles, Target } from 'lucide-react';

// Valid campaign types that match database enum exactly
type ValidCampaignType = 'email' | 'social' | 'content' | 'paid_ads' | 'partnership';

const IntelligentCampaignCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as ValidCampaignType,
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
    // Validation
    if (!formData.name?.trim()) {
      toast({
        title: "Missing Information",
        description: "Campaign name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Missing Information", 
        description: "Campaign description is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate timeline dates
      const startDate = new Date();
      const endDate = new Date();
      
      switch(formData.timeline) {
        case '1_week':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case '1_month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case '3_months':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6_months':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1);
      }

      // Create campaign data object that matches database schema exactly
      const campaignData = {
        // Required fields
        name: formData.name.trim(),
        type: formData.type, // This now matches database enum exactly
        
        // Optional fields
        description: formData.description.trim(),
        target_audience: formData.targetAudience?.trim() || null, // Maps to snake_case column
        status: 'draft' as const,
        
        // Budget fields
        total_budget: formData.budget ? parseFloat(formData.budget) : 0,
        budget_allocated: formData.budget ? parseFloat(formData.budget) : 0,
        budget_spent: 0,
        
        // Channel fields - set both required channel and channels array
        channel: formData.type, // Required single channel field
        channels: [formData.type], // JSONB array field
        
        // Dates as proper ISO strings
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        
        // Additional fields with proper defaults
        primary_objective: `${formData.type} campaign: ${formData.description}`,
        
        // JSONB fields with proper structure
        demographics: {},
        kpi_targets: {
          revenue: '',
          leads: '',
          conversion: '',
          roi: '',
          impressions: '',
          clicks: ''
        },
        budget_breakdown: {
          media: '',
          content: '',
          technology: '',
          personnel: '',
          contingency: ''
        },
        compliance_checklist: {
          dataProtection: false,
          advertisingStandards: false,
          industryRegulations: false,
          termsOfService: false,
          privacyPolicy: false
        },
        content: {},
        settings: {},
        metrics: {}
      };
      
      const result = await apiClient.createCampaign(campaignData) as ApiResponse<Record<string, unknown>>;

      if (result.success && result.data) {
        toast({
          title: "Success!",
          description: `Campaign "${formData.name}" created successfully!`,
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
        console.error('Campaign creation failed:', result);
        toast({
          title: "Creation Failed",
          description: result.error || result.message || "Failed to create campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast({
        title: "Error",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
            <span>Campaign Creator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type *</label>
              <Select 
                value={formData.type} 
                onValueChange={(value: ValidCampaignType) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="content">Content Marketing</SelectItem>
                  <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your campaign goals and objectives"
              required
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
                min="0"
                step="0.01"
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
                Create Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentCampaignCreator;