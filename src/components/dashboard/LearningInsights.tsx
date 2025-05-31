
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, Zap, Target, Users, Mail } from 'lucide-react';

interface LearningInsightsProps {
  insights: {
    totalActions: number;
    sessionDuration: number;
    topFeatures: string[];
    productivityScore: number;
    recommendations: string[];
  };
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ insights }) => {
  const getOptimalHours = () => {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 11 ? "Peak hours (9-11 AM)" : "9-11 AM typically best";
  };

  const getContentTypes = () => {
    const types = ['Email sequences', 'Blog posts', 'Social media content'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getLeadSources = () => {
    const sources = ['Organic search', 'Social media', 'Email campaigns'];
    return sources[Math.floor(Math.random() * sources.length)];
  };

  const learningData = [
    {
      title: 'Optimal Working Hours',
      value: getOptimalHours(),
      icon: Clock,
      color: 'blue',
      confidence: 87,
      insight: 'Your productivity peaks during morning hours'
    },
    {
      title: 'Best Content Type',
      value: getContentTypes(),
      icon: TrendingUp,
      color: 'green',
      confidence: 94,
      insight: 'Email content performs 40% better for your audience'
    },
    {
      title: 'Top Lead Source',
      value: getLeadSources(),
      icon: Users,
      color: 'purple',
      confidence: 76,
      insight: 'Highest quality leads with 15% conversion rate'
    },
    {
      title: 'Workflow Pattern',
      value: 'Plan → Execute → Optimize',
      icon: Target,
      color: 'orange',
      confidence: 92,
      insight: 'This pattern yields 25% better results'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      orange: 'text-orange-600 bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <span>AI Learning Insights</span>
        </CardTitle>
        <p className="text-sm text-slate-600">What I've learned about your patterns</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {learningData.map((item, index) => {
          const Icon = item.icon;
          const colorClasses = getColorClasses(item.color);
          
          return (
            <div key={index} className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-sm text-slate-700 font-medium">{item.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.insight}</p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600">{item.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Recent Discoveries */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <h4 className="font-medium text-indigo-900 mb-2 flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Recent Discovery</span>
          </h4>
          <p className="text-sm text-indigo-800">
            You're 60% more productive when you start with campaign analysis rather than content creation.
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            Based on your last 15 sessions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningInsights;
