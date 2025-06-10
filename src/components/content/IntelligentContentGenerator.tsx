
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useAIOperation } from '@/hooks/useAIOperation';
import { 
  Wand2, 
  Target, 
  TrendingUp, 
  Clock, 
  FileText,
  BarChart3,
  Lightbulb,
  Zap,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const IntelligentContentGenerator: React.FC = () => {
  const [contentTopic, setContentTopic] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [predictionScore, setPredictionScore] = useState(0);
  const [platform, setPlatform] = useState('blog');
  const [brandVoice, setBrandVoice] = useState('professional');

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

  const contentGeneration = useAIOperation({
    successMessage: "Content generated successfully!",
    onSuccess: (data) => {
      if (data.content) {
        setGeneratedContent(data.content);
      }
    }
  });

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

  const generateContent = async () => {
    if (!contentTopic || !selectedFormat) return;
    
    behaviorTracker.trackAction('feature_use', 'ai_content_generation', {
      topic: contentTopic,
      format: selectedFormat,
      platform,
      brandVoice,
      predictedScore: predictionScore
    });

    await contentGeneration.execute(() => 
      apiClient.generateSocialContent(platform, contentTopic, brandVoice)
    );
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
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Platform
            </label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="blog">Blog Post</option>
              <option value="social">Social Media</option>
              <option value="email">Email Content</option>
              <option value="website">Website Copy</option>
            </select>
          </div>

          {/* Brand Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Voice
            </label>
            <select 
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
              <option value="technical">Technical</option>
            </select>
          </div>

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
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-900">AI Content Generation</h4>
              {contentGeneration.loading && <LoadingSpinner size="sm" />}
            </div>
            <Button
              onClick={generateContent}
              disabled={!contentTopic || !selectedFormat || contentGeneration.loading}
              className="w-full"
              size="lg"
            >
              {contentGeneration.loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Optimized Content
                </>
              )}
            </Button>
            {contentGeneration.error && (
              <p className="text-sm text-red-600 mt-2">{contentGeneration.error}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {(generatedContent || contentGeneration.data) && (
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
              value={generatedContent || contentGeneration.data?.content || ''}
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
