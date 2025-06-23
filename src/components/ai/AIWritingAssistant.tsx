
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Lightbulb, 
  TrendingUp, 
  Link, 
  RefreshCw,
  Expand,
  MessageSquare,
  BarChart3,
  Eye,
  Edit3
} from 'lucide-react';

interface AIWritingAssistantProps {
  content: string;
  onContentUpdate: (content: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  content,
  onContentUpdate,
  isVisible,
  onToggle
}) => {
  const [readabilityScore, setReadabilityScore] = useState(75);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [structure, setStructure] = useState({
    intro: 20,
    body: 60,
    conclusion: 20
  });

  useEffect(() => {
    if (content) {
      // Simulate AI analysis
      const words = content.split(' ').length;
      const sentences = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = words / sentences;
      
      // Simple readability calculation
      const score = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));
      setReadabilityScore(Math.round(score));

      // Generate suggestions based on content
      const newSuggestions = [];
      if (avgWordsPerSentence > 20) {
        newSuggestions.push("Consider breaking up long sentences for better readability");
      }
      if (words < 300) {
        newSuggestions.push("Add more supporting details to reach optimal length");
      }
      if (!content.includes('?')) {
        newSuggestions.push("Consider adding questions to engage readers");
      }
      setSuggestions(newSuggestions);
    }
  }, [content]);

  const handleExpandSection = (section: string) => {
    // Simulate AI expansion
    const expandedContent = `${content}\n\n[AI-generated expansion for ${section}...]`;
    onContentUpdate(expandedContent);
  };

  const handleRephrase = (tone: string) => {
    // Simulate AI rephrasing
    const rephrasedContent = `[Content rephrased in ${tone} tone]\n${content}`;
    onContentUpdate(rephrasedContent);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Writing Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-full pb-20">
        <div className="p-4 space-y-6">
          {/* Real-time Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Readability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score</span>
                  <span className="font-medium">{readabilityScore}/100</span>
                </div>
                <Progress value={readabilityScore} className="w-full" />
                <Badge 
                  variant={readabilityScore >= 70 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {readabilityScore >= 70 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Content Structure */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Content Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(structure).map(([section, percentage]) => (
                  <div key={section} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{section}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="w-full h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Writing Suggestions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                    {suggestion}
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Start writing to get AI suggestions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Enhancement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Edit3 className="h-4 w-4 mr-2" />
                Enhance Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => handleExpandSection('current')}
                >
                  <Expand className="h-3 w-3 mr-2" />
                  Expand This Section
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => handleRephrase('professional')}
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Rephrase (Professional)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => handleRephrase('friendly')}
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Rephrase (Friendly)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Research */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Research Similar Articles
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-2" />
                  Find Trending Topics
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  <Link className="h-3 w-3 mr-2" />
                  Suggest Links
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Trending in Your Niche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">AI Writing</Badge>
                <Badge variant="secondary" className="text-xs">Content Marketing</Badge>
                <Badge variant="secondary" className="text-xs">SEO Tips</Badge>
                <Badge variant="secondary" className="text-xs">Blog Growth</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIWritingAssistant;
