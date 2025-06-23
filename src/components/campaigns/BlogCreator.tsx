
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient, BlogPost, BlogPostParams } from '@/lib/api-client';
import { AIWritingAssistant } from '@/components/ai/AIWritingAssistant';
import { FileText, Wand2, Save, Eye } from 'lucide-react';

const BlogCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic and target audience",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const params: BlogPostParams = {
        title,
        topic,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        tone,
        length: 'medium',
        target_audience: targetAudience
      };

      const result = await apiClient.generateBlogPost(params);
      
      if (result.success && result.data) {
        setGeneratedPost(result.data);
        setTitle(result.data.title);
        setContent(result.data.content);
        toast({
          title: "Blog Post Generated",
          description: "AI has created your blog post draft",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate blog post",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: "Missing Content",
        description: "Please provide a title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await apiClient.createContent({
        title,
        content,
        type: 'blog_post',
        status: 'draft'
      });

      if (result.success) {
        toast({
          title: "Blog Post Saved",
          description: "Your blog post has been saved as a draft",
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isAssistantVisible ? 'mr-80' : ''}`}>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Blog Creator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsAssistantVisible(!isAssistantVisible)}
                variant="outline"
                size="sm"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Writing Assistant
              </Button>
              <Button onClick={handleSave} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Generation Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Post Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="What's your blog post about?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    placeholder="Who are you writing for?"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  placeholder="SEO keywords for your post"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {['professional', 'casual', 'friendly', 'authoritative', 'conversational'].map((toneOption) => (
                    <Badge
                      key={toneOption}
                      variant={tone === toneOption ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setTone(toneOption)}
                    >
                      {toneOption}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Blog Post'}
              </Button>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your blog post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Start writing your blog post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] resize-none"
                />
              </div>

              {generatedPost && (
                <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">SEO Score:</span>
                      <span className="ml-2">{generatedPost.seo_score || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Readability:</span>
                      <span className="ml-2">{generatedPost.readability_score || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Writing Assistant Sidebar */}
      <AIWritingAssistant
        content={content}
        onContentUpdate={setContent}
        isVisible={isAssistantVisible}
        onToggle={() => setIsAssistantVisible(!isAssistantVisible)}
      />
    </div>
  );
};

export default BlogCreator;
