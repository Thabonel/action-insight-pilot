
import React, { useState } from 'react';
import { FileText, Target, ToggleLeft } from 'lucide-react';
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

const BlogCreator: React.FC = () => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    keyword: '',
    wordCount: '',
    tone: '',
    includeCTA: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
      // TODO: Implement blog post generation logic
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
    </div>
  );
};

export default BlogCreator;
