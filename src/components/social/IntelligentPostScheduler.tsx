
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SocialPost } from '@/lib/api-client-interface';
import { 
  Calendar, 
  Clock, 
  Send, 
  Image,
  Hash,
  Users,
  TrendingUp,
  Plus,
  X
} from 'lucide-react';

const IntelligentPostScheduler: React.FC = () => {
  const [post, setPost] = useState<Partial<SocialPost>>({
    content: '',
    platform: 'twitter',
    scheduled_time: '',
    status: 'draft'
  });
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  ];

  const suggestedTags = [
    'marketing', 'socialmedia', 'business', 'entrepreneur', 
    'digitalmarketing', 'branding', 'startup', 'innovation'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post.content?.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.createSocialPost({
        ...post,
        tags: customTags
      });

      if (result.success) {
        toast({
          title: "Post scheduled",
          description: "Your social media post has been scheduled successfully",
        });
        
        // Reset form
        setPost({
          content: '',
          platform: 'twitter',
          scheduled_time: '',
          status: 'draft'
        });
        setCustomTags([]);
      } else {
        throw new Error(result.error || 'Failed to schedule post');
      }
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: error instanceof Error ? error.message : "Failed to schedule post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !customTags.includes(tag)) {
      setCustomTags([...customTags, tag]);
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const getCharacterCount = () => {
    return post.content?.length || 0;
  };

  const getCharacterLimit = () => {
    switch (post.platform) {
      case 'twitter': return 280;
      case 'facebook': return 63206;
      case 'instagram': return 2200;
      case 'linkedin': return 3000;
      default: return 280;
    }
  };

  const isOverLimit = () => {
    return getCharacterCount() > getCharacterLimit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Intelligent Post Scheduler</h2>
        <p className="text-gray-600">Create and schedule social media posts across platforms</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Create New Post</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Selection */}
            <div>
              <Label>Select Platform</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setPost({ ...post, platform: platform.id })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      post.platform === platform.id
                        ? `${platform.color} text-white`
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div>
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                value={post.content || ''}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                placeholder="What's on your mind?"
                className="mt-2 min-h-32"
                rows={4}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm text-gray-500">
                  {getCharacterCount()} / {getCharacterLimit()} characters
                </div>
                {isOverLimit() && (
                  <Badge variant="destructive">Character limit exceeded</Badge>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <Label>Tags</Label>
              <div className="space-y-3 mt-2">
                {/* Current Tags */}
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <Hash className="h-3 w-3" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Custom Tag */}
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add custom tag"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Suggested Tags */}
                <div>
                  <Label className="text-sm">Suggested Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {suggestedTags
                      .filter(tag => !customTags.includes(tag))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Time */}
            <div>
              <Label htmlFor="scheduled_time">Schedule Time (Optional)</Label>
              <Input
                id="scheduled_time"
                type="datetime-local"
                value={post.scheduled_time || ''}
                onChange={(e) => setPost({ ...post, scheduled_time: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={loading || !post.content?.trim() || isOverLimit()}
                className="flex-1"
              >
                {loading ? (
                  'Scheduling...'
                ) : post.scheduled_time ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Now
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setPost({ ...post, status: 'draft' })}
              >
                Save Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">12.5K</div>
                <div className="text-sm text-gray-600">Total Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">3.2%</div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-600">Scheduled Posts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntelligentPostScheduler;
