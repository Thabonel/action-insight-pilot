
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AIWritingAssistant } from '@/components/content/AIWritingAssistant';
import { BrandVoiceChecker } from '@/components/brand/BrandVoiceChecker';
import { PublishingWorkflow } from '@/components/blog/PublishingWorkflow';
import { ContentLibrary } from '@/components/content/ContentLibrary';
import { AIOptimizationCoach } from '@/components/content/AIOptimizationCoach';
import { BlogPerformanceDashboard } from '@/components/blog/BlogPerformanceDashboard';
import IntegrationHub from '@/components/blog/IntegrationHub';

const BlogCreator: React.FC = () => {
  const [blogPost, setBlogPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [] as string[],
    category: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled'
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showOptimizationCoach, setShowOptimizationCoach] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Blog post saved",
      description: "Your blog post has been saved as a draft."
    });
  };

  const handleContentUpdate = (newContent: string) => {
    setBlogPost(prev => ({ ...prev, content: newContent }));
  };

  const handlePublish = async (platforms: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    setBlogPost(prev => ({ ...prev, status: 'published' }));
    toast({
      title: "Publishing initiated",
      description: `Started publishing to ${platforms.length} platform(s).`
    });
  };

  const handlePublishReady = () => {
    setBlogPost(prev => ({ ...prev, status: 'published' }));
    toast({
      title: "Blog post published",
      description: "Your blog post has been successfully published."
    });
  };

  const handlePostSelect = (_postId: string) => {
    // Post selection handled by dashboard
  };

  // Dashboard action handlers
  const handleCreateNew = () => {
    setActiveTab('editor');
    setBlogPost({
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      category: '',
      status: 'draft'
    });
  };

  const handleContinueDraft = (_draftId: string) => {
    setActiveTab('editor');
    toast({
      title: "Draft loaded",
      description: "Continue working on your draft."
    });
  };

  const handleDuplicatePost = (_postId: string) => {
    setActiveTab('editor');
    toast({
      title: "Post duplicated",
      description: "Created a new post based on your best performer."
    });
  };

  const handleUpdatePost = (_postId: string) => {
    setActiveTab('editor');
    toast({
      title: "Post loaded for update",
      description: "Make your improvements and republish."
    });
  };

  const handleCreateSeries = (_postId: string) => {
    setActiveTab('editor');
    toast({
      title: "Series creation started",
      description: "Building content series from successful post."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Creator</h1>
          <p className="text-gray-600 mt-1">Create, optimize, and publish your blog content</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSave}>
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            AI Assistant
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowOptimizationCoach(!showOptimizationCoach)}
          >
            AI Coach
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center space-x-2">
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center space-x-2">
            <span>Brand Voice</span>
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center space-x-2">
            <span>Publish Ready</span>
          </TabsTrigger>
          <TabsTrigger value="distribute" className="flex items-center space-x-2">
            <span>Distribute</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <span>Library</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <BlogPerformanceDashboard
            onCreateNew={handleCreateNew}
            onContinueDraft={handleContinueDraft}
            onDuplicatePost={handleDuplicatePost}
            onUpdatePost={handleUpdatePost}
            onCreateSeries={handleCreateSeries}
          />
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Post Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter your blog post title..."
                      value={blogPost.title}
                      onChange={(e) => setBlogPost(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of your blog post..."
                      value={blogPost.excerpt}
                      onChange={(e) => setBlogPost(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Start writing your blog post..."
                      value={blogPost.content}
                      onChange={(e) => handleContentUpdate(e.target.value)}
                      rows={15}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {showOptimizationCoach && (
                <AIOptimizationCoach
                  content={blogPost.content}
                  title={blogPost.title}
                  onContentUpdate={handleContentUpdate}
                />
              )}
              
              {showAIAssistant && (
                <AIWritingAssistant
                  content={blogPost.content}
                  onContentUpdate={handleContentUpdate}
                  isVisible={showAIAssistant}
                  onToggle={() => setShowAIAssistant(!showAIAssistant)}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="brand">
          <BrandVoiceChecker
            content={blogPost.content}
            onContentUpdate={handleContentUpdate}
          />
        </TabsContent>

        <TabsContent value="publish">
          <PublishingWorkflow
            content={blogPost.content}
            title={blogPost.title}
            onPublish={handlePublishReady}
          />
        </TabsContent>

        <TabsContent value="distribute">
          <IntegrationHub
            blogContent={{
              title: blogPost.title,
              content: blogPost.content,
              excerpt: blogPost.excerpt
            }}
            onPublish={handlePublish}
          />
        </TabsContent>

        <TabsContent value="library">
          <ContentLibrary onPostSelect={handlePostSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogCreator;
