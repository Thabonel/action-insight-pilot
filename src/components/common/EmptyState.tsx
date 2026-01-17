import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon, Rocket, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  // New props for enhanced guidance
  helpTitle?: string;
  helpContent?: string;
  timeline?: string;
  nextSteps?: string[];
  variant?: 'default' | 'compact' | 'detailed';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  helpTitle,
  helpContent,
  timeline,
  nextSteps,
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 px-4 text-center', className)}>
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
          <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm" className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6">
          <Icon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 text-center">
          {description}
        </p>

        {timeline && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>{timeline}</span>
          </div>
        )}

        {(helpTitle || helpContent) && (
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 max-w-md w-full mb-6">
            {helpTitle && (
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                {helpTitle}
              </p>
            )}
            {helpContent && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {helpContent}
              </p>
            )}
          </div>
        )}

        {nextSteps && nextSteps.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-w-md w-full mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What happens next:
            </p>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-wrap gap-3 justify-center">
            {actionLabel && onAction && (
              <Button onClick={onAction}>
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>

      {(helpTitle || helpContent) && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 max-w-sm w-full mb-6 text-left">
          {helpTitle && (
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              {helpTitle}
            </p>
          )}
          {helpContent && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {helpContent}
            </p>
          )}
        </div>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actionLabel && onAction && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty states for common scenarios
export const NoCampaignsEmptyState: React.FC<{
  onCreateCampaign: () => void;
  onUseAutopilot?: () => void;
}> = ({ onCreateCampaign, onUseAutopilot }) => (
  <EmptyState
    icon={Rocket}
    title="Let's create your first campaign"
    description="A campaign is a coordinated marketing effort. We'll help you create one in under 5 minutes."
    actionLabel="Start Quick Campaign"
    onAction={onCreateCampaign}
    secondaryActionLabel={onUseAutopilot ? "Use AI Autopilot" : undefined}
    onSecondaryAction={onUseAutopilot}
    helpTitle="What is a campaign?"
    helpContent="A campaign is a set of ads, posts, or emails working toward one goal - like getting more leads or sales. You set the budget and target audience, and AI handles the rest."
    variant="detailed"
  />
);

export const NoLeadsEmptyState: React.FC = () => (
  <EmptyState
    icon={Users}
    title="Your leads will appear here"
    description="Once people interact with your campaigns, they become leads. This usually takes 24-48 hours after launching."
    timeline="Usually 24-48 hours after first campaign"
    helpTitle="What is a lead?"
    helpContent="A lead is someone who showed interest in your business. They might have filled out a form, downloaded something, or signed up. Each lead gets a score showing how likely they are to become a customer."
    nextSteps={[
      "Your campaigns attract visitors",
      "Visitors fill out forms or sign up",
      "They appear here as leads with scores",
      "Follow up with high-scoring leads first"
    ]}
    variant="detailed"
  />
);

export const AutopilotProcessingEmptyState: React.FC = () => (
  <EmptyState
    icon={Loader2}
    title="AI is setting up your campaigns"
    description="This takes 2-5 minutes. The AI is analyzing your business and creating optimized campaigns."
    timeline="Usually completes in 2-5 minutes"
    nextSteps={[
      "AI analyzes your business description",
      "Selects the best marketing channels",
      "Creates targeted campaigns",
      "Starts showing ads to your audience"
    ]}
    variant="detailed"
  />
);

export default EmptyState;
