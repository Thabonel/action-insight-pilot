import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Loader2, Mail, Target } from 'lucide-react';

interface CampaignBrief {
  name: string;
  type: string;
  target_audience: string;
  objectives: string[];
  content_themes: string[];
  timeline: string;
}

const IntelligentCampaignBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<CampaignBrief>({
    name: '',
    type: 'email',
    target_audience: '',
    objectives: [],
    content_themes: [],
    timeline: '1_week'
  });
  const [campaignSuggestions, setCampaignSuggestions] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof CampaignBrief, value: string | string[]) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectivesChange = (value: string) => {
    const objectives = value.split('\n').filter(obj => obj.trim());
    setBrief(prev => ({ ...prev, objectives }));
  };

  const handleThemesChange = (value: string) => {
    const themes = value.split('\n').filter(theme => theme.trim());
    setBrief(prev => ({ ...prev, content_themes: themes }));
  };

  const buildCampaign = async () => {
    if (!brief.name || !brief.target_audience) {
      toast({
        title: "Missing Information",
        description: "Please provide campaign name and target audience",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Building campaign with brief:', brief);
      const result = await apiClient.generateEmailContent(brief, 'campaign');
      
      if (result.success && result.data) {
        setCampaignSuggestions(result.data);
        toast({
          title: "Campaign Built",
          description: "Intelligent campaign suggestions have been generated!",
        });
      } else {
        toast({
          title: "Build Failed",
          description: result.error || "Failed to build campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Campaign building error:', error);
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
            <Target className="h-5 w-5" />
            <span>Intelligent Campaign Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <Input
                value={brief.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type</label>
              <Select value={brief.type} onValueChange={(value) => handleInputChange('type', value)}>
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
            <label className="block text-sm font-medium mb-1">Target Audience</label>
            <Input
              value={brief.target_audience}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              placeholder="Describe your target audience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Campaign Objectives (one per line)</label>
            <Textarea
              rows={3}
              value={brief.objectives.join('\n')}
              onChange={(e) => handleObjectivesChange(e.target.value)}
              placeholder="Enter campaign objectives, one per line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content Themes (one per line)</label>
            <Textarea
              rows={3}
              value={brief.content_themes.join('\n')}
              onChange={(e) => handleThemesChange(e.target.value)}
              placeholder="Enter content themes, one per line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timeline</label>
            <Select value={brief.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_week">1 Week</SelectItem>
                <SelectItem value="2_weeks">2 Weeks</SelectItem>
                <SelectItem value="1_month">1 Month</SelectItem>
                <SelectItem value="3_months">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={buildCampaign} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Building Campaign...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Build Intelligent Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {campaignSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(campaignSuggestions, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentCampaignBuilder;
