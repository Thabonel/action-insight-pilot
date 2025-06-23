
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FileText, Target, Copy, Download, Loader2, Edit, Trash2, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface BlogPostParams {
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
  content: string;
  createdAt: string;
}

interface BlogCreatorProps {
  // Additional props can be defined here if needed
}

const BlogCreator: React.FC<BlogCreatorProps> = () => {
  const [blogPostParams, setBlogPostParams] = useState<BlogPostParams>({
    title: '',
    keyword: '',
    wordCount: 500,
    tone: 'neutral',
    includeCTA: false,
  });
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await apiClient.getBlogPosts();
      if (response.success && response.data) {
        setBlogPosts(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load blog posts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLoadPost = (post: BlogPost) => {
    setBlogPostParams({
      title: post.title,
      keyword: post.keyword,
      wordCount: post.wordCount,
      tone: post.tone,
      includeCTA: post.includeCTA,
    });
    setGeneratedContent(post.content);
    toast({
      title: "Post Loaded",
      description: "Blog post data has been loaded into the form.",
    });
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      const response = await apiClient.deleteBlogPost(postId);
      if (response.success) {
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
        toast({
          title: "Post Deleted",
          description: "Blog post has been deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete blog post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogPostParams(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlogPostParams(prevState => ({
      ...prevState,
      includeCTA: e.target.checked,
    }));
  };

  const handleSelectChange = (value: string) => {
    setBlogPostParams(prevState => ({
      ...prevState,
      tone: value,
    }));
  };

  const generateBlogPost = async () => {
    setGenerating(true);
    try {
      const response = await apiClient.generateBlogPost(blogPostParams);
      if (response.success && response.data) {
        setGeneratedContent(response.data.content);
        toast({
          title: "Blog Post Generated",
          description: "Your blog post has been generated successfully!",
        });
        // Reload posts to include the new one
        loadBlogPosts();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to generate blog post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating blog post:", error);
      toast({
        title: "Error",
        description: "Failed to generate blog post",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied to Clipboard",
      description: "The blog post content has been copied to your clipboard.",
    });
  };

  const downloadBlogPost = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${blogPostParams.title.replace(/\s+/g, '_').toLowerCase() || 'blog_post'}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Recent Blog Posts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Blog Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPosts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading blog posts...</span>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No blog posts found. Create your first blog post below!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Keyword:</span> {post.keyword}
                        </div>
                        <div>
                          <span className="font-medium">Words:</span> {post.wordCount}
                        </div>
                        <div>
                          <span className="font-medium">Tone:</span> {post.tone}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadPost(post)}
                        className="flex items-center space-x-1"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Load</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingPostId === post.id}
                          >
                            {deletingPostId === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span>Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the blog post "{post.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePost(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Post Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>AI Blog Post Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                placeholder="Enter blog post title"
                value={blogPostParams.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                type="text"
                id="keyword"
                name="keyword"
                placeholder="Enter main keyword"
                value={blogPostParams.keyword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wordCount">Word Count</Label>
              <Input
                type="number"
                id="wordCount"
                name="wordCount"
                placeholder="Enter desired word count"
                value={blogPostParams.wordCount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={blogPostParams.tone} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCTA"
              checked={blogPostParams.includeCTA}
              onCheckedChange={(checked) => setBlogPostParams(prevState => ({ ...prevState, includeCTA: !!checked }))}
            />
            <Label htmlFor="includeCTA">Include Call to Action</Label>
          </div>

          <Button onClick={generateBlogPost} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Generate Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Section */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Blog Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedContent}
              readOnly
              className="min-h-[150px] bg-gray-100"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="secondary" onClick={downloadBlogPost}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogCreator;
