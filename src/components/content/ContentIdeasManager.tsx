import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useContentIdeas } from '@/contexts/ContentIdeasContext';
import { Lightbulb, Plus, Trash2, TrendingUp, Video } from 'lucide-react';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  source: string;
  trending: number;
  tags: string[];
  createdAt: string;
}

interface ContentIdeasManagerProps {
  onVideoGenerate?: (ideas: ContentIdea[]) => void;
}

const ContentIdeasManager: React.FC<ContentIdeasManagerProps> = ({ onVideoGenerate }) => {
  const { contentIdeas, addContentIdea, removeContentIdea, getRecentIdeas } = useContentIdeas();
  
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    source: '',
    tags: ''
  });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddIdea = () => {
    if (!newIdea.title.trim() || !newIdea.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and description",
        variant: "destructive",
      });
      return;
    }

    addContentIdea({
      title: newIdea.title,
      description: newIdea.description,
      source: newIdea.source || 'Manual Entry',
      trending: Math.floor(Math.random() * 100),
      tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });

    setNewIdea({ title: '', description: '', source: '', tags: '' });
    setOpen(false);
    
    toast({
      title: "Content Idea Added",
      description: "Your content idea has been saved successfully",
    });
  };

  const handleDeleteIdea = (id: string) => {
    removeContentIdea(id);
    toast({
      title: "Idea Deleted",
      description: "Content idea has been removed",
    });
  };

  const handleGenerateVideo = () => {
    if (contentIdeas.length === 0) {
      toast({
        title: "No Content Ideas",
        description: "Please add some content ideas first",
        variant: "destructive",
      });
      return;
    }

    const recentIdeas = getRecentIdeas(7);

    if (recentIdeas.length === 0) {
      toast({
        title: "No Recent Ideas",
        description: "No content ideas from the last 7 days found",
        variant: "destructive",
      });
      return;
    }

    onVideoGenerate?.(recentIdeas);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Content Ideas ({contentIdeas.length})</span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateVideo}
              disabled={contentIdeas.length === 0}
            >
              <Video className="h-4 w-4 mr-2" />
              Generate Video
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Idea
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Content Idea</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={newIdea.title}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Content idea title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={newIdea.description}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your content idea..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Source</label>
                    <Input
                      value={newIdea.source}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="Where did this idea come from?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                    <Input
                      value={newIdea.tags}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="AI, Marketing, Strategy"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddIdea} className="flex-1">
                      Add Idea
                    </Button>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contentIdeas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No content ideas yet</p>
            <p className="text-sm">Add your first idea to get started</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contentIdeas.map((idea) => (
              <div key={idea.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium">{idea.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {idea.trending}%
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{idea.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {idea.source} • {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentIdeasManager;