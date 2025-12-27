import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { helpContent } from '@/config/helpContent';

interface PageHelpModalProps {
  helpKey: string;
  className?: string;
}

export function PageHelpModal({ helpKey, className = '' }: PageHelpModalProps) {
  const content = helpContent[helpKey] || {
    title: 'Help',
    content: (
      <div>
        <p>Help content for this page is not available yet.</p>
        <p>For assistance, please visit the <a href="/help" className="text-primary underline">Help Center</a>.</p>
      </div>
    )
  };

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
                title="Help - Learn how to use this page"
              >
                <HelpCircle className="h-6 w-6" />
                <span className="sr-only">Help - Learn how to use this page</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Need help? Click for documentation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{content.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Help documentation for {content.title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {typeof content.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            ) : (
              content.content
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
