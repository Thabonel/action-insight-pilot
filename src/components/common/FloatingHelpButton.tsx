import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingHelpButtonProps {
  helpSection?: string;
}

export function FloatingHelpButton({ helpSection }: FloatingHelpButtonProps) {
  const helpPath = helpSection ? `/help#${helpSection}` : '/help';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to={helpPath}>
              <HelpCircle className="h-6 w-6" />
              <span className="sr-only">Help - Learn how to use this page</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Need help? Click for documentation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
