
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface BrandVoiceCheckerProps {
  content: string;
  onContentUpdate: (newContent: string) => void;
}

export const BrandVoiceChecker: React.FC<BrandVoiceCheckerProps> = ({
  content,
  onContentUpdate
}) => {
  const [analysis, setAnalysis] = useState({
    score: 85,
    consistency: 78,
    tone_alignment: 92,
    suggestions: [
      'Use more active voice in paragraphs 2-3',
      'Consider adding brand-specific terminology',
      'Maintain consistent tone throughout'
    ]
  });
  const { toast } = useToast();

  const runAnalysis = async () => {
    // Simulate brand voice analysis
    toast({
      title: "Brand voice analyzed",
      description: "Content alignment score: 85%"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Brand Voice Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Brand Alignment</span>
              <span className="text-sm text-gray-600">{analysis.score}%</span>
            </div>
            <Progress value={analysis.score} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Tone Consistency</span>
              <span className="text-sm text-gray-600">{analysis.consistency}%</span>
            </div>
            <Progress value={analysis.consistency} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Voice Alignment</span>
              <span className="text-sm text-gray-600">{analysis.tone_alignment}%</span>
            </div>
            <Progress value={analysis.tone_alignment} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Improvement Suggestions</h4>
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
              <span className="text-sm">{suggestion}</span>
            </div>
          ))}
        </div>

        <Button onClick={runAnalysis} className="w-full">
          Analyze Brand Voice
        </Button>
      </CardContent>
    </Card>
  );
};
