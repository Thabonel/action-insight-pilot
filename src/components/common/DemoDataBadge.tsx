
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DemoDataBadgeProps {
  className?: string;
}

export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({ className = '' }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-600 ${className}`}>
            Sample Data
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This section displays sample data for demonstration.</p>
          <p className="text-xs text-muted-foreground mt-1">Connect your platforms to see real data.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DemoDataBadge;
