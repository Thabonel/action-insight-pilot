
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Edit, 
  Sparkles, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AIWritingAssistantProps {
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const analyzeSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSuggestions = [
        {
          type: 'improvement',
          title: 'Add more specific examples',
          description: 'Consider adding concrete examples to illustrate your points',
          location: 'Paragraph 2',
          confidence: 85
        },
        {
          type: 'seo',
          title: 'Include target keyword',
          description: 'Add your target keyword 2-3 more times throughout the content',
          location: 'Throughout',
          confidence: 92
        },
        {
          type: 'readability',
          title: 'Shorten long sentences',
          description: 'Break down sentences longer than 20 words for better readability',
          location: 'Paragraph 4',
          confidence: 78
        }
      ];
      
      setSuggestions(mockSuggestions);
      toast({
        title: "Analysis complete",
        description: `Found ${mockSuggestions.length} suggestions for improvement`
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze content",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    // Simulate applying suggestion
    toast({
      title: "Suggestion applied",
      description: suggestion.title
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Writing Assistant
            </CardTitle>
            <Button onClick={analyzeSuggestions} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Click "Analyze Content" to get AI-powered writing suggestions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'improvement' && <Edit className="h-4 w-4 text-blue-500" />}
                      {suggestion.type === 'seo' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {suggestion.type === 'readability' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                      <h4 className="font-medium">{suggestion.title}</h4>
                    </div>
                    <Badge variant="outline">{suggestion.confidence}% confident</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Location: {suggestion.location}</span>
                    <Button size="sm" onClick={() => applySuggestion(suggestion)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
