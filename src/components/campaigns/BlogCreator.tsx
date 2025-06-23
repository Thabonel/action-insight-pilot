
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiClient, BlogPost, BlogPostParams } from '@/lib/api-client';
import { Loader2, FileText } from 'lucide-react';

const BlogCreator: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<BlogPostParams>({
    title: '',
    keyword: '',
    wordCount: 800,
    tone: 'professional',
    includeCTA: true
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof BlogPostParams, value: string | number | boolean) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const generateBlogPost = async () => {
    if (!params.title || !params.keyword) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and keyword",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.generateBlogPost(params);
      
      if (result.success && result.data) {
        setBlogPosts(prev => [result.data!, ...prev]);
        toast({
          title: "Blog Post Generated",
          description: "Your blog post has been created successfully!",
        });
        
        // Reset form
        setParams({
          title: '',
          keyword: '',
          wordCount: 800,
          tone: 'professional',
          includeCTA: true
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate blog post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Blog generation error:', error);
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
            <FileText className="h-5 w-5" />
            <span>AI Blog Post Creator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                value={params.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter blog post title"
              />
            </div>
            
            <div>
              <Label htmlFor="keyword">Primary Keyword</Label>
              <Input
                id="keyword"
                value={params.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                placeholder="Enter target keyword"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wordCount">Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                value={params.wordCount}
                onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value) || 800)}
                min={300}
                max={3000}
              />
            </div>
            
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={params.tone} onValueChange={(value) => handleInputChange('tone', value)}>
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
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeCTA"
              checked={params.includeCTA}
              onCheckedChange={(checked) => handleInputChange('includeCTA', checked)}
            />
            <Label htmlFor="includeCTA">Include Call-to-Action</Label>
          </div>

          <Button onClick={generateBlogPost} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {blogPosts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Blog Posts</h3>
          {blogPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <div className="text-sm text-gray-600 space-x-4">
                  <span>Keyword: {post.keyword}</span>
                  <span>Words: {post.wordCount}</span>
                  <span>Tone: {post.tone}</span>
                  {post.metaDescription && <span>Meta: {post.metaDescription}</span>}
                  <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{post.content}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogCreator;
