import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Wand2,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeFlowProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

type WelcomeStep = 'welcome' | 'path-choice' | 'explanation' | 'ready';

export const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onComplete, forceShow = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WelcomeStep>('welcome');
  const [selectedPath, setSelectedPath] = useState<'autopilot' | 'quickstart' | null>(null);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    const hasSeenWelcome = localStorage.getItem('welcome_flow_completed');
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');

    if (!hasSeenWelcome && !hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('welcome_flow_completed', 'true');
    onComplete?.();
  };

  const handlePathSelect = (path: 'autopilot' | 'quickstart') => {
    setSelectedPath(path);
    setCurrentStep('explanation');
  };

  const handleGetStarted = () => {
    handleClose();
    if (selectedPath === 'autopilot') {
      navigate('/app/autopilot');
    } else {
      navigate('/app/quick-start');
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center py-6">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Rocket className="h-10 w-10 text-white" />
      </div>

      <DialogTitle className="text-2xl font-bold mb-3">
        Welcome to your Marketing Command Center
      </DialogTitle>

      <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        This platform helps you market your business automatically using AI.
        No marketing experience needed - we'll guide you every step of the way.
      </DialogDescription>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Find your customers</p>
        </div>
        <div className="text-center p-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">AI creates content</p>
        </div>
        <div className="text-center p-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Grow your business</p>
        </div>
      </div>

      <Button onClick={() => setCurrentStep('path-choice')} size="lg" className="w-full max-w-xs">
        Let's Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderPathChoice = () => (
    <div className="py-4">
      <DialogTitle className="text-xl font-bold mb-2 text-center">
        How would you like to work?
      </DialogTitle>

      <DialogDescription className="text-center mb-6 text-gray-600 dark:text-gray-400">
        Choose based on how much control you want. You can always switch later.
      </DialogDescription>

      <div className="grid gap-4">
        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-purple-300 hover:shadow-md',
            selectedPath === 'autopilot' && 'border-purple-500 bg-purple-50 dark:bg-purple-950'
          )}
          onClick={() => handlePathSelect('autopilot')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wand2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">AI Autopilot</CardTitle>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    Recommended
                  </Badge>
                </div>
                <CardDescription>
                  AI handles everything - just describe your business
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                <Clock className="h-3 w-3 inline mr-1" />
                5 min setup
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                <Zap className="h-3 w-3 inline mr-1" />
                Hands-free
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                <Sparkles className="h-3 w-3 inline mr-1" />
                AI optimizes daily
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-blue-300 hover:shadow-md',
            selectedPath === 'quickstart' && 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          )}
          onClick={() => handlePathSelect('quickstart')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Guided Quick Start</CardTitle>
                <CardDescription>
                  Chat with AI to plan your campaign step-by-step
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                <MessageSquare className="h-3 w-3 inline mr-1" />
                Conversational
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                <Users className="h-3 w-3 inline mr-1" />
                More control
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                <Target className="h-3 w-3 inline mr-1" />
                Learn as you go
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        Not sure? Try Autopilot first - you can always switch to more control later.
      </p>
    </div>
  );

  const renderExplanation = () => {
    const isAutopilot = selectedPath === 'autopilot';

    return (
      <div className="py-4">
        <DialogTitle className="text-xl font-bold mb-2 text-center">
          {isAutopilot ? "Here's how Autopilot works" : "Here's how Quick Start works"}
        </DialogTitle>

        <div className="space-y-4 my-6">
          {isAutopilot ? (
            <>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-purple-600">
                  1
                </div>
                <div>
                  <p className="font-medium">Describe your business</p>
                  <p className="text-sm text-gray-500">Tell us what you sell and who you want to reach</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-purple-600">
                  2
                </div>
                <div>
                  <p className="font-medium">Set your budget</p>
                  <p className="text-sm text-gray-500">Choose how much to spend monthly on marketing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-purple-600">
                  3
                </div>
                <div>
                  <p className="font-medium">AI takes over</p>
                  <p className="text-sm text-gray-500">Creates campaigns, writes content, optimizes results daily</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">You review results</p>
                  <p className="text-sm text-gray-500">Check your dashboard to see leads and performance</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-medium">Chat with AI</p>
                  <p className="text-sm text-gray-500">Have a conversation about your business goals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600">
                  2
                </div>
                <div>
                  <p className="font-medium">AI creates a plan</p>
                  <p className="text-sm text-gray-500">Get a personalized marketing strategy you can review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600">
                  3
                </div>
                <div>
                  <p className="font-medium">Approve and launch</p>
                  <p className="text-sm text-gray-500">Review each campaign before it goes live</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Learn and improve</p>
                  <p className="text-sm text-gray-500">AI explains results and suggests improvements</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What you'll need:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              A brief description of your business
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              An idea of who your customers are
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Your monthly marketing budget
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('path-choice')} className="flex-1">
            Back
          </Button>
          <Button onClick={handleGetStarted} className="flex-1">
            {isAutopilot ? 'Start Autopilot Setup' : 'Start Quick Campaign'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome</DialogTitle>
        </DialogHeader>

        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'path-choice' && renderPathChoice()}
        {currentStep === 'explanation' && renderExplanation()}
      </DialogContent>
    </Dialog>
  );
};

// Success celebration component for after campaign creation
interface CampaignSuccessProps {
  campaignName: string;
  onViewDashboard: () => void;
  onCreateAnother?: () => void;
}

export const CampaignSuccessModal: React.FC<CampaignSuccessProps> = ({
  campaignName,
  onViewDashboard,
  onCreateAnother,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <DialogTitle className="text-2xl font-bold mb-2">
            Campaign Created!
          </DialogTitle>

          <DialogDescription className="text-base mb-6">
            Your campaign "{campaignName}" is now live. Here's what happens next:
          </DialogDescription>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left mb-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-blue-600">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">AI starts working</p>
                  <p className="text-xs text-gray-500">Your campaign begins reaching your audience</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-blue-600">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Leads start coming in</p>
                  <p className="text-xs text-gray-500">Usually within 24-48 hours</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-blue-600">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">AI optimizes daily</p>
                  <p className="text-xs text-gray-500">Performance improves automatically over time</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            {onCreateAnother && (
              <Button variant="outline" onClick={onCreateAnother} className="flex-1">
                Create Another
              </Button>
            )}
            <Button onClick={onViewDashboard} className="flex-1">
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to check if user is new
export const useIsNewUser = (): boolean => {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('welcome_flow_completed');
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    const hasCreatedCampaign = localStorage.getItem('first_campaign_created');

    setIsNew(!hasSeenWelcome && !hasSeenOnboarding && !hasCreatedCampaign);
  }, []);

  return isNew;
};

// Function to mark first campaign as created
export const markFirstCampaignCreated = () => {
  localStorage.setItem('first_campaign_created', 'true');
};

export default WelcomeFlow;
