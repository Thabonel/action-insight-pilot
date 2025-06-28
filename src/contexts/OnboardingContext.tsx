import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  const startOnboarding = (onboardingSteps: OnboardingStep[]) => {
    setSteps(onboardingSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    setIsActive(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsActive(false);
  };

  useEffect(() => {
    // Check if user has completed or skipped onboarding
    const hasCompleted = localStorage.getItem('onboarding_completed');
    const hasSkipped = localStorage.getItem('onboarding_skipped');
    
    if (!hasCompleted && !hasSkipped) {
      // Auto-start onboarding for new users
      setTimeout(() => {
        startDefaultOnboarding();
      }, 1000);
    }
  }, []);

  const startDefaultOnboarding = () => {
    const defaultSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Marketing Hub!',
        content: 'Let\'s take a quick tour to help you get started with creating campaigns, managing leads, and tracking analytics.',
        target: '[data-onboarding="welcome"]',
        placement: 'bottom'
      },
      {
        id: 'navigation',
        title: 'Easy Navigation',
        content: 'Use this sidebar to navigate between campaigns, leads, analytics, and other features. Everything is organized for easy access.',
        target: '[data-onboarding="navigation"]',
        placement: 'right'
      },
      {
        id: 'campaigns',
        title: 'Create Campaigns',
        content: 'Start here to create your marketing campaigns. We\'ll guide you through each step of the process.',
        target: '[data-onboarding="campaigns"]',
        placement: 'right'
      },
      {
        id: 'leads',
        title: 'Manage Leads',
        content: 'Track and manage your leads here. View lead scores, activities, and conversion opportunities.',
        target: '[data-onboarding="leads"]',
        placement: 'right'
      },
      {
        id: 'help',
        title: 'Get Help Anytime',
        content: 'Need assistance? Click here for guides, tutorials, and support. We\'re here to help you succeed!',
        target: '[data-onboarding="help"]',
        placement: 'left'
      }
    ];
    
    startOnboarding(defaultSteps);
  };

  const value = {
    isActive,
    currentStep,
    steps,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};