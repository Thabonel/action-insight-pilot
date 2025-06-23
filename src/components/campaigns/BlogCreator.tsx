
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  PenTool, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Calendar,
  Share2,
  Mic,
  CheckCircle,
  Send
} from 'lucide-react';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';
import BlogWorkflowAutomation from '@/components/blog/BlogWorkflowAutomation';
import ContentRepurposingEngine from '@/components/content/ContentRepurposingEngine';
import BrandVoiceChecker from '@/components/brand/BrandVoiceChecker';
import PublishingWorkflow from '@/components/blog/PublishingWorkflow';

const BlogCreator: React.FC = () => {
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    excerpt: '',
    keywords: '',
    targetAudience: 'general',
    tone: 'professional',
    category: 'marketing'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setBlogData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateBlogPost = async () => {
    if (!blogData.title || !blogData.keywords) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and keywords for your blog post.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedContent = `# ${blogData.title}

## Introduction

${blogData.keywords.split(',').map(keyword => keyword.trim()).join(', ')} are crucial elements in today's digital landscape. This comprehensive guide will explore how to leverage these concepts effectively for your ${blogData.targetAudience} audience.

## Key Benefits

1. **Enhanced Visibility**: Implementing these strategies can significantly improve your online presence
2. **Better Engagement**: Connect more effectively with your target audience
3. **Measurable Results**: Track and optimize your performance over time

## Best Practices

When working with ${blogData.keywords.split(',')[0]?.trim() || 'these concepts'}, it's important to:

- Focus on quality over quantity
- Maintain consistency across all platforms
- Regularly analyze and adjust your approach
- Stay updated with industry trends

## Implementation Strategy

To get started, consider the following steps:

1. **Research Phase**: Understand your audience's needs and preferences
2. **Planning**: Develop a comprehensive strategy aligned with your goals
3. **Execution**: Implement your plan with attention to detail
4. **Monitoring**: Track performance and make data-driven adjustments

## Conclusion

By following these guidelines and maintaining a focus on delivering value to your audience, you'll be well-positioned to achieve your objectives. Remember that success in this field requires patience, persistence, and continuous learning.

Ready to take the next step? Start implementing these strategies today and watch your results improve over time.`;

      setBlogData(prev => ({
        ...prev,
        content: generatedContent,
        excerpt: `Learn how to effectively use ${blogData.keywords.split(',')[0]?.trim()} to improve your digital marketing strategy and engage your audience.`
      }));

      toast({
        title: "Blog Post Generated",
        description: "Your AI-powered blog post has been created successfully!",
      });

      setActiveTab('review');
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Blog Creator</h1>
        <p className="text-gray-600">Create, optimize, and publish high-quality blog content with AI assistance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <PenTool className="h-4 w-4" />
            <span>Create</span>
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="repurpose" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Repurpose</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Review</span>
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Publish</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PenTool className="h-5 w-5 text-blue-600" />
                  <span>Blog Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Blog Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter your blog post title..."
                    value={blogData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="SEO, content marketing, digital strategy..."
                    value={blogData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <select
                      id="audience"
                      value={blogData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General Audience</option>
                      <option value="business">Business Professionals</option>
                      <option value="technical">Technical Audience</option>
                      <option value="beginners">Beginners</option>
                      <option value="experts">Subject Experts</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Writing Tone</Label>
                    <select
                      id="tone"
                      value={blogData.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="friendly">Friendly</option>
                      <option value="conversational">Conversational</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={generateBlogPost}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating Blog Post...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Blog Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {blogData.content ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{blogData.title}</h3>
                      {blogData.excerpt && (
                        <p className="text-gray-600 text-sm mt-2">{blogData.excerpt}</p>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        {blogData.content.substring(0, 500)}...
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {blogData.keywords.split(',').map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated blog post will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assistant">
          <AIWritingAssistant 
            content={blogData.content}
            onContentUpdate={(newContent) => handleInputChange('content', newContent)}
          />
        </TabsContent>

        <TabsContent value="workflow">
          <BlogWorkflowAutomation 
            content={blogData.content}
            title={blogData.title}
          />
        </TabsContent>

        <TabsContent value="repurpose">
          <ContentRepurposingEngine
            content={blogData.content}
            title={blogData.title}
            contentId="blog-draft"
          />
        </TabsContent>

        <TabsContent value="review">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={blogData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-excerpt">Excerpt</Label>
                  <Textarea
                    id="edit-excerpt"
                    value={blogData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={blogData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <BrandVoiceChecker 
              content={blogData.content}
              title={blogData.title}
            />
          </div>
        </TabsContent>

        <TabsContent value="publish">
          <PublishingWorkflow
            content={blogData.content}
            title={blogData.title}
            contentId="blog-draft"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogCreator;
