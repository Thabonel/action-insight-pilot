
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PenTool, 
  Lightbulb, 
  BarChart3, 
  Search, 
  Target, 
  ChevronDown,
  ChevronUp,
  Wand2,
  RefreshCw,
  Link,
  TrendingUp
} from 'lucide-react';

interface WritingSuggestion {
  id: string;
  type: 'grammar' | 'style' | 'structure' | 'content';
  text: string;
  suggestion: string;
  confidence: number;
}

interface ReadabilityMetrics {
  score: number;
  grade: string;
  recommendations: string[];
}

interface ContentAnalysis {
  wordCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  structure: {
    hasIntro: boolean;
    hasConclusion: boolean;
    bodyBalance: 'good' | 'poor' | 'fair';
  };
}

interface AIWritingAssistantProps {
  content: string;
  onContentUpdate: (newContent: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  content,
  onContentUpdate,
  isVisible,
  onToggle
}) => {
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [readability, setReadability] = useState<ReadabilityMetrics>({
    score: 65,
    grade: 'B',
    recommendations: []
  });
  const [analysis, setAnalysis] = useState<ContentAnalysis>({
    wordCount: 0,
    paragraphCount: 0,
    avgSentenceLength: 0,
    structure: {
      hasIntro: false,
      hasConclusion: false,
      bodyBalance: 'fair'
    }
  });
  const [expandedSections, setExpandedSections] = useState({
    suggestions: true,
    readability: true,
    research: false
  });

  useEffect(() => {
    if (content) {
      analyzeContent(content);
      generateSuggestions(content);
    }
  }, [content]);

  const analyzeContent = (text: string) => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    const wordCount = words.length;
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    
    // Simple structure analysis
    const hasIntro = text.toLowerCase().includes('introduction') || 
                    text.toLowerCase().includes('in this') ||
                    paragraphs.length > 0 && paragraphs[0].length > 100;
    const hasConclusion = text.toLowerCase().includes('conclusion') ||
                         text.toLowerCase().includes('in summary') ||
                         text.toLowerCase().includes('to conclude');

    setAnalysis({
      wordCount,
      paragraphCount: paragraphs.length,
      avgSentenceLength: Math.round(avgSentenceLength),
      structure: {
        hasIntro,
        hasConclusion,
        bodyBalance: paragraphs.length >= 3 ? 'good' : 'fair'
      }
    });

    // Calculate readability score (simplified)
    const score = Math.max(20, Math.min(100, 100 - (avgSentenceLength * 2)));
    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
    
    const recommendations = [];
    if (avgSentenceLength > 20) recommendations.push('Consider shorter sentences for better readability');
    if (!hasIntro) recommendations.push('Add a clear introduction to engage readers');
    if (!hasConclusion) recommendations.push('Include a conclusion to summarize key points');
    if (wordCount < 300) recommendations.push('Consider expanding content for better SEO');

    setReadability({
      score: Math.round(score),
      grade,
      recommendations
    });
  };

  const generateSuggestions = (text: string) => {
    const mockSuggestions: WritingSuggestion[] = [
      {
        id: '1',
        type: 'grammar',
        text: 'This sentence could be improved',
        suggestion: 'Consider using active voice instead of passive voice',
        confidence: 85
      },
      {
        id: '2',
        type: 'style',
        text: 'The tone here seems inconsistent',
        suggestion: 'Maintain a consistent professional tone throughout',
        confidence: 78
      },
      {
        id: '3',
        type: 'content',
        text: 'This paragraph needs more detail',
        suggestion: 'Add specific examples or statistics to support your point',
        confidence: 92
      }
    ];

    setSuggestions(mockSuggestions);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExpandSection = (paragraphIndex: number) => {
    // Mock implementation - in real app, this would call AI service
    const expandedText = `\n\nExpanded content for paragraph ${paragraphIndex + 1}. This would include additional details, examples, and supporting information generated by AI based on the context.`;
    onContentUpdate(content + expandedText);
  };

  const handleRephrase = (tone: string) => {
    // Mock implementation - in real app, this would call AI service
    console.log(`Rephrasing content with ${tone} tone`);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
        size="sm"
        variant="outline"
      >
        <PenTool className="h-4 w-4 mr-2" />
        Writing Assistant
      </Button>
    );
  }

  return (
    <div className="w-80 bg-background border-l border-border h-full flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center">
          <PenTool className="h-5 w-5 mr-2" />
          Writing Assistant
        </h3>
        <Button onClick={onToggle} variant="ghost" size="sm">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4 space-y-4">
        {/* Real-time Suggestions */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('suggestions')}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggestions ({suggestions.length})
              </span>
              {expandedSections.suggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.suggestions && (
            <CardContent className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={suggestion.type === 'grammar' ? 'destructive' : 'secondary'}>
                      {suggestion.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm">{suggestion.suggestion}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Apply Suggestion
                  </Button>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Readability Score */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('readability')}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Readability
              </span>
              {expandedSections.readability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.readability && (
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{readability.grade}</span>
                <span className="text-sm text-muted-foreground">Grade</span>
              </div>
              <Progress value={readability.score} className="w-full" />
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="font-medium">{analysis.wordCount}</div>
                    <div className="text-muted-foreground">Words</div>
                  </div>
                  <div>
                    <div className="font-medium">{analysis.paragraphCount}</div>
                    <div className="text-muted-foreground">Paragraphs</div>
                  </div>
                  <div>
                    <div className="font-medium">{analysis.avgSentenceLength}</div>
                    <div className="text-muted-foreground">Avg Length</div>
                  </div>
                </div>
                {readability.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-muted-foreground">{rec}</p>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Content Enhancement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Wand2 className="h-4 w-4 mr-2" />
              Enhance Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Expand Current Section
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleRephrase('professional')}
              >
                Professional
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleRephrase('casual')}
              >
                Casual
              </Button>
            </div>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Improve Transitions
            </Button>
          </CardContent>
        </Card>

        {/* Research & Analysis */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('research')}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Research & Insights
              </span>
              {expandedSections.research ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.research && (
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Research Similar Articles
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending Topics
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Link className="h-4 w-4 mr-2" />
                Suggest Links
              </Button>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium">Content Gaps</p>
                <p className="text-xs text-muted-foreground">
                  Consider adding sections on implementation examples and best practices.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </ScrollArea>
    </div>
  );
};
