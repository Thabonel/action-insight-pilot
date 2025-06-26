
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Settings, Zap } from 'lucide-react';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface SocialHeaderProps {
  onCreatePost: () => void;
  onSchedulePosts: () => void;
}

const SocialHeader: React.FC<SocialHeaderProps> = ({ onCreatePost, onSchedulePosts }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Social Media Intelligence</h1>
        <p className="text-gray-600 mt-2">AI-powered social media optimization and engagement learning</p>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/app/settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Platforms
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSchedulePosts}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Posts
        </Button>
        <Button 
          size="sm"
          onClick={onCreatePost}
        >
          <Zap className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>
    </div>
  );
};

export default SocialHeader;
