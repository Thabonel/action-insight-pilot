
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Target, ToggleLeft, Copy, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface BlogFormData {
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
}

interface GeneratedBlog {
  title: string;
  content: string;
  metaDescription: string;
  wordCount: number;
}

const BlogCreator: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    keyword: '',
    wordCount: 800,
    tone: 'Professional',
    includeCTA: false
  });

  const [errors, setErrors] = useState<{title?: string; keyword?: string}>({});
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {title?: string; keyword?: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Blog title is required';
    }
    
    if (!formData.keyword.trim()) {
      newErrors.keyword = 'Target keyword is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiClient.generateBlogPost({
        title: formData.title,
        keyword: formData.keyword,
        wordCount: formData.wordCount,
        tone: formData.tone,
        includeCTA: formData.includeCTA
      });

      if (response.success && response.data) {
        setGeneratedBlog(response.data);
        toast({
          title: "Blog Generated Successfully",
          description: "Your blog post has been created!"
        });
      } else {
        throw new Error(response.error || 'Failed to generate blog post');
      }
    } catch (error) {
      console.error('Error generating blog:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate blog post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedBlog) return;
    
    const content = `# ${generatedBlog.title}\n\n${generatedBlog.content}`;
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to Clipboard",
        description: "Blog post content has been copied!"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownloadMarkdown = () => {
    if (!generatedBlog) return;
    
    const content = `# ${generatedBlog.title}\n\n${generatedBlog.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedBlog.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Blog post markdown file is downloading!"
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Blog Creator</h2>
        <p className="text-slate-600">Generate SEO-optimized blog posts with AI assistance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Blog Post Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blog-title">Blog Title *</Label>
              <Input
                id="blog-title"
                placeholder="Enter your blog title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-keyword">Target Keyword *</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="target-keyword"
                  placeholder="Enter target keyword"
                  value={formData.keyword}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                  className={`pl-10 ${errors.keyword ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.keyword && <p className="text-sm text-red-500">{errors.keyword}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="word-count">Word Count</Label>
              <Select value={formData.wordCount.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, wordCount: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 words</SelectItem>
                  <SelectItem value="800">800 words</SelectItem>
                  <SelectItem value="1200">1,200 words</SelectItem>
                  <SelectItem value="1500">1,500 words</SelectItem>
                  <SelectItem value="2000">2,000 words</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Authoritative">Authoritative</SelectItem>
                  <SelectItem value="Conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-cta"
              checked={formData.includeCTA}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeCTA: Boolean(checked) }))}
            />
            <Label htmlFor="include-cta" className="flex items-center space-x-2 cursor-pointer">
              <ToggleLeft className="h-4 w-4" />
              <span>Include call-to-action</span>
            </Label>
          </div>

          <Button 
            onClick={handleGenerate} 
            className="w-full" 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Blog Post...
              </>
            ) : (
              'Generate Blog Post'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blog Post Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generated Blog Post</CardTitle>
            {generatedBlog && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedBlog ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click Generate to create your blog post</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Meta Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Word Count: {generatedBlog.wordCount}</span>
                  <span>•</span>
                  <span>Meta Description: {generatedBlog.metaDescription}</span>
                </div>
              </div>

              {/* Blog Content */}
              <article className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{generatedBlog.title}</h1>
                <div 
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: generatedBlog.content }}
                />
              </article>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCreator;
