import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AiVideoCreatorCard: React.FC = () => {
  const { toast } = useToast();

  const handleGenerateVideo = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/workflows/ai-video-creator/run`, { 
        method: "POST" 
      });
      toast({
        title: "Success",
        description: "AI Video Creator workflow queued",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to queue AI Video Creator workflow",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          AI Video Creator
        </CardTitle>
        <CardDescription>
          Generate a fully-edited faceless POV video from today's content ideas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateVideo} className="w-full">
          Generate AI Video
        </Button>
      </CardContent>
    </Card>
  );
};

export default AiVideoCreatorCard;