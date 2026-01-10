
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, ContentBrief } from '@/lib/api-client-interface';

const IntelligentContentGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<ContentBrief>({
    topic: '',
    audience: '',
    tone: '',
    platform: 'website',
    length: 'medium',
    title: '',
    content_type: 'blog_post',
    target_audience: '',
    key_messages: []
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (field: keyof ContentBrief, value: string | string[]) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyMessagesChange = (value: string) => {
    const messages = value.split('\n').filter(msg => msg.trim());
    setBrief(prev => ({ ...prev, key_messages: messages }));
  };

  const generateContent = async () => {
    if (!brief.title || !brief.target_audience) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and target audience",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Generating content with brief:', brief);
      
      // Create a proper ContentBrief that matches the interface
      const contentBrief: ContentBrief = {
        topic: brief.title || '',
        audience: brief.target_audience || '',
        tone: brief.tone || 'professional',
        platform: brief.platform,
        length: brief.length,
        keywords: brief.keywords,
        title: brief.title,
        target_audience: brief.target_audience,
        content_type: brief.content_type,
        key_messages: brief.key_messages
      };
      
      const result = await apiClient.generateContent(contentBrief) as ApiResponse<{ content?: string }>;
      
      if (result.success && result.data) {
        setGeneratedContent(result.data.content || 'Content generated successfully');
        toast({
          title: "Content Generated",
          description: "AI-powered content has been created successfully!",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate content",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Content generation error:', error);
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
            <span>Intelligent Content Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={brief.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter content title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <Select value={brief.content_type} onValueChange={(value) => handleInputChange('content_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Audience</label>
            <Input
              value={brief.target_audience || ''}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              placeholder="Describe your target audience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Key Messages (one per line)</label>
            <Textarea
              rows={4}
              value={Array.isArray(brief.key_messages) ? brief.key_messages.join('\n') : ''}
              onChange={(e) => handleKeyMessagesChange(e.target.value)}
              placeholder="Enter key messages, one per line"
            />
          </div>

          <Button onClick={generateContent} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Content'}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
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

export default IntelligentContentGenerator;
