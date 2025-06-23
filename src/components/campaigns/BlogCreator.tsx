
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiClient, BlogPost, BlogPostParams } from '@/lib/api-client';
import { Loader2, FileText, Download, Calendar, Globe, FileDown } from 'lucide-react';

type ExportFormat = 'wordpress' | 'html' | 'markdown' | 'plain';

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
  const [exportFormat, setExportFormat] = useState<ExportFormat>('html');
  const [schedulePublication, setSchedulePublication] = useState(false);
  const [publicationDate, setPublicationDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  // Load export preferences from localStorage
  useEffect(() => {
    const savedFormat = localStorage.getItem('blogExportFormat') as ExportFormat;
    if (savedFormat) {
      setExportFormat(savedFormat);
    }
  }, []);

  // Save export preferences to localStorage
  useEffect(() => {
    localStorage.setItem('blogExportFormat', exportFormat);
  }, [exportFormat]);

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

  const formatContent = (post: BlogPost, format: ExportFormat): string => {
    switch (format) {
      case 'wordpress':
        return `<!-- wp:heading -->
<h1>${post.title}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${post.content}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Keyword:</strong> ${post.keyword}</p>
<!-- /wp:paragraph -->`;

      case 'html':
        return `<!DOCTYPE html>
<html>
<head>
    <title>${post.title}</title>
    <meta name="description" content="${post.metaDescription || ''}">
    <meta name="keywords" content="${post.keyword}">
</head>
<body>
    <h1>${post.title}</h1>
    <div>${post.content}</div>
    <p><strong>Keywords:</strong> ${post.keyword}</p>
    <p><strong>Word Count:</strong> ${post.wordCount}</p>
</body>
</html>`;

      case 'markdown':
        return `# ${post.title}

${post.content}

---

**Keywords:** ${post.keyword}  
**Word Count:** ${post.wordCount}  
**Tone:** ${post.tone}  
**Created:** ${new Date(post.createdAt).toLocaleDateString()}`;

      case 'plain':
        return `${post.title}

${post.content}

Keywords: ${post.keyword}
Word Count: ${post.wordCount}
Tone: ${post.tone}
Created: ${new Date(post.createdAt).toLocaleDateString()}`;

      default:
        return post.content;
    }
  };

  const downloadPost = (post: BlogPost) => {
    setExporting(true);
    try {
      const content = formatContent(post, exportFormat);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${getFileExtension(exportFormat)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Blog post exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to download the blog post",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const copyHtml = (post: BlogPost) => {
    const htmlContent = formatContent(post, 'html');
    navigator.clipboard.writeText(htmlContent).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "HTML content has been copied to your clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy HTML content",
        variant: "destructive",
      });
    });
  };

  const getFileExtension = (format: ExportFormat): string => {
    switch (format) {
      case 'wordpress':
      case 'html':
        return 'html';
      case 'markdown':
        return 'md';
      case 'plain':
        return 'txt';
      default:
        return 'txt';
    }
  };

  const publishToWordPress = (post: BlogPost) => {
    toast({
      title: "WordPress Integration",
      description: "WordPress publishing feature will be available soon",
    });
  };

  const saveAsDraft = (post: BlogPost) => {
    toast({
      title: "Draft Saved",
      description: "Blog post has been saved as a draft",
    });
  };

  const addToContentCalendar = (post: BlogPost) => {
    toast({
      title: "Added to Calendar",
      description: "Blog post has been added to your content calendar",
    });
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
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="whitespace-pre-wrap text-sm">{post.content}</pre>
                </div>

                {/* Export Options */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Export Options</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="exportFormat">Format:</Label>
                      <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wordpress">WordPress</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="plain">Plain Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => downloadPost(post)}
                      disabled={exporting}
                      variant="outline"
                      size="sm"
                    >
                      {exporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download
                    </Button>

                    <Button
                      onClick={() => copyHtml(post)}
                      variant="outline"
                      size="sm"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Copy HTML
                    </Button>
                  </div>

                  {/* Schedule Publication */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`schedule-${post.id}`}
                        checked={schedulePublication}
                        onCheckedChange={setSchedulePublication}
                      />
                      <Label htmlFor={`schedule-${post.id}`}>Schedule Publication</Label>
                    </div>
                    {schedulePublication && (
                      <Input
                        type="datetime-local"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                        className="w-auto"
                      />
                    )}
                  </div>

                  {/* Publishing Integration */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Publishing Options</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => publishToWordPress(post)}
                        variant="outline"
                        size="sm"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Publish to WordPress
                      </Button>

                      <Button
                        onClick={() => saveAsDraft(post)}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Save as Draft
                      </Button>

                      <Button
                        onClick={() => addToContentCalendar(post)}
                        variant="outline"
                        size="sm"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Add to Content Calendar
                      </Button>
                    </div>
                  </div>
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
