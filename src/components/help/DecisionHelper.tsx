import React from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DecisionOption {
  value: string | number;
  label: string;
  description: string;
  bestFor: string;
  expectedOutcome?: string;
  warning?: string;
  isRecommended?: boolean;
}

interface DecisionHelperProps {
  question: string;
  description?: string;
  options: DecisionOption[];
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  recommendation?: string;
  className?: string;
  layout?: 'grid' | 'list';
}

export const DecisionHelper: React.FC<DecisionHelperProps> = ({
  question,
  description,
  options,
  selectedValue,
  onSelect,
  recommendation,
  className = '',
  layout = 'grid'
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {question}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {recommendation && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Our recommendation:</span> {recommendation}
          </p>
        </div>
      )}

      <div
        className={cn(
          layout === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
            : 'space-y-3'
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              'relative text-left p-4 rounded-lg border-2 transition-all',
              selectedValue === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              option.isRecommended && selectedValue !== option.value && 'ring-2 ring-blue-100 dark:ring-blue-900'
            )}
          >
            {option.isRecommended && (
              <Badge className="absolute -top-2 -right-2 bg-blue-500">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {option.label}
                  </span>
                  {selectedValue === option.value && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                  Best for:
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {option.bestFor}
                </span>
              </div>

              {option.expectedOutcome && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
                    Expect:
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {option.expectedOutcome}
                  </span>
                </div>
              )}

              {option.warning && (
                <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">{option.warning}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Goal selector with conflict warnings
interface Goal {
  id: string;
  label: string;
  description: string;
  conflictsWith?: string[];
  recommendedFor?: string;
}

interface GoalSelectorProps {
  goals: Goal[];
  selectedGoals: string[];
  onToggleGoal: (goalId: string) => void;
  maxGoals?: number;
  className?: string;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({
  goals,
  selectedGoals,
  onToggleGoal,
  maxGoals = 3,
  className = ''
}) => {
  const getConflictWarning = (goalId: string): string | null => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal?.conflictsWith) return null;

    const conflictingSelected = selectedGoals.filter(
      (sg) => goal.conflictsWith?.includes(sg)
    );

    if (conflictingSelected.length === 0) return null;

    const conflictNames = conflictingSelected
      .map((id) => goals.find((g) => g.id === id)?.label)
      .filter(Boolean)
      .join(' and ');

    return `This may conflict with ${conflictNames} - they work differently`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select {maxGoals === 1 ? 'your primary goal' : `up to ${maxGoals} goals`}
        </p>
        <span className="text-xs text-gray-500">
          {selectedGoals.length} of {maxGoals} selected
        </span>
      </div>

      {selectedGoals.length >= maxGoals && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Focusing on fewer goals usually works better. More goals means spreading your budget and attention thinner.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const conflict = isSelected ? getConflictWarning(goal.id) : null;
          const isDisabled = !isSelected && selectedGoals.length >= maxGoals;

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => !isDisabled && onToggleGoal(goal.id)}
              disabled={isDisabled}
              className={cn(
                'text-left p-4 rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 dark:border-gray-700',
                isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {goal.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {goal.description}
                  </p>
                  {goal.recommendedFor && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Good for: {goal.recommendedFor}
                    </p>
                  )}
                </div>
              </div>

              {conflict && (
                <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-700">
                  <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {conflict}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Pre-configured budget decision helper
export const budgetOptions: DecisionOption[] = [
  {
    value: 500,
    label: '$500/month - Testing Phase',
    description: 'Try out the platform and test different approaches',
    bestFor: 'New to marketing, want to experiment safely',
    expectedOutcome: '5-15 leads, basic data to learn from',
    warning: 'May not generate enough data for AI optimization'
  },
  {
    value: 1000,
    label: '$1,000/month - Starter',
    description: 'Run real campaigns with meaningful results',
    bestFor: 'Small businesses starting their first campaigns',
    expectedOutcome: '20-50 leads, enough data to optimize',
    isRecommended: true
  },
  {
    value: 2500,
    label: '$2,500/month - Growth',
    description: 'Scale what works across multiple channels',
    bestFor: 'Businesses ready to grow consistently',
    expectedOutcome: '60-150 leads, multi-channel testing'
  },
  {
    value: 5000,
    label: '$5,000/month - Aggressive',
    description: 'Full multi-channel campaigns for rapid growth',
    bestFor: 'Proven products ready for rapid expansion',
    expectedOutcome: '150-400 leads, full optimization',
    warning: 'Only recommended if you can handle many leads'
  }
];

// Pre-configured marketing goals
export const marketingGoals: Goal[] = [
  {
    id: 'lead_generation',
    label: 'Generate Leads',
    description: 'Get contact info from potential customers',
    recommendedFor: 'New businesses, B2B companies',
    conflictsWith: ['brand_awareness']
  },
  {
    id: 'brand_awareness',
    label: 'Increase Brand Awareness',
    description: 'Get your name in front of more people',
    recommendedFor: 'New brands, launching new products',
    conflictsWith: ['lead_generation', 'direct_sales']
  },
  {
    id: 'direct_sales',
    label: 'Drive Direct Sales',
    description: 'Get people to buy your product/service now',
    recommendedFor: 'E-commerce, products with short sales cycles',
    conflictsWith: ['brand_awareness']
  },
  {
    id: 'website_traffic',
    label: 'Increase Website Traffic',
    description: 'Get more visitors to your website',
    recommendedFor: 'Content-heavy sites, blogs, news'
  },
  {
    id: 'email_list',
    label: 'Build Email List',
    description: 'Grow your subscriber base for future marketing',
    recommendedFor: 'Long-term relationship building'
  },
  {
    id: 'social_following',
    label: 'Grow Social Following',
    description: 'Build your audience on social platforms',
    recommendedFor: 'Personal brands, influencer-style marketing'
  }
];

export default DecisionHelper;
