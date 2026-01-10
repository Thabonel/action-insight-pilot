import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  source: string;
  trending: number;
  tags: string[];
  createdAt: Date;
}

interface AiVideoCreatorCardProps {
  contentIdeas?: ContentIdea[];
}

const AiVideoCreatorCard: React.FC<AiVideoCreatorCardProps> = ({ contentIdeas = [] }) => {
  const { toast } = useToast();

  const handleGenerateVideo = async () => {
    if (contentIdeas.length === 0) {
      toast({
        title: "No Content Ideas",
        description: "Please add some content ideas in the Content page first",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        contentIdeas: contentIdeas.map(idea => ({
          title: idea.title,
          description: idea.description,
          tags: idea.tags
        }))
      };

      await fetch(`${import.meta.env.VITE_API_URL}/workflows/ai-video-creator/run`, { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      toast({
        title: "Success",
        description: `AI Video Creator workflow queued with ${contentIdeas.length} content ideas`,
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
        <CardTitle>AI Video Creator</CardTitle>
        <CardDescription>
          Generate a fully-edited faceless POV video from today's content ideas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contentIdeas.length > 0 && (
            <div className="text-sm text-gray-600">
              Ready to generate from {contentIdeas.length} content idea{contentIdeas.length !== 1 ? 's' : ''}
            </div>
          )}
          <Button onClick={handleGenerateVideo} className="w-full">
            Generate AI Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiVideoCreatorCard;