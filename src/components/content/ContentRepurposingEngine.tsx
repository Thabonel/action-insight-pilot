
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface RepurposedVariant {
  id: string;
  formatId: string;
  content: string | string[];
  createdAt: string;
  wordCount: number;
  characterCount: number;
}

export interface ContentRepurposingEngineProps {
  contentId: string;
  title: string;
  content: string;
}

export const ContentRepurposingEngine: React.FC<ContentRepurposingEngineProps> = ({
  contentId,
  title,
  content
}) => {
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [variants, setVariants] = useState<RepurposedVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const repurposingOptions = [
    {
      id: 'twitter-thread',
      title: 'Twitter Thread',
      description: 'Convert to engaging Twitter thread',
      limit: '280 chars per tweet'
    },
    {
      id: 'linkedin-post',
      title: 'LinkedIn Post',
      description: 'Professional LinkedIn post format',
      limit: '1300 chars recommended'
    },
    {
      id: 'youtube-script',
      title: 'YouTube Script',
      description: 'Video script with timestamps',
      limit: '8-12 minutes recommended'
    },
    {
      id: 'email-newsletter',
      title: 'Email Newsletter',
      description: 'Newsletter format with sections',
      limit: '500-800 words'
    },
    {
      id: 'instagram-quotes',
      title: 'Instagram Quotes',
      description: 'Key quotes for social posts',
      limit: 'Visual-friendly text'
    },
    {
      id: 'podcast-outline',
      title: 'Podcast Outline',
      description: 'Episode structure and talking points',
      limit: '30-60 minute episode'
    },
    {
      id: 'slide-deck',
      title: 'Slide Deck',
      description: 'Presentation slides from headings',
      limit: '10-15 slides'
    },
    {
      id: 'faq-section',
      title: 'FAQ Section',
      description: 'Questions and answers format',
      limit: '5-10 Q&As'
    },
    {
      id: 'case-study',
      title: 'Case Study',
      description: 'Transform into case study format',
      limit: 'Problem-solution structure'
    }
  ];

  const generateVariant = async (formatId: string) => {
    setIsGenerating(true);
    setActiveFormat(formatId);
    
    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockVariants = {
        'twitter-thread': [
          "🧵 THREAD: Everything you need to know about " + title + " (1/8)",
          "📊 The problem: Most people struggle with understanding the basics. Here's what you need to know...",
          "💡 Key insight #1: The first principle is crucial for success...",
          "🔑 Key insight #2: Implementation matters more than theory...",
          "⚡ Pro tip: Start small and scale gradually for better results...",
          "🎯 Common mistake: Don't try to do everything at once...",
          "✅ Action step: Begin with these three simple steps...",
          "🙏 That's a wrap! Found this helpful? RT the first tweet and follow for more insights!"
        ],
        'youtube-script': `# ${title} - YouTube Script

## Hook (0:00-0:15)
"If you've ever wondered about ${title.toLowerCase()}, this video will change everything you thought you knew..."

## Introduction (0:15-1:00)
Welcome back to the channel! Today we're diving deep into ${title.toLowerCase()}...

## Main Content (1:00-8:00)
### Section 1: The Basics
[Explain fundamental concepts]

### Section 2: Advanced Strategies
[Detailed implementation]

### Section 3: Common Pitfalls
[What to avoid]

## Call to Action (8:00-8:30)
If you found this helpful, smash that like button...`,
        'email-newsletter': `Subject: ${title} - Your Complete Guide

Hi [Name],

Hope you're having a great week! Today I want to share something that could completely transform how you think about ${title.toLowerCase()}.

**The Problem**
Most people struggle with this because...

**The Solution**
Here's what actually works...

**Key Takeaways:**
• Point one with actionable advice
• Point two with specific examples
• Point three with next steps

**What's Next?**
Try implementing just one of these strategies this week and let me know how it goes!

Best regards,
[Your Name]`
      };

      const generated = mockVariants[formatId as keyof typeof mockVariants] || 'Generated content would appear here...';
      
      const newVariant = {
        id: Date.now().toString(),
        formatId,
        content: generated,
        createdAt: new Date().toISOString(),
        wordCount: typeof generated === 'string' ? generated.split(' ').length : generated.length,
        characterCount: typeof generated === 'string' ? generated.length : generated.join(' ').length
      };

      setVariants(prev => [...prev, newVariant]);
      
      toast({
        title: "Content generated",
        description: `Successfully repurposed content for ${repurposingOptions.find(opt => opt.id === formatId)?.title}`
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate repurposed content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setActiveFormat(null);
    }
  };

  const copyToClipboard = (content: string | string[]) => {
    const text = typeof content === 'string' ? content : content.join('\n\n');
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard"
    });
  };

  const exportVariant = (variant: RepurposedVariant) => {
    const format = repurposingOptions.find(opt => opt.id === variant.formatId);
    const content = typeof variant.content === 'string' ? variant.content : variant.content.join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title} - ${format?.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Content exported as text file"
    });
  };

  if (!content || content.length < 100) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Add more content to enable repurposing features</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Repurposing Engine</CardTitle>
          <p className="text-sm text-gray-600">
            Transform your blog post into multiple content formats
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repurposingOptions.map((option) => {
              return (
                <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-medium">{option.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {option.limit}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => generateVariant(option.id)}
                        disabled={isGenerating && activeFormat === option.id}
                      >
                        {isGenerating && activeFormat === option.id ? 'Generating...' : 'Generate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variants.map((variant) => {
                const format = repurposingOptions.find(opt => opt.id === variant.formatId);

                return (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{format?.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(variant.content)}>
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => exportVariant(variant)}>
                          Export
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 mb-3 max-h-40 overflow-y-auto">
                      {typeof variant.content === 'string' ? (
                        <pre className="text-sm whitespace-pre-wrap">{variant.content}</pre>
                      ) : (
                        <div className="space-y-2">
                          {variant.content.map((item: string, index: number) => (
                            <div key={index} className="text-sm border-l-2 border-blue-200 pl-2">
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{variant.wordCount} words • {variant.characterCount} characters</span>
                      <span>Generated {new Date(variant.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
