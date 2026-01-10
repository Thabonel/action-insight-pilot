import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { viralPromptsLibrary, getPromptsByCategory, getPromptsByPlatform } from '@/lib/viral-prompts-library';

const ViralContentGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('universal');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [viralScore, setViralScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);

  const platforms = [
    { value: 'universal', label: 'All Platforms' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'facebook', label: 'Facebook' }
  ];

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call - replace with actual service call
      const mockContent = selectedTemplate 
        ? selectedTemplate.replace(/{[^}]+}/g, topic)
        : `🔥 ${topic}: The truth nobody wants to tell you...

Here's what I discovered after ${Math.floor(Math.random() * 5) + 1} years of research:

${topic} isn't what you think it is. Most people are doing it completely wrong.

The real secret? ${topic} works best when you [specific insight].

Try this approach and watch everything change.

What's your experience with ${topic}? Drop it below! 👇`;

      setGeneratedContent(mockContent);
      setViralScore(Math.floor(Math.random() * 30) + 70); // Mock score 70-100
      
      // Generate variations
      const mockVariations = [
        `Stop scrolling if you struggle with ${topic}. This changes everything...`,
        `Unpopular opinion: Most ${topic} advice is terrible. Here's what actually works:`,
        `The ${topic} strategy that got me [specific result] in [timeframe]:`
      ];
      setVariations(mockVariations);

      toast.success('Viral content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  type ViralPlatform = 'universal' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'facebook';

  const filteredPrompts = getPromptsByPlatform(platform as ViralPlatform);
  const hookPrompts = getPromptsByCategory('hook');
  const engagementPrompts = getPromptsByCategory('engagement');

  return (
    <div className="space-y-6">
      {/* Main Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Go Viral GPT Generator
          </CardTitle>
          <CardDescription>
            Create viral content using AI-powered psychology and proven templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Theme</Label>
              <Input
                id="topic"
                placeholder="e.g., AI productivity, social media marketing..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform">Target Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Viral Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a viral template..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredPrompts.map(prompt => (
                  <SelectItem key={prompt.id} value={prompt.template}>
                    <div>
                      <div className="font-medium">{prompt.name}</div>
                      <div className="text-xs text-muted-foreground">{prompt.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating Viral Content...' : 'Generate Viral Content'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Results */}
      {generatedContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Viral Content</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={viralScore >= 80 ? 'default' : viralScore >= 60 ? 'secondary' : 'outline'}>
                      Viral Score: {viralScore}%
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generatedContent)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                  placeholder="Your viral content will appear here..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Variations & Optimization */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alternative Hooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {variations.map((variation, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        setGeneratedContent(variation + '\n\n' + generatedContent.split('\n\n').slice(1).join('\n\n'));
                        toast.success('Hook updated!');
                      }}
                    >
                      <p className="text-xs">{variation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Viral Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Strong emotional hook ✓</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Clear value proposition ✓</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Add engagement CTA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Include trending hashtags</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Prompt Library */}
      <Card>
        <CardHeader>
          <CardTitle>Viral Prompt Library</CardTitle>
          <CardDescription>
            Research-backed templates with proven viral potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hooks" className="space-y-4">
            <TabsList>
              <TabsTrigger value="hooks">Attention Hooks</TabsTrigger>
              <TabsTrigger value="engagement">Engagement Drivers</TabsTrigger>
              <TabsTrigger value="emotions">Emotional Triggers</TabsTrigger>
            </TabsList>

            <TabsContent value="hooks" className="space-y-3">
              {hookPrompts.map(prompt => (
                <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{prompt.name}</h4>
                        <Badge variant="outline">Score: {prompt.effectiveness_score}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prompt.description}</p>
                      <div className="bg-muted p-3 rounded text-sm font-mono">
                        {prompt.template}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prompt.psychological_triggers.map(trigger => (
                          <Badge key={trigger} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(prompt.template);
                          toast.success('Template selected!');
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="engagement" className="space-y-3">
              {engagementPrompts.map(prompt => (
                <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{prompt.name}</h4>
                        <Badge variant="outline">Score: {prompt.effectiveness_score}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prompt.description}</p>
                      <div className="bg-muted p-3 rounded text-sm font-mono">
                        {prompt.template}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prompt.psychological_triggers.map(trigger => (
                          <Badge key={trigger} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(prompt.template);
                          toast.success('Template selected!');
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="emotions" className="space-y-3">
              {getPromptsByCategory('emotion').map(prompt => (
                <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{prompt.name}</h4>
                        <Badge variant="outline">Score: {prompt.effectiveness_score}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prompt.description}</p>
                      <div className="bg-muted p-3 rounded text-sm font-mono">
                        {prompt.template}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prompt.psychological_triggers.map(trigger => (
                          <Badge key={trigger} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(prompt.template);
                          toast.success('Template selected!');
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViralContentGenerator;