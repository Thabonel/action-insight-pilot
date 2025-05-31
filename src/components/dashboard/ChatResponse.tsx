
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Zap, BarChart3, Users, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ChatResponseProps {
  response: {
    type: string;
    title: string;
    data?: any[];
    suggestions?: any[];
    explanation: string;
    businessImpact: string;
    nextActions: string[];
  };
}

const ChatResponse: React.FC<ChatResponseProps> = ({ response }) => {
  const renderVisualization = () => {
    switch (response.type) {
      case 'campaigns_performance':
        return (
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={response.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'lead_conversion':
        return (
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={response.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'content_suggestions':
        return (
          <div className="grid gap-3 mb-4">
            {response.suggestions?.map((suggestion: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                <div>
                  <span className="font-medium text-slate-900">{suggestion.type}</span>
                  <p className="text-sm text-slate-600">{suggestion.topic}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
                      style={{ width: `${suggestion.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{suggestion.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Zap className="h-4 w-4 text-white" />
      </div>
      
      <Card className="flex-1 border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">{response.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Visualization */}
          {renderVisualization()}
          
          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">What this means</h4>
                <p className="text-blue-800 text-sm">{response.explanation}</p>
              </div>
            </div>
          </div>
          
          {/* Business Impact */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Business Impact</h4>
                <p className="text-green-800 text-sm">{response.businessImpact}</p>
              </div>
            </div>
          </div>
          
          {/* Next Actions */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-purple-900 mb-2">Recommended Actions</h4>
                <ul className="space-y-1">
                  {response.nextActions.map((action, index) => (
                    <li key={index} className="text-purple-800 text-sm flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatResponse;
