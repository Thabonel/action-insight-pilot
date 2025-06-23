
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  PenTool, 
  Sparkles, 
  Eye, 
  Share2, 
  Settings,
  FileText,
  Brain,
  CheckCircle,
  Archive
} from 'lucide-react';

// Import components with proper error handling
import { AIWritingAssistant } from '@/components/content/AIWritingAssistant';
import { BrandVoiceChecker } from '@/components/brand/BrandVoiceChecker';
import { ContentRepurposingEngine } from '@/components/content/ContentRepurposingEngine';
import { PublishingWorkflow } from '@/components/blog/PublishingWorkflow';
import { ContentLibrary } from '@/components/content/ContentLibrary';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  seoScore: number;
  readabilityScore: number;
  createdAt: string;
  updatedAt: string;
}

export const BlogCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { toast } = useToast();

  const handlePostSelect = (post: any) => {
    setTitle(post.title);
    setContent(post.content);
    setCurrentPost(post);
    setActiveTab('editor');
    toast({
      title: "Post loaded",
      description: "Post content loaded for editing"
    });
  };

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
  };

  const handleSaveDraft = async () => {
    try {
      const newPost: BlogPost = {
        id: currentPost?.id || Date.now().toString(),
        title: title || 'Untitled Post',
        content,
        excerpt: content.substring(0, 150) + '...',
        tags: [],
        status: 'draft',
        seoScore: 0,
        readabilityScore: 0,
        createdAt: currentPost?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentPost(newPost);
      toast({
        title: "Draft saved",
        description: "Your blog post has been saved as a draft"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    }
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = `# ${title}

## Introduction

This is a comprehensive guide about ${title.toLowerCase()}. In this post, we'll explore the key concepts, best practices, and actionable strategies you can implement.

## Key Points

1. **Understanding the Basics**: Before diving deep, it's important to understand the fundamental concepts.

2. **Best Practices**: Here are the proven strategies that work:
   - Strategy one with detailed explanation
   - Strategy two with examples
   - Strategy three with implementation tips

3. **Common Challenges**: Let's address the most frequent obstacles:
   - Challenge one and how to overcome it
   - Challenge two with practical solutions

## Implementation Guide

Step-by-step instructions for getting started:

1. Start with research and planning
2. Set up your framework
3. Execute with consistency
4. Measure and optimize

## Conclusion

${title} is a powerful approach when implemented correctly. By following these guidelines, you'll be well on your way to success.

*What are your thoughts on ${title.toLowerCase()}? Share your experiences in the comments below.*`;

      setContent(generatedContent);
      toast({
        title: "Content generated",
        description: "AI has generated your blog post content"
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Creator</h1>
          <p className="text-gray-600 mt-1">Create engaging blog content with AI assistance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <FileText className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => setActiveTab('publish')}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Brand Voice
          </TabsTrigger>
          <TabsTrigger value="repurpose" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Repurpose
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Publish
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Post Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog post title..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Content</label>
                  <Button 
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your blog post content..."
                  rows={20}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{content.length} characters</span>
                <span>{content.split(' ').filter(word => word.length > 0).length} words</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant">
          <AIWritingAssistant
            content={content}
            onContentUpdate={handleContentUpdate}
            isVisible={true}
            onToggle={() => {}}
          />
        </TabsContent>

        <TabsContent value="brand">
          <BrandVoiceChecker content={content} />
        </TabsContent>

        <TabsContent value="repurpose">
          <ContentRepurposingEngine
            contentId={currentPost?.id || 'temp'}
            title={title}
            content={content}
          />
        </TabsContent>

        <TabsContent value="publish">
          <PublishingWorkflow content={content} title={title} />
        </TabsContent>

        <TabsContent value="library">
          <ContentLibrary 
            onPostSelect={handlePostSelect}
            currentContent={content}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
