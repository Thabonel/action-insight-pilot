import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AiVideoCreatorCard: React.FC = () => {
  const { toast } = useToast();

  const handleGenerateVideo = async () => {
    try {
      const response = await fetch('https://6f5cbaff-337b-4343-bac3-e1fb48a7ef5d.lovableproject.com/workflows/ai-video-creator/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "AI Video Creator workflow queued",
        });
      } else {
        throw new Error('Failed to queue workflow');
      }
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
          Generate AI-powered videos automatically using your content
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