
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { 
  Wand2, 
  Target, 
  TrendingUp, 
  Clock, 
  FileText,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';

const IntelligentContentGenerator: React.FC = () => {
  const [contentTopic, setContentTopic] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [predictionScore, setPredictionScore] = useState(0);

  const [suggestedFormats] = useState([
    { name: 'How-to Guide', score: 94, reason: 'Your top performer' },
    { name: 'List Article', score: 87, reason: '32% better engagement' },
    { name: 'Case Study', score: 82, reason: 'High conversion rate' },
    { name: 'Tutorial', score: 79, reason: 'Good for your audience' }
  ]);

  const [topicSuggestions] = useState([
    'Marketing Automation Best Practices',
    'Lead Generation Strategies',
    'Email Campaign Optimization',
    'Social Media ROI Measurement',
    'Content Marketing Analytics'
  ]);

  const handleTopicChange = (topic: string) => {
    setContentTopic(topic);
    // Simulate prediction score calculation
    const score = Math.floor(Math.random() * 30) + 70;
    setPredictionScore(score);
    
    behaviorTracker.trackAction('feature_use', 'content_topic_input', {
      topic,
      predictedScore: score
    });
  };

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    behaviorTracker.trackAction('feature_use', 'content_format_select', {
      format,
      topic: contentTopic
    });
  };

  const generateContent = () => {
    if (!contentTopic || !selectedFormat) return;
    
    // Simulate content generation
    const sampleContent = `# ${contentTopic}

## Introduction
Based on your successful content patterns, this ${selectedFormat.toLowerCase()} follows the structure that performs best for your audience.

## Key Points
- Point 1: Leveraging your proven engagement strategies
- Point 2: Using your optimal content length (800-1200 words)
- Point 3: Including actionable takeaways (your audience's favorite)

## Conclusion
This content is optimized for your audience based on ${predictionScore}% prediction accuracy.`;

    setGeneratedContent(sampleContent);
    
    behaviorTracker.trackAction('feature_use', 'content_generation', {
      topic: contentTopic,
      format: selectedFormat,
      predictedScore: predictionScore
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            <span>Intelligent Content Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Topic
            </label>
            <Input
              placeholder="Enter your content topic..."
              value={contentTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTopicChange(topic)}
                  className="text-xs"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          {/* Performance Prediction */}
          {contentTopic && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Performance Prediction</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-blue-600">{predictionScore}%</div>
                <div className="text-sm text-blue-700">
                  Expected engagement based on your historical data
                </div>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Format (Based on Your Success Patterns)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {suggestedFormats.map((format, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedFormat === format.name 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleFormatSelect(format.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{format.name}</span>
                      <Badge variant="secondary">{format.score}%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{format.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateContent}
            disabled={!contentTopic || !selectedFormat}
            className="w-full"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Optimized Content
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Generated Content</span>
              <Badge variant="secondary" className="ml-auto">
                {predictionScore}% predicted engagement
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  A/B Test
                </Button>
              </div>
              <Button size="sm">
                Publish Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentContentGenerator;
