
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface BlogPost {
  id: string;
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
  content: string;
  metaDescription?: string;
  createdAt: string;
}

interface BlogPostParams {
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
}

const BlogCreator = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<BlogPostParams>({
    title: '',
    keyword: '',
    wordCount: 800,
    tone: 'professional',
    includeCTA: true,
  });

  const handleInputChange = (field: keyof BlogPostParams, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadBlogPosts = async () => {
    try {
      const response = await apiClient.getBlogPosts();
      if (response.success && response.data) {
        // Transform the API data to match our local BlogPost interface
        const transformedPosts: BlogPost[] = response.data.map(post => ({
          id: post.id,
          title: post.title,
          keyword: post.keyword || '',
          wordCount: post.wordCount || 0,
          tone: post.tone || 'professional',
          includeCTA: post.includeCTA || false,
          content: post.content,
          metaDescription: post.metaDescription,
          createdAt: post.createdAt || new Date().toISOString(),
        }));
        setBlogPosts(transformedPosts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    loadBlogPosts();
  }, []);

  const handleGenerate = async () => {
    if (!formData.title || !formData.keyword) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and keyword",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Transform BlogPostParams to ContentBrief format expected by the API
      const contentBrief = {
        title: formData.title,
        content_type: 'blog_post',
        target_audience: 'general',
        key_messages: [formData.keyword],
        platform: 'blog',
        tone: formData.tone,
        word_count: formData.wordCount,
        include_cta: formData.includeCTA,
      };

      const response = await apiClient.generateBlogPost(contentBrief);
      
      if (response.success && response.data) {
        const newPost: BlogPost = {
          id: Date.now().toString(),
          title: formData.title,
          keyword: formData.keyword,
          wordCount: formData.wordCount,
          tone: formData.tone,
          includeCTA: formData.includeCTA,
          content: response.data,
          createdAt: new Date().toISOString(),
        };

        setBlogPosts(prev => [newPost, ...prev]);
        
        // Reset form
        setFormData({
          title: '',
          keyword: '',
          wordCount: 800,
          tone: 'professional',
          includeCTA: true,
        });

        toast({
          title: "Success",
          description: "Blog post generated successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate blog post",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      // Update the post in the list
      setBlogPosts(prev => 
        prev.map(post => 
          post.id === editingPost.id ? editingPost : post
        )
      );
      
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Blog post updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (postId: string) => {
    setBlogPosts(prev => prev.filter(post => post.id !== postId));
    toast({
      title: "Success",
      description: "Blog post deleted successfully!",
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Success",
      description: "Content copied to clipboard!",
    });
  };

  const handleDownload = (post: BlogPost) => {
    const element = document.createElement('a');
    const file = new Blob([post.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${post.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Blog Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter blog post title"
              />
            </div>
            <div>
              <Label htmlFor="keyword">Target Keyword</Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                placeholder="Enter target keyword"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="wordCount">Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                value={formData.wordCount}
                onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value))}
                min="100"
                max="3000"
              />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="includeCTA"
                checked={formData.includeCTA}
                onCheckedChange={(checked) => handleInputChange('includeCTA', checked)}
              />
              <Label htmlFor="includeCTA">Include CTA</Label>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !formData.title || !formData.keyword}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Blog Post'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Blog Posts */}
      <div className="space-y-4">
        {blogPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{post.keyword}</Badge>
                  <Badge variant="outline">{post.wordCount} words</Badge>
                  <Badge variant="outline">{post.tone}</Badge>
                  {post.includeCTA && <Badge variant="outline">CTA</Badge>}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(post.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(post)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Blog Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                value={editingPost.title}
                onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editContent">Content</Label>
              <Textarea
                id="editContent"
                value={editingPost.content}
                onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                rows={10}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveEdit}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogCreator;
