
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';
import { Loader2, Mail } from 'lucide-react';

interface CampaignBrief {
  subject: string;
  audience: string;
  goal: string;
  tone: string;
  keyPoints: string[];
}

const IntelligentCampaignBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<CampaignBrief>({
    subject: '',
    audience: '',
    goal: '',
    tone: 'professional',
    keyPoints: []
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (field: keyof CampaignBrief, value: string | string[]) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPointsChange = (value: string) => {
    const points = value.split('\n').filter(point => point.trim());
    setBrief(prev => ({ ...prev, keyPoints: points }));
  };

  const generateCampaign = async () => {
    if (!brief.subject || !brief.audience || !brief.goal) {
      toast({
        title: "Missing Information",
        description: "Please provide subject, audience, and goal",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Generating email campaign with brief:', brief);
      const briefText = `Subject: ${brief.subject}, Audience: ${brief.audience}, Goal: ${brief.goal}, Tone: ${brief.tone}, Key Points: ${brief.keyPoints.join(', ')}`;
      const result = await apiClient.generateEmailContent(briefText) as ApiResponse<{ content?: string }>;

      if (result.success && result.data) {
        setGeneratedContent(result.data.content || 'Email content generated successfully');
        toast({
          title: "Campaign Generated",
          description: "Email campaign content has been created successfully!",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Campaign generation error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
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
            <Mail className="h-5 w-5" />
            <span>Intelligent Email Campaign Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={brief.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter email subject line"
              />
            </div>
            
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={brief.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              value={brief.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              placeholder="Describe your target audience"
            />
          </div>

          <div>
            <Label htmlFor="goal">Campaign Goal</Label>
            <Input
              id="goal"
              value={brief.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              placeholder="What do you want to achieve?"
            />
          </div>

          <div>
            <Label htmlFor="keyPoints">Key Points (one per line)</Label>
            <Textarea
              id="keyPoints"
              rows={4}
              value={brief.keyPoints.join('\n')}
              onChange={(e) => handleKeyPointsChange(e.target.value)}
              placeholder="Enter key messages, one per line"
            />
          </div>

          <Button onClick={generateCampaign} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Generate Email Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Email Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentCampaignBuilder;
