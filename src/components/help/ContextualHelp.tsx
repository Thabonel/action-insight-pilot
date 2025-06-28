import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContextualHelpProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  content,
  position = 'top',
  children,
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto w-auto p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              <HelpCircle className={iconSize[size]} />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={position}
          className="max-w-xs p-4 bg-popover border shadow-md"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm">{title}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Pre-configured contextual help components for common use cases
export const CampaignHelp: React.FC = () => (
  <ContextualHelp
    title="Creating Campaigns"
    content="Campaigns help you organize your marketing efforts. Set clear goals, define your target audience, and track performance metrics to optimize results."
  />
);

export const LeadScoringHelp: React.FC = () => (
  <ContextualHelp
    title="Lead Scoring"
    content="Lead scores (0-100) indicate how likely a lead is to convert. Higher scores mean more engaged prospects. Scores are based on activities, demographics, and behavior patterns."
  />
);

export const AnalyticsHelp: React.FC = () => (
  <ContextualHelp
    title="Analytics Dashboard"
    content="This dashboard shows key metrics for your campaigns. Focus on conversion rates, cost per acquisition, and return on investment to measure success."
  />
);

export const BudgetHelp: React.FC = () => (
  <ContextualHelp
    title="Budget Management"
    content="Set realistic budgets based on your goals. Monitor spend vs. allocated budget regularly. The system will alert you when approaching budget limits."
  />
);