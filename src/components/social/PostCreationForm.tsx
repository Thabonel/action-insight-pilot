
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Zap, Calendar, Loader2 } from 'lucide-react';
import { MentionInput } from './MentionInput';

interface Platform {
  id: string;
  name: string;
  engagement: string;
  bestTime: string;
  color: string;
}

interface PostCreationFormProps {
  postContent: string;
  setPostContent: (content: string) => void;
  mentions?: string[];
  hashtags?: string[];
  onMentionsChange?: (mentions: string[]) => void;
  onHashtagsChange?: (hashtags: string[]) => void;
  selectedPlatforms: string[];
  onTogglePlatform: (platformId: string) => void;
  onPostNow: () => void;
  onScheduleForLater: () => void;
  isPosting: boolean;
  isScheduling: boolean;
  platforms: Platform[];
}

const PostCreationForm: React.FC<PostCreationFormProps> = ({
  postContent,
  setPostContent,
  onMentionsChange,
  onHashtagsChange,
  selectedPlatforms,
  onTogglePlatform,
  onPostNow,
  onScheduleForLater,
  isPosting,
  isScheduling,
  platforms
}) => {
  const handleContentChange = (content: string, mentions: string[], hashtags: string[]) => {
    setPostContent(content);
    onMentionsChange?.(mentions);
    onHashtagsChange?.(hashtags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Create Intelligent Post</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Post Content</label>
          <MentionInput
            value={postContent}
            onChange={handleContentChange}
            platform={selectedPlatforms[0] || 'twitter'}
            placeholder="What would you like to share? Use @ to mention and # for hashtags..."
            className="min-h-24"
            disabled={isPosting || isScheduling}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                onClick={() => onTogglePlatform(platform.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{platform.name}</div>
                <div className="text-xs text-gray-600">Avg: {platform.engagement}</div>
                <div className="text-xs text-green-600">Best: {platform.bestTime}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button 
            className="flex-1"
            onClick={onPostNow}
            disabled={isPosting || isScheduling}
          >
            {isPosting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Post Now (Optimal Time)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={onScheduleForLater}
            disabled={isPosting || isScheduling}
          >
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule for Later
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCreationForm;
