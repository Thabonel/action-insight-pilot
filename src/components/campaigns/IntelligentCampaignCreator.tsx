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
      
      // Convert data to match your database schema properly
      const campaignData = {
        name: formData.name,
        type: formData.type as 'social_media' | 'email' | 'content' | 'paid_ads' | 'seo' | 'other',
        description: formData.description,
        status: 'draft' as const,
        
        // Budget fields that match your database
        totalBudget: formData.budget ? parseFloat(formData.budget) : 0,
        
        // Target Audience that matches your database
        targetAudience: formData.targetAudience,
        
        // Additional required fields for your database schema
        primaryObjective: `Campaign objective: ${formData.description}`,
        channels: [formData.type], // Convert type to channels array
        
        // Set timeline as proper start/end dates
        startDate: new Date().toISOString(),
        endDate: (() => {
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
          return endDate.toISOString();
        })(),
        
        // Initialize other required fields with defaults
        kpiTargets: {
          revenue: '',
          leads: '',
          conversion: '',
          roi: '',
          impressions: '',
          clicks: ''
        },
        
        budgetBreakdown: {
          media: '',
          content: '',
          technology: '',
          personnel: '',
          contingency: ''
        },
        
        demographics: {
          ageRange: '',
          location: '',
          income: '',
          interests: ''
        },
        
        complianceChecklist: {
          dataProtection: false,
          advertisingStandards: false,
          industryRegulations: false,
          termsOfService: false,
          privacyPolicy: false
        }
      };
      
      console.log('Sending campaign data to API:', campaignData);
      
      const result = await apiClient.createCampaign(campaignData) as ApiResponse<any>;
      
      console.log('API Response:', result);
      
      if (result.success && result.data) {
        toast({
          title: "Campaign Created Successfully!",
          description: `Campaign "${formData.name}" has been created and saved to your database.`,
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
        
        // Log success for debugging
        console.log('Campaign created successfully:', result.data);
        
        // Optionally refresh the page or redirect
        // window.location.reload();
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
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
              <label className="block text-sm font-medium mb-1">Campaign Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
                required
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
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="content">Content Marketing</SelectItem>
                  <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                  <SelectItem value="seo">SEO Campaign</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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