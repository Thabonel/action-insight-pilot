
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Wand2,
  BookOpen,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { BrandVoiceAnalysis } from '@/lib/api/brand-methods';

interface BrandVoiceCheckerProps {
  content: string;
  onChange?: (content: string) => void;
  brandId?: string;
}

const BrandVoiceChecker: React.FC<BrandVoiceCheckerProps> = ({
  content,
  onChange,
  brandId
}) => {
  const [analysis, setAnalysis] = useState<BrandVoiceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [brandTerms, setBrandTerms] = useState<string[]>([]);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);

  const analyzeContent = useCallback(async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await apiClient.brand.analyzeBrandVoice(content, brandId);
      if (response.success && response.data) {
        setAnalysis(response.data);
        setScoreHistory(prev => [...prev.slice(-9), response.data.score]);
      }
    } catch (error) {
      console.error('Brand voice analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, brandId]);

  const loadBrandTerms = useCallback(async () => {
    try {
      const response = await apiClient.brand.getBrandTerminology(brandId);
      if (response.success && response.data) {
        setBrandTerms(response.data.terms);
      }
    } catch (error) {
      console.error('Failed to load brand terms:', error);
    }
  }, [brandId]);

  const getSuggestions = async (text: string) => {
    try {
      const response = await apiClient.brand.suggestBrandAlternatives(text, brandId);
      if (response.success && response.data) {
        setSuggestions(response.data.alternatives);
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const enhanceVoice = async (targetVoice: string) => {
    try {
      const response = await apiClient.brand.enhanceBrandVoice(content, targetVoice, brandId);
      if (response.success && response.data && onChange) {
        onChange(response.data.enhanced_content);
      }
    } catch (error) {
      console.error('Failed to enhance voice:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      analyzeContent();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [analyzeContent]);

  useEffect(() => {
    loadBrandTerms();
  }, [loadBrandTerms]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Brand Voice Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Brand Voice Analysis</span>
            {isAnalyzing && (
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Brand Voice Score</span>
                <Badge variant={getScoreBadgeVariant(analysis.score)}>
                  {analysis.score}/100
                </Badge>
              </div>
              <Progress value={analysis.score} className="h-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Tone Consistency</span>
                    <span className={`text-xs font-medium ${getScoreColor(analysis.tone_alignment)}`}>
                      {analysis.tone_alignment}%
                    </span>
                  </div>
                  <Progress value={analysis.tone_alignment} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Vocabulary Match</span>
                    <span className={`text-xs font-medium ${getScoreColor(analysis.consistency)}`}>
                      {analysis.consistency}%
                    </span>
                  </div>
                  <Progress value={analysis.consistency} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Style Compliance</span>
                    <span className={`text-xs font-medium ${getScoreColor(analysis.style_compliance.formality)}`}>
                      {analysis.style_compliance.formality}%
                    </span>
                  </div>
                  <Progress value={analysis.style_compliance.formality} className="h-2" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start writing to see brand voice analysis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vocabulary Issues and Suggestions */}
      {analysis && analysis.vocabulary_issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Vocabulary Issues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {analysis.vocabulary_issues.map((issue, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100"
                    onClick={() => {
                      setSelectedText(issue);
                      getSuggestions(issue);
                    }}
                  >
                    <span className="text-sm font-medium text-yellow-800">"{issue}"</span>
                    <Button size="sm" variant="ghost">
                      <Wand2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Brand-Aligned Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span>Brand-Aligned Alternatives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Suggestions for: <span className="font-medium">"{selectedText}"</span>
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => {
                      if (onChange) {
                        const newContent = content.replace(selectedText, suggestion);
                        onChange(newContent);
                      }
                      setSuggestions([]);
                      setSelectedText('');
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Enhancement Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Brand Voice Enhancement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceVoice('professional')}
            >
              More Professional
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceVoice('friendly')}
            >
              More Friendly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceVoice('authoritative')}
            >
              More Authoritative
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceVoice('conversational')}
            >
              More Conversational
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brand Terminology Glossary */}
      {brandTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span>Brand Terminology</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-24">
              <div className="flex flex-wrap gap-1">
                {brandTerms.map((term, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {term}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Score History Trend */}
      {scoreHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Brand Alignment Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Recent Sessions</span>
                <span className="font-medium">
                  {scoreHistory[scoreHistory.length - 1] > scoreHistory[scoreHistory.length - 2] ? (
                    <span className="text-green-600">↗ Improving</span>
                  ) : (
                    <span className="text-red-600">↘ Declining</span>
                  )}
                </span>
              </div>
              <div className="flex items-end space-x-1 h-12">
                {scoreHistory.map((score, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 rounded-t"
                    style={{
                      height: `${(score / 100) * 100}%`,
                      minHeight: '4px',
                      width: '100%'
                    }}
                    title={`Session ${index + 1}: ${score}%`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Style Compliance Details */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Writing Style Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sentence Length</span>
                  <Badge variant={getScoreBadgeVariant(analysis.style_compliance.sentence_length)}>
                    {analysis.style_compliance.sentence_length}%
                  </Badge>
                </div>
                <Progress value={analysis.style_compliance.sentence_length} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Complexity</span>
                  <Badge variant={getScoreBadgeVariant(analysis.style_compliance.complexity)}>
                    {analysis.style_compliance.complexity}%
                  </Badge>
                </div>
                <Progress value={analysis.style_compliance.complexity} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formality</span>
                  <Badge variant={getScoreBadgeVariant(analysis.style_compliance.formality)}>
                    {analysis.style_compliance.formality}%
                  </Badge>
                </div>
                <Progress value={analysis.style_compliance.formality} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandVoiceChecker;
