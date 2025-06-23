import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Book, BarChart, BrainCircuit, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

import BrandVoiceChecker from '@/components/brand/BrandVoiceChecker';

interface FormData {
  title: string;
  topic: string;
  keywords: string[];
  tone: string;
  length: 'short' | 'medium' | 'long';
  target_audience: string;
  content: string;
  scheduled_date?: Date;
}

const BlogCreator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState<FormData>({
    title: '',
    topic: '',
    keywords: [],
    tone: '',
    length: 'short',
    target_audience: '',
    content: '',
    scheduled_date: undefined,
  });
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Blog Creator</h1>
          <p className="text-gray-600">Create engaging blog content with AI assistance and comprehensive analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="repurpose">Repurpose</TabsTrigger>
            <TabsTrigger value="brand-voice">Brand Voice</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Blog Post</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Blog Title</Label>
                    <Input
                      id="blog-title"
                      placeholder="Enter blog title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blog-topic">Blog Topic</Label>
                    <Input
                      id="blog-topic"
                      placeholder="Enter blog topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content</Label>
                  <Textarea
                    id="blog-content"
                    placeholder="Write your blog content here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-type">Tone</Label>
                    <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                        <SelectItem value="serious">Serious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaign-type">Length</Label>
                    <Select value={formData.length} onValueChange={(value) => setFormData({ ...formData, length: value as 'short' | 'medium' | 'long' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Target Audience</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your target audience..."
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Schedule Post</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleCreateCampaign} className="w-full">
                  Create Blog Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5" />
                  <span>Blog Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Comprehensive analytics and performance metrics for your blog posts</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BrainCircuit className="h-5 w-5" />
                  <span>Automation Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Automate your blog posting and content distribution workflows</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repurpose Tab */}
          <TabsContent value="repurpose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Content Repurposing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Repurpose your blog content into different formats and channels</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Voice Tab */}
          <TabsContent value="brand-voice">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-purple-600" />
                  <span>Brand Voice Consistency Checker</span>
                </CardTitle>
                <CardDescription>
                  Ensure your content aligns with your brand voice and maintains consistency across all communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandVoiceChecker
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  brandId="default" // This would come from user settings
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BrainCircuit className="h-5 w-5" />
                  <span>AI Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Get AI-powered assistance for content creation and optimization</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlogCreator;
