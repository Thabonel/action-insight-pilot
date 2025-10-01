import React, { useEffect, useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

export const OnboardingOverlay: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipOnboarding, completeOnboarding } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const target = document.querySelector(steps[currentStep].target) as HTMLElement;
    if (target) {
      setTargetElement(target);
      
      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Calculate overlay position
      const rect = target.getBoundingClientRect();
      const placement = steps[currentStep].placement || 'bottom';
      
      let top = 0;
      let left = 0;
      
      switch (placement) {
        case 'top':
          top = rect.top - 20;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 20;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }

      // Ensure overlay stays within viewport bounds
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const overlayWidth = 320; // Card width (w-80 = 320px)
      const overlayHeight = 300; // Approximate height

      // Adjust horizontal position
      if (left + overlayWidth / 2 > viewportWidth) {
        left = viewportWidth - overlayWidth / 2 - 20;
      } else if (left - overlayWidth / 2 < 0) {
        left = overlayWidth / 2 + 20;
      }

      // Adjust vertical position
      if (top + overlayHeight > viewportHeight) {
        top = viewportHeight - overlayHeight - 20;
      } else if (top < 0) {
        top = 20;
      }
      
      setOverlayPosition({ top, left });
      
      // Highlight target element
      target.style.position = 'relative';
      target.style.zIndex = '1001';
      target.style.border = '2px solid #3B82F6';
      target.style.borderRadius = '8px';
      target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    } else {
      // If target element not found, skip onboarding automatically
      console.warn(`Onboarding target not found: ${steps[currentStep].target}`);
      skipOnboarding();
    }

    return () => {
      if (target) {
        target.style.position = '';
        target.style.zIndex = '';
        target.style.border = '';
        target.style.borderRadius = '';
        target.style.backgroundColor = '';
      }
    };
  }, [isActive, currentStep, steps, skipOnboarding]);

  if (!isActive || !steps[currentStep]) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 z-[1000]" />
      
      {/* Onboarding card */}
      <Card 
        className="fixed z-[1002] w-80 shadow-xl border-2 border-primary"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {currentStepData.title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipOnboarding}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {currentStepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button
              size="sm"
              onClick={isLastStep ? completeOnboarding : nextStep}
              className="flex items-center gap-1"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="w-full text-muted-foreground"
            >
              Skip tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};