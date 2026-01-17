import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineGuidanceProps {
  title?: string;
  shortTip: string;
  expandedContent?: string;
  example?: string;
  variant?: 'default' | 'tip' | 'info' | 'warning';
  className?: string;
  defaultExpanded?: boolean;
}

export const InlineGuidance: React.FC<InlineGuidanceProps> = ({
  title,
  shortTip,
  expandedContent,
  example,
  variant = 'default',
  className = '',
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasExpandableContent = expandedContent || example;

  const variantStyles = {
    default: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
    tip: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    info: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
  };

  const iconColors = {
    default: 'text-gray-500',
    tip: 'text-blue-500',
    info: 'text-purple-500',
    warning: 'text-yellow-600'
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-sm',
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          'flex items-start gap-2',
          hasExpandableContent && 'cursor-pointer'
        )}
        onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
      >
        {variant === 'tip' ? (
          <Lightbulb className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColors[variant])} />
        ) : (
          <Info className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColors[variant])} />
        )}

        <div className="flex-1">
          {title && (
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400">{shortTip}</p>
        </div>

        {hasExpandableContent && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={isExpanded ? 'Show less' : 'Learn more'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {isExpanded && hasExpandableContent && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {expandedContent && (
            <p className="text-gray-700 dark:text-gray-300">{expandedContent}</p>
          )}
          {example && (
            <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Example:
              </p>
              <p className="text-gray-700 dark:text-gray-300 italic">{example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Field-specific guidance that sits below form fields
interface FieldGuidanceProps {
  guidance: string;
  className?: string;
}

export const FieldGuidance: React.FC<FieldGuidanceProps> = ({
  guidance,
  className = ''
}) => {
  return (
    <p className={cn('text-xs text-gray-500 dark:text-gray-400 mt-1.5', className)}>
      {guidance}
    </p>
  );
};

// Step header guidance for wizards
interface StepGuidanceProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  tip?: string;
  className?: string;
}

export const StepGuidance: React.FC<StepGuidanceProps> = ({
  stepNumber,
  totalSteps,
  title,
  description,
  tip,
  className = ''
}) => {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
      {tip && (
        <div className="mt-3 flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{tip}</span>
        </div>
      )}
    </div>
  );
};

// "What this means" explainer for metrics
interface MetricExplainerProps {
  value: string | number;
  label: string;
  explanation: string;
  benchmark?: string;
  isGood?: boolean | null;
  className?: string;
}

export const MetricExplainer: React.FC<MetricExplainerProps> = ({
  value,
  label,
  explanation,
  benchmark,
  isGood,
  className = ''
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        {isGood !== null && isGood !== undefined && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded',
              isGood
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            )}
          >
            {isGood ? 'Good' : 'Needs work'}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{explanation}</p>
      {benchmark && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Benchmark: {benchmark}
        </p>
      )}
    </div>
  );
};

export default InlineGuidance;
