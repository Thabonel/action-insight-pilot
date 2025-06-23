
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Sparkles,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface BrandVoiceCheckerProps {
  content: string;
}

export const BrandVoiceChecker: React.FC<BrandVoiceCheckerProps> = ({
  content
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please add some content first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate brand voice analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = {
        overallScore: 78,
        toneAlignment: 85,
        vocabularyScore: 72,
        styleCompliance: 76,
        flaggedPhrases: [
          { phrase: "really awesome", suggestion: "exceptional", confidence: 90 },
          { phrase: "pretty good", suggestion: "highly effective", confidence: 85 }
        ],
        improvementItems: [
          "Use more industry-specific terminology",
          "Maintain consistent tone throughout",
          "Replace casual language with professional alternatives"
        ],
        brandTerms: ["innovation", "excellence", "customer-centric", "sustainable"],
        suggestions: [
          {
            original: "This is a really great solution",
            improved: "This represents an exceptional solution",
            reason: "More professional and brand-aligned language"
          }
        ]
      };
      
      setAnalysis(mockAnalysis);
      toast({
        title: "Brand voice analysis complete",
        description: `Overall score: ${mockAnalysis.overallScore}%`
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze brand voice",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  useEffect(() => {
    if (content && content.length > 100) {
      analyzeContent();
    }
  }, [content]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Brand Voice Analysis
            </CardTitle>
            <Button onClick={analyzeContent} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start writing content to see brand voice analysis</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </div>
                <p className="text-gray-600">Brand Voice Alignment</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-semibold ${getScoreColor(analysis.toneAlignment)}`}>
                    {analysis.toneAlignment}%
                  </div>
                  <p className="text-sm text-gray-600">Tone Consistency</p>
                  <Progress value={analysis.toneAlignment} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-semibold ${getScoreColor(analysis.vocabularyScore)}`}>
                    {analysis.vocabularyScore}%
                  </div>
                  <p className="text-sm text-gray-600">Vocabulary Alignment</p>
                  <Progress value={analysis.vocabularyScore} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-semibold ${getScoreColor(analysis.styleCompliance)}`}>
                    {analysis.styleCompliance}%
                  </div>
                  <p className="text-sm text-gray-600">Style Compliance</p>
                  <Progress value={analysis.styleCompliance} className="mt-2" />
                </div>
              </div>

              {/* Flagged Phrases */}
              {analysis.flaggedPhrases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Flagged Phrases
                  </h4>
                  <div className="space-y-3">
                    {analysis.flaggedPhrases.map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm bg-red-50 px-2 py-1 rounded">
                            "{item.phrase}"
                          </span>
                          <Badge variant="outline">{item.confidence}% confident</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Suggested: <span className="font-mono bg-green-50 px-2 py-1 rounded">"{item.suggestion}"</span>
                          </span>
                          <Button size="sm" variant="outline">
                            Replace
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Terms */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Brand Terms Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.brandTerms.map((term: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Improvement Suggestions
                </h4>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Original:</span>
                        <div className="font-mono text-sm bg-red-50 p-2 rounded mt-1">
                          {suggestion.original}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Improved:</span>
                        <div className="font-mono text-sm bg-green-50 p-2 rounded mt-1">
                          {suggestion.improved}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{suggestion.reason}</span>
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
