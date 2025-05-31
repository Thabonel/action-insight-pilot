
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Zap, TrendingUp } from 'lucide-react';

interface AIGreetingProps {
  insights: {
    totalActions: number;
    sessionDuration: number;
    topFeatures: string[];
    productivityScore: number;
    recommendations: string[];
  };
}

const AIGreeting: React.FC<AIGreetingProps> = ({ insights }) => {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    if (hour >= 5 && hour < 12) {
      return isWeekend 
        ? "Good morning, weekend warrior! 🌅 Ready to get ahead of the competition?"
        : "Good morning! ☀️ Let's make today's marketing efforts count.";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon! 🚀 Your campaigns are running - let's optimize them.";
    } else if (hour >= 17 && hour < 22) {
      return "Good evening! 🌙 Perfect time to review today's performance.";
    } else {
      return "Working late? 🌟 I'm here to help you maximize every minute.";
    }
  };

  const getContextualSuggestion = () => {
    const hour = new Date().getHours();
    
    if (insights.productivityScore > 80) {
      return "You're on fire today! Your productivity score is " + insights.productivityScore + "%. Time to tackle your biggest challenges.";
    } else if (hour >= 9 && hour < 11) {
      return "Peak morning hours - perfect time for strategic campaign planning.";
    } else if (hour >= 14 && hour < 16) {
      return "Afternoon focus time - ideal for content creation and optimization.";
    } else {
      return "Let's analyze your data and find opportunities for growth.";
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black/10"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{getTimeBasedGreeting()}</h1>
                <p className="text-blue-100">{getContextualSuggestion()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-right">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Session</span>
              </div>
              <p className="text-xl font-bold">{Math.floor(insights.sessionDuration / 60000)}m</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Productivity</span>
              </div>
              <p className="text-xl font-bold">{insights.productivityScore}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGreeting;
