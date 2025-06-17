
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface RealInsights {
  totalUsers?: number;
  activeFeatures?: string[];
  recentActions?: Array<{
    action: string;
    timestamp: Date;
    feature: string;
  }>;
  systemHealth?: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastCheck: Date;
  };
}

interface AIGreetingProps {
  insights: RealInsights | null;
}

const AIGreeting: React.FC<AIGreetingProps> = ({ insights }) => {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPersonalizedMessage = () => {
    if (!insights) return "Let's optimize your marketing strategy today.";
    
    const { activeFeatures, recentActions, systemHealth } = insights;
    
    if (systemHealth?.status === 'error') {
      return "I'm experiencing some connectivity issues, but I'm here to help with what I can.";
    }
    
    if (activeFeatures && activeFeatures.length > 0) {
      return `You have ${activeFeatures.length} active features. Ready to dive deeper into your ${activeFeatures[0].toLowerCase()}?`;
    }
    
    if (recentActions && recentActions.length > 0) {
      return `I see you've been working on ${recentActions[0].feature.toLowerCase()}. Let's continue optimizing your strategy.`;
    }
    
    return "Ready to help you build and optimize your marketing campaigns.";
  };

  if (!insights) {
    // Loading state
    return (
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
        <CardContent className="p-6">
          {/* Logout button in top-right corner */}
          <div className="absolute top-4 right-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 p-2"
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out of your account?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{getGreeting()}! 👋</h2>
              <div className="h-4 bg-white/20 rounded w-48 mt-1 animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 bg-white/20 rounded w-64 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
      <CardContent className="p-6">
        {/* Logout button in top-right corner */}
        <div className="absolute top-4 right-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 p-2"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out of your account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{getGreeting()}! 👋</h2>
            <p className="text-blue-100">I'm your AI Marketing Assistant</p>
          </div>
        </div>
        
        <p className="text-white/90 mb-4">
          {getPersonalizedMessage()}
        </p>
        
        <div className="flex items-center space-x-4 text-sm">
          {insights.systemHealth && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                insights.systemHealth.status === 'healthy' ? 'bg-green-400' :
                insights.systemHealth.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-white/80">System {insights.systemHealth.status}</span>
            </div>
          )}
          
          {insights.activeFeatures && insights.activeFeatures.length > 0 && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-white/80">{insights.activeFeatures.length} active features</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span className="text-white/80">Updated now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGreeting;
