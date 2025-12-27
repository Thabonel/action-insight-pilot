import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HelpButtonProps {
  title: string;
  content: string | React.ReactNode;
  className?: string;
}

export function HelpButton({ title, content, className = '' }: HelpButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`fixed top-4 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all ${className}`}
          title="Help - Learn how to use this page"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Help documentation for {title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {typeof content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
