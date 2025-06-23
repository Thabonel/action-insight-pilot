
import React, { useState } from 'react';
import { FileText, Target, ToggleLeft, Copy, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BlogFormData {
  title: string;
  keyword: string;
  wordCount: string;
  tone: string;
  includeCTA: boolean;
}

interface GeneratedBlog {
  title: string;
  metaDescription: string;
  content: string;
  wordCount: number;
}

const BlogCreator: React.FC = () => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    keyword: '',
    wordCount: '',
    tone: '',
    includeCTA: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Blog title is required';
    }
    
    if (!formData.keyword.trim()) {
      newErrors.keyword = 'Target keyword is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BlogFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Generating blog post with data:', formData);
      
      // Generate placeholder content
      const placeholderBlog: GeneratedBlog = {
        title: formData.title,
        metaDescription: `Learn about ${formData.keyword} in this comprehensive guide. Discover key insights and practical tips to help you succeed.`,
        content: `
# ${formData.title}

## Introduction

Welcome to this comprehensive guide about ${formData.keyword}. In this post, we'll explore the key concepts and provide you with actionable insights.

## What is ${formData.keyword}?

${formData.keyword} is an important topic that affects many aspects of modern business. Understanding its fundamentals is crucial for success.

## Key Benefits

- **Improved Efficiency**: Learn how ${formData.keyword} can streamline your processes
- **Better Results**: Discover the impact on your bottom line
- **Strategic Advantage**: Gain competitive edge through proper implementation

## Best Practices

When working with ${formData.keyword}, consider these proven strategies:

1. Start with clear objectives
2. Measure your progress regularly
3. Adapt based on results
4. Stay updated with latest trends

## Implementation Steps

### Step 1: Planning
Begin by assessing your current situation and defining clear goals for your ${formData.keyword} initiative.

### Step 2: Execution
Put your plan into action with careful monitoring and regular adjustments.

### Step 3: Optimization
Continuously improve your approach based on data and feedback.

## Conclusion

${formData.keyword} represents a significant opportunity for growth and improvement. By following the strategies outlined in this guide, you'll be well-positioned to achieve your goals.

${formData.includeCTA ? `\n## Ready to Get Started?\n\nTake the next step in your ${formData.keyword} journey. Contact our team today to learn how we can help you implement these strategies successfully.` : ''}
        `,
        wordCount: parseInt(formData.wordCount) || 800
      };
      
      setGeneratedBlog(placeholderBlog);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedBlog) {
      navigator.clipboard.writeText(generatedBlog.content);
      console.log('Blog content copied to clipboard');
    }
  };

  const handleDownloadMarkdown = () => {
    if (generatedBlog) {
      const blob = new Blob([generatedBlog.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedBlog.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Blog Post Creator</h2>
        <p className="text-slate-600">Generate SEO-optimized blog posts with your brand voice</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Create New Blog Post</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blog Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Blog Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter your blog post title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Target Keyword */}
            <div className="space-y-2">
              <Label htmlFor="keyword" className="text-sm font-medium flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Target Keyword *</span>
              </Label>
              <Input
                id="keyword"
                type="text"
                placeholder="Enter your target SEO keyword"
                value={formData.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                className={errors.keyword ? 'border-red-500' : ''}
              />
              {errors.keyword && (
                <p className="text-sm text-red-500">{errors.keyword}</p>
              )}
            </div>

            {/* Word Count */}
            <div className="space-y-2">
              <Label htmlFor="wordCount" className="text-sm font-medium">
                Word Count
              </Label>
              <Select value={formData.wordCount} onValueChange={(value) => handleInputChange('wordCount', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select word count" />
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

            {/* Tone */}
            <div className="space-y-2">
              <Label htmlFor="tone" className="text-sm font-medium">
                Tone
              </Label>
              <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select writing tone" />
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

            {/* Include CTA Toggle */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="includeCTA"
                checked={formData.includeCTA}
                onCheckedChange={(checked) => handleInputChange('includeCTA', checked as boolean)}
              />
              <Label htmlFor="includeCTA" className="text-sm font-medium flex items-center space-x-2 cursor-pointer">
                <ToggleLeft className="w-4 h-4" />
                <span>Include call-to-action</span>
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Generate Blog Post
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Blog Preview Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generated Blog Post</CardTitle>
            {generatedBlog && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                  className="flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedBlog ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Click Generate to create your blog post</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Meta Information */}
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Meta Description</p>
                    <p className="text-sm text-slate-600 mt-1">{generatedBlog.metaDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Word Count</p>
                    <p className="text-sm text-slate-600 mt-1">{generatedBlog.wordCount} words</p>
                  </div>
                </div>
              </div>

              {/* Blog Content */}
              <div className="prose prose-slate max-w-none">
                <div 
                  className="blog-content space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: generatedBlog.content
                      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-900 mb-6">$1</h1>')
                      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-slate-800 mt-8 mb-4">$1</h2>')
                      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium text-slate-700 mt-6 mb-3">$1</h3>')
                      .replace(/^\*\*(.+)\*\*:/gm, '<strong class="font-semibold text-slate-900">$1:</strong>')
                      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
                      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
                      .replace(/\n\n/g, '</p><p class="text-slate-700 leading-relaxed mb-4">')
                      .replace(/^(?!<[h|l])/gm, '<p class="text-slate-700 leading-relaxed mb-4">')
                      .replace(/(?<!>)$/gm, '</p>')
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCreator;
