
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, Copy, Download, Edit, Share2, MessageCircle, Video, 
  Mail, Instagram, Mic, Presentation, HelpCircle, FileText,
  Twitter, Linkedin, Youtube, Target, Palette, Megaphone
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface RepurposingOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  platforms?: string[];
  characterLimit?: number;
  wordLimit?: number;
}

interface ContentVariant {
  id: string;
  format: string;
  platform?: string;
  content: string;
  title?: string;
  tone: string;
  characterCount: number;
  wordCount: number;
  createdAt: string;
  tags: string[];
}

interface ContentRepurposingEngineProps {
  originalContent: string;
  originalTitle: string;
  contentId?: string;
}

const ContentRepurposingEngine: React.FC<ContentRepurposingEngineProps> = ({
  originalContent,
  originalTitle,
  contentId = 'demo-content'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<ContentVariant[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [editingVariant, setEditingVariant] = useState<ContentVariant | null>(null);
  const { toast } = useToast();

  const repurposingOptions: RepurposingOption[] = [
    {
      id: 'twitter-thread',
      name: 'Twitter Thread',
      description: 'Convert to engaging Twitter thread',
      icon: <Twitter className="h-4 w-4" />,
      format: 'social-thread',
      platforms: ['Twitter'],
      characterLimit: 280
    },
    {
      id: 'linkedin-post',
      name: 'LinkedIn Post',
      description: 'Transform into professional LinkedIn content',
      icon: <Linkedin className="h-4 w-4" />,
      format: 'social-post',
      platforms: ['LinkedIn'],
      characterLimit: 3000
    },
    {
      id: 'youtube-script',
      name: 'YouTube Script',
      description: 'Create video script from blog outline',
      icon: <Video className="h-4 w-4" />,
      format: 'video-script',
      platforms: ['YouTube']
    },
    {
      id: 'email-newsletter',
      name: 'Email Newsletter',
      description: 'Generate newsletter content',
      icon: <Mail className="h-4 w-4" />,
      format: 'email-content',
      platforms: ['Email']
    },
    {
      id: 'instagram-quotes',
      name: 'Instagram Quotes',
      description: 'Extract key quotes for Instagram',
      icon: <Instagram className="h-4 w-4" />,
      format: 'quote-cards',
      platforms: ['Instagram']
    },
    {
      id: 'podcast-outline',
      name: 'Podcast Outline',
      description: 'Create podcast episode structure',
      icon: <Mic className="h-4 w-4" />,
      format: 'podcast-outline',
      platforms: ['Podcast']
    },
    {
      id: 'slide-deck',
      name: 'Slide Deck',
      description: 'Generate presentation slides',
      icon: <Presentation className="h-4 w-4" />,
      format: 'presentation',
      platforms: ['PowerPoint', 'Google Slides']
    },
    {
      id: 'faq-section',
      name: 'FAQ Section',
      description: 'Create FAQ from content',
      icon: <HelpCircle className="h-4 w-4" />,
      format: 'faq',
      platforms: ['Website', 'Documentation']
    },
    {
      id: 'case-study',
      name: 'Case Study',
      description: 'Transform into case study format',
      icon: <FileText className="h-4 w-4" />,
      format: 'case-study',
      platforms: ['Website', 'Sales']
    }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'inspiring', label: 'Inspiring' }
  ];

  const audienceOptions = [
    { value: 'b2b', label: 'B2B Decision Makers' },
    { value: 'b2c', label: 'General Consumers' },
    { value: 'technical', label: 'Technical Audience' },
    { value: 'beginner', label: 'Beginners' },
    { value: 'expert', label: 'Industry Experts' },
    { value: 'startup', label: 'Startup Founders' },
    { value: 'marketing', label: 'Marketing Professionals' }
  ];

  useEffect(() => {
    loadExistingVariants();
  }, [contentId]);

  const loadExistingVariants = async () => {
    try {
      const response = await apiClient.getContentVariants(contentId);
      if (response.success && response.data) {
        setVariants(response.data);
      }
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const generateVariant = async (option: RepurposingOption) => {
    setIsGenerating(true);
    setSelectedFormat(option.id);

    try {
      const response = await apiClient.repurposeContent(contentId, option.format, {
        tone: selectedTone,
        platform: selectedPlatform || option.platforms?.[0],
        characterLimit: option.characterLimit,
        wordLimit: option.wordLimit,
        originalContent,
        originalTitle
      });

      if (response.success && response.data) {
        const newVariant: ContentVariant = {
          id: `variant-${Date.now()}`,
          format: option.format,
          platform: selectedPlatform || option.platforms?.[0],
          content: response.data.content || generateMockContent(option),
          title: response.data.title || `${originalTitle} - ${option.name}`,
          tone: selectedTone,
          characterCount: response.data.content?.length || 0,
          wordCount: response.data.content?.split(' ').length || 0,
          createdAt: new Date().toISOString(),
          tags: [option.format, selectedTone, selectedPlatform || option.platforms?.[0]].filter(Boolean)
        };

        setVariants(prev => [newVariant, ...prev]);
        await apiClient.saveContentVariant(contentId, newVariant);

        toast({
          title: "Content Repurposed",
          description: `Successfully created ${option.name} variant`,
        });
      }
    } catch (error) {
      console.error('Error generating variant:', error);
      toast({
        title: "Error",
        description: "Failed to generate content variant",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setSelectedFormat('');
    }
  };

  const generateMockContent = (option: RepurposingOption): string => {
    const mockContent = {
      'twitter-thread': `🧵 Thread about ${originalTitle}\n\n1/ ${originalContent.substring(0, 240)}...\n\n2/ Key insights from this topic...\n\n3/ Here's what you need to know...\n\n4/ The bottom line:`,
      'linkedin-post': `📈 ${originalTitle}\n\n${originalContent.substring(0, 500)}...\n\nKey takeaways:\n• Point 1\n• Point 2\n• Point 3\n\nWhat's your experience with this? Share in the comments! 👇`,
      'youtube-script': `[INTRO]\nHey everyone! Today we're diving into ${originalTitle}.\n\n[MAIN CONTENT]\n${originalContent.substring(0, 800)}...\n\n[CALL TO ACTION]\nWhat did you think? Let me know in the comments!`,
      'email-content': `Subject: ${originalTitle}\n\nHi there!\n\n${originalContent.substring(0, 400)}...\n\nRead the full article here: [LINK]\n\nBest regards,\n[YOUR NAME]`,
      'quote-cards': `"${originalContent.substring(0, 150)}..."\n\n--- \n\n"Key insight from ${originalTitle}"\n\n---\n\n"Remember: ${originalContent.substring(200, 350)}..."`,
      'podcast-outline': `Episode: ${originalTitle}\n\n[00:00] Intro\n[02:00] Topic overview\n[05:00] Main discussion\n[15:00] Key insights\n[20:00] Wrap-up and next steps`,
      'presentation': `Slide 1: ${originalTitle}\n\nSlide 2: Overview\n${originalContent.substring(0, 200)}...\n\nSlide 3: Key Points\n• Point 1\n• Point 2\n• Point 3\n\nSlide 4: Conclusion`,
      'faq': `Q: What is ${originalTitle} about?\nA: ${originalContent.substring(0, 200)}...\n\nQ: How can I apply this?\nA: Start by implementing the key strategies mentioned...\n\nQ: What are the benefits?\nA: The main benefits include...`,
      'case-study': `Case Study: ${originalTitle}\n\nChallenge:\n${originalContent.substring(0, 200)}...\n\nSolution:\nWe implemented a comprehensive approach...\n\nResults:\n• Outcome 1\n• Outcome 2\n• Outcome 3`
    };

    return mockContent[option.format as keyof typeof mockContent] || originalContent.substring(0, 500) + '...';
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const exportVariant = (variant: ContentVariant) => {
    const blob = new Blob([variant.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${variant.title || 'content'}-${variant.format}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveVariantEdit = async (variant: ContentVariant) => {
    try {
      await apiClient.saveContentVariant(contentId, variant);
      setVariants(prev => prev.map(v => v.id === variant.id ? variant : v));
      setEditingVariant(null);
      toast({
        title: "Saved",
        description: "Content variant updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Content Repurposing Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Tone</Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(tone => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Platform (Optional)</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-select</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repurposingOptions.map(option => (
              <Card 
                key={option.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFormat === option.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => generateVariant(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{option.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {option.platforms?.map(platform => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {option.characterLimit && (
                          <Badge variant="outline" className="text-xs">
                            {option.characterLimit} chars
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isGenerating && selectedFormat === option.id && (
                    <div className="flex items-center justify-center mt-3">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm">Generating...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Variants */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Variants ({variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {variants.map(variant => (
                  <Card key={variant.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{variant.title}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {variant.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingVariant(variant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(variant.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportVariant(variant)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {editingVariant?.id === variant.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editingVariant.content}
                            onChange={(e) => setEditingVariant({
                              ...editingVariant,
                              content: e.target.value,
                              characterCount: e.target.value.length,
                              wordCount: e.target.value.split(' ').length
                            })}
                            className="min-h-32"
                          />
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {editingVariant.characterCount} characters • {editingVariant.wordCount} words
                            </div>
                            <div className="space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingVariant(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => saveVariantEdit(editingVariant)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <pre className="whitespace-pre-wrap text-sm font-mono">
                              {variant.content}
                            </pre>
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>
                              {variant.characterCount} characters • {variant.wordCount} words
                            </span>
                            <span>
                              Created {new Date(variant.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Optimization Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Quick Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="length" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="length">Length Optimizer</TabsTrigger>
              <TabsTrigger value="audience">Audience Adjuster</TabsTrigger>
              <TabsTrigger value="cta">CTA Generator</TabsTrigger>
            </TabsList>

            <TabsContent value="length" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Tweet', chars: 280 },
                  { name: 'Instagram Caption', chars: 125 },
                  { name: 'LinkedIn Post', chars: 1300 },
                  { name: 'Email Subject', chars: 50 }
                ].map(format => (
                  <Button
                    key={format.name}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => {
                      // Generate optimized length variant
                      const mockOption: RepurposingOption = {
                        id: `optimize-${format.name.toLowerCase()}`,
                        name: format.name,
                        description: `Optimize for ${format.chars} characters`,
                        icon: <Target className="h-4 w-4" />,
                        format: 'optimized-length',
                        characterLimit: format.chars
                      };
                      generateVariant(mockOption);
                    }}
                  >
                    <span className="font-medium">{format.name}</span>
                    <span className="text-xs text-muted-foreground">{format.chars} chars</span>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {audienceOptions.map(audience => (
                  <Button
                    key={audience.value}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => {
                      // Generate audience-specific variant
                      const mockOption: RepurposingOption = {
                        id: `audience-${audience.value}`,
                        name: audience.label,
                        description: `Adjusted for ${audience.label}`,
                        icon: <Palette className="h-4 w-4" />,
                        format: 'audience-optimized'
                      };
                      generateVariant(mockOption);
                    }}
                  >
                    <span className="font-medium text-center">{audience.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cta" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Learn More',
                  'Get Started',
                  'Book a Demo',
                  'Download Now',
                  'Subscribe',
                  'Share This'
                ].map(ctaType => (
                  <Button
                    key={ctaType}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => {
                      // Generate CTA variant
                      const mockOption: RepurposingOption = {
                        id: `cta-${ctaType.toLowerCase().replace(' ', '-')}`,
                        name: `${ctaType} CTA`,
                        description: `Generate ${ctaType} call-to-action`,
                        icon: <Megaphone className="h-4 w-4" />,
                        format: 'cta-optimized'
                      };
                      generateVariant(mockOption);
                    }}
                  >
                    <Megaphone className="h-4 w-4 mb-1" />
                    <span className="font-medium text-center">{ctaType}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRepurposingEngine;
