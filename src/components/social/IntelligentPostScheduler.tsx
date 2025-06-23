
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SocialPost } from '@/lib/api-client-interface';
import { Calendar, Clock, Sparkles, Send } from 'lucide-react';

const IntelligentPostScheduler: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [newPost, setNewPost] = useState<Partial<SocialPost>>({
    content: '',
    platform: 'twitter',
    scheduledTime: '',
    status: 'draft',
    campaignId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getSocialPosts();
      if (result.success && result.data) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!newPost.platform) {
      toast({
        title: "Missing Platform",
        description: "Please select a platform first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingContent(true);
    try {
      const brief = {
        platform: newPost.platform,
        audience: 'general',
        tone: 'professional',
        keywords: []
      };
      
      const result = await apiClient.generateSocialContent(brief);
      
      if (result.success && result.data) {
        setNewPost(prev => ({
          ...prev,
          content: result.data.content || 'Generated content'
        }));
        
        toast({
          title: "Content Generated",
          description: "AI has generated content for your post!",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate content",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const schedulePost = async () => {
    if (!newPost.content || !newPost.platform || !newPost.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const postToSchedule: SocialPost = {
        id: Date.now().toString(),
        content: newPost.content || '',
        platform: newPost.platform || '',
        scheduledTime: newPost.scheduledTime || '',
        status: 'scheduled',
        campaignId: newPost.campaignId,
        created_at: new Date().toISOString()
      };

      const result = await apiClient.scheduleSocialPost(postToSchedule);
      
      if (result.success) {
        setPosts(prev => [...prev, postToSchedule]);
        setNewPost({
          content: '',
          platform: 'twitter',
          scheduledTime: '',
          status: 'draft',
          campaignId: ''
        });
        
        toast({
          title: "Post Scheduled",
          description: "Your post has been scheduled successfully!",
        });
      } else {
        toast({
          title: "Scheduling Failed",
          description: result.error || "Failed to schedule post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule New Post</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <Select 
                value={newPost.platform} 
                onValueChange={(value) => setNewPost(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Schedule Time</label>
              <Input
                type="datetime-local"
                value={newPost.scheduledTime}
                onChange={(e) => setNewPost(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Content</label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateContent}
                disabled={generatingContent}
              >
                {generatingContent ? (
                  <>
                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your post content or use AI to generate..."
              rows={4}
            />
          </div>

          <Button onClick={schedulePost} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Schedule Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No posts scheduled yet</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{post.platform}</Badge>
                      <Badge variant={getStatusBadgeVariant(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.scheduledTime).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentPostScheduler;
