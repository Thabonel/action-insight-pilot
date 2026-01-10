
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { RealInsights } from '@/types/insights';

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

    if (insights.recentActivities && insights.recentActivities.length > 0) {
      return `I see you've been working on your campaigns. Let's continue optimizing your strategy.`;
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
                  Sign out
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
            </div>
            <div>
              <h2 className="text-xl font-semibold">{getGreeting()}!</h2>
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
                Sign out
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
          </div>
          <div>
            <h2 className="text-xl font-semibold">{getGreeting()}!</h2>
            <p className="text-blue-100">I'm your AI Marketing Assistant</p>
          </div>
        </div>

        <p className="text-white/90 mb-4">
          {getPersonalizedMessage()}
        </p>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-white/80">System healthy</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-white/80">{insights.totalActions} total actions</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-white/80">Updated now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGreeting;
