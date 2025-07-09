import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CampaignBrief {
  businessGoal: string;
  targetAudience: string;
  campaignType: string;
  budget: string;
  timeline: string;
}

const CampaignBriefGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<CampaignBrief>({
    businessGoal: '',
    targetAudience: '',
    campaignType: '',
    budget: '',
    timeline: ''
  });

  const updateBrief = (field: keyof CampaignBrief, value: string) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const isComplete = Object.values(brief).every(value => value.trim() !== '');

  const handleGenerateFullCampaign = async () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Brief",
        description: "Please fill in all fields before generating a campaign.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, navigate to the regular campaign creation with some pre-filled data
    // In the future, this would call an AI service to generate a complete campaign
    const searchParams = new URLSearchParams({
      brief: JSON.stringify(brief),
      mode: 'ai-generated'
    });
    
    navigate(`/app/campaigns/new?${searchParams.toString()}`);
    
    toast({
      title: "AI Campaign Generated",
      description: "Your campaign strategy has been created! Review and customize as needed.",
    });
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Wand2 className="h-6 w-6 text-purple-600" />
          AI Campaign Generator
        </div>
        <p className="text-gray-600">
          Answer 5 simple questions and let our AI create a complete marketing campaign for you
        </p>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Sparkles className="h-3 w-3 mr-1" />
          Phase 0: Quick Win Implementation
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessGoal">What's your main business goal? *</Label>
            <Textarea
              id="businessGoal"
              value={brief.businessGoal}
              onChange={(e) => updateBrief('businessGoal', e.target.value)}
              placeholder="e.g., Increase sales of our new product by 30% in Q1"
              rows={2}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Who is your target audience? *</Label>
            <Textarea
              id="targetAudience"
              value={brief.targetAudience}
              onChange={(e) => updateBrief('targetAudience', e.target.value)}
              placeholder="e.g., Small business owners aged 25-45 in North America"
              rows={2}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="campaignType">What type of campaign do you want? *</Label>
            <Select value={brief.campaignType} onValueChange={(value) => updateBrief('campaignType', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Marketing</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="content">Content Marketing</SelectItem>
                <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                <SelectItem value="lead_generation">Lead Generation</SelectItem>
                <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                <SelectItem value="product_launch">Product Launch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="budget">What's your total budget? *</Label>
            <Input
              id="budget"
              value={brief.budget}
              onChange={(e) => updateBrief('budget', e.target.value)}
              placeholder="e.g., $10,000"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="timeline">What's your timeline? *</Label>
            <Input
              id="timeline"
              value={brief.timeline}
              onChange={(e) => updateBrief('timeline', e.target.value)}
              placeholder="e.g., 3 months, Launch in January"
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button 
          onClick={handleGenerateFullCampaign}
          disabled={!isComplete || loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
          size="lg"
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Generating Your Campaign...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Complete Campaign with AI
            </>
          )}
        </Button>

        {!isComplete && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Complete all fields to generate your AI campaign
          </div>
        )}

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/campaigns/new')}
            className="text-gray-600"
          >
            Create Campaign Manually Instead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignBriefGenerator;