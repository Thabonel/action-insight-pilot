import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileText, Wand2, Save, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';
import BlogAnalyticsDashboard from '@/components/analytics/BlogAnalyticsDashboard';
import BlogWorkflowAutomation from '@/components/blog/BlogWorkflowAutomation';

const BlogCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Informative');
  const [length, setLength] = useState('medium');
  const [targetAudience, setTargetAudience] = useState('');
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{ id: string; title: string; content: string } | null>(null);
  const [activeTab, setActiveTab] = useState('create');

  const handleSave = () => {
    // Placeholder for save functionality
    alert('Draft saved!');
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isAssistantVisible ? 'mr-80' : ''}`}>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Blog Creator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsAssistantVisible(!isAssistantVisible)}
                variant="outline"
                size="sm"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Writing Assistant
              </Button>
              <Button onClick={handleSave} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="automation">Smart Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              {/* Generation Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Blog Post Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="keywords">Keywords (comma separated)</Label>
                      <Input
                        type="text"
                        id="keywords"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tone">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Informative">Informative</SelectItem>
                          <SelectItem value="Persuasive">Persuasive</SelectItem>
                          <SelectItem value="Friendly">Friendly</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Select value={length} onValueChange={setLength}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        type="text"
                        id="targetAudience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <BlogAnalyticsDashboard selectedBlogId={generatedPost?.id} />
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <BlogWorkflowAutomation />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Writing Assistant Sidebar */}
      <AIWritingAssistant
        content={content}
        onContentUpdate={setContent}
        isVisible={isAssistantVisible}
        onToggle={() => setIsAssistantVisible(!isAssistantVisible)}
      />
    </div>
  );
};

export default BlogCreator;
