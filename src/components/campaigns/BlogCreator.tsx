import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Target, ToggleLeft, Copy, Download, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface BlogPostParams {
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
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
  const { toast } = useToast();

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
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="space-y-6">
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
