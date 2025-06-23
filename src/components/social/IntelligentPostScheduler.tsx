
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient, ContentBrief } from '@/lib/api-client';
import { Loader2, Share2 } from 'lucide-react';

const IntelligentPostScheduler: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState({
    title: '',
    platform: 'twitter',
    audience: '',
    tone: 'professional',
    keywords: []
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | string[]) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setBrief(prev => ({ ...prev, keywords }));
  };

  const generatePost = async () => {
    if (!brief.title || !brief.audience) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and target audience",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Generating social post with brief:', brief);
      
      // Convert to ContentBrief format
      const contentBrief: ContentBrief = {
        title: brief.title,
        content_type: 'social_media',
        target_audience: brief.audience,
        key_messages: [brief.title],
        platform: brief.platform,
        tone: brief.tone,
        keywords: brief.keywords
      };
      
      const result = await apiClient.generateContent(contentBrief);
      
      if (result.success && result.data) {
        setGeneratedContent(result.data.content || 'Social post generated successfully');
        toast({
          title: "Post Generated",
          description: "Social media post has been created successfully!",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Post generation error:', error);
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
            <Share2 className="h-5 w-5" />
            <span>Intelligent Post Scheduler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Post Topic</Label>
              <Input
                id="title"
                value={brief.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What's your post about?"
              />
            </div>
            
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={brief.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
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
            <Label htmlFor="tone">Tone</Label>
            <Select value={brief.tone} onValueChange={(value) => handleInputChange('tone', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="inspiring">Inspiring</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={brief.keywords.join(', ')}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              placeholder="Enter relevant keywords"
            />
          </div>

          <Button onClick={generatePost} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Generate Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Social Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button variant="outline">Edit Post</Button>
              <Button>Schedule Post</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentPostScheduler;
