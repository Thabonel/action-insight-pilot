
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import LogoMarkIcon from '@/components/LogoMarkIcon';

const AnalyticsAIAssistant: React.FC = () => {
  const [insights] = useState({
    totalROI: 284,
    bestChannel: 'Email Marketing',
    conversionTrend: '+23%',
    riskLevel: 'Low',
    nextAction: 'Increase email frequency',
    confidence: 91
  });

  const [questions] = useState([
    {
      id: 1,
      question: "Which campaign generated the highest ROI last month?",
      answer: "Your 'Product Demo' email campaign achieved 340% ROI with $12,400 revenue from $3,650 spend.",
      confidence: 94,
      category: "ROI Analysis"
    },
    {
      id: 2,
      question: "What's the best time to launch our next campaign?",
      answer: "Tuesday at 10 AM shows 67% higher open rates. Your audience is most active then.",
      confidence: 89,
      category: "Timing"
    },
    {
      id: 3,
      question: "Why did our social media performance drop?",
      answer: "Engagement dropped 34% due to algorithm changes. Recommend increasing video content by 40%.",
      confidence: 87,
      category: "Performance"
    }
  ]);

  const [recommendations] = useState([
    {
      id: 1,
      type: "optimization",
      title: "Reallocate Budget to High-ROI Channels",
      description: "Move 25% budget from social to email marketing",
      impact: "+$4,200 projected revenue",
      effort: "Low"
    },
    {
      id: 2,
      type: "risk",
      title: "Campaign Fatigue Detection",
      description: "Email open rates declining 2% weekly",
      impact: "Potential 15% revenue loss",
      effort: "Medium"
    },
    {
      id: 3,
      type: "opportunity",
      title: "Content Gap Opportunity",
      description: "High search volume for 'AI automation guides'",
      impact: "+300 potential leads",
      effort: "High"
    }
  ]);

  const handleQuestionClick = (question: { id: number; question: string; answer: string; confidence: number; category: string }) => {
    behaviorTracker.trackAction('feature_use', 'analytics_ai_question', {
      questionId: question.id,
      category: question.category,
      confidence: question.confidence
    });
  };

  const handleRecommendationClick = (rec: { id: number; type: string; title: string; description: string; impact: string; effort: string }) => {
    behaviorTracker.trackAction('feature_use', 'analytics_recommendation', {
      recommendationType: rec.type,
      recommendationId: rec.id,
      impact: rec.impact
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LogoMarkIcon className="h-5 w-5" />
          <span>Analytics AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Insights */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Key Performance Insights</h4>
          <div className="space-y-1">
            <p className="text-sm text-purple-700">
              Overall ROI: <span className="font-semibold">{insights.totalROI}%</span>
            </p>
            <p className="text-sm text-purple-700">
              Top channel: <span className="font-semibold">{insights.bestChannel}</span>
            </p>
            <p className="text-sm text-purple-700">
              Conversion trend: <span className="font-semibold">{insights.conversionTrend}</span>
            </p>
          </div>
          <div className="mt-2 text-xs text-purple-600">
            AI Confidence: {insights.confidence}%
          </div>
        </div>

        {/* Quick Questions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Ask Your Data</h4>
          <div className="space-y-2">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleQuestionClick(q)}
                className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 mb-1">{q.question}</p>
                <p className="text-xs text-gray-600 mb-2">{q.answer}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {q.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{q.confidence}% confident</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const getTypeColor = (type: string) => {
                switch (type) {
                  case 'optimization': return 'text-green-600 bg-green-50';
                  case 'risk': return 'text-red-600 bg-red-50';
                  case 'opportunity': return 'text-blue-600 bg-blue-50';
                  default: return 'text-gray-600 bg-gray-50';
                }
              };

              return (
                <div
                  key={rec.id}
                  onClick={() => handleRecommendationClick(rec)}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                      <span className="text-xs font-medium uppercase">{rec.type.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm mb-1">{rec.title}</h5>
                      <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">{rec.impact}</span>
                        <Badge variant="outline" className="text-xs">
                          {rec.effort} effort
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Best Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Recommended Next Action</h4>
          <p className="text-sm text-gray-700 mb-3">{insights.nextAction}</p>
          <Button size="sm" className="w-full">
            Take Action
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsAIAssistant;
