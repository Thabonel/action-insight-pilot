
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Target, Zap, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { SocialPost } from '@/lib/api-client-interface';

interface IntelligentPostSchedulerProps {
  onPostScheduled?: (post: SocialPost) => void;
}

const IntelligentPostScheduler: React.FC<IntelligentPostSchedulerProps> = ({ onPostScheduled }) => {
  const [postData, setPostData] = useState<Partial<SocialPost>>({
    content: '',
    platform: '',
    scheduledTime: '',
    status: 'draft',
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [schedulingPost, setSchedulingPost] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  ];

  useEffect(() => {
    if (postData.platform) {
      fetchOptimalTimes();
    }
  }, [postData.platform]);

  const fetchOptimalTimes = async () => {
    try {
      setLoading(true);
      // Mock optimal times - in real app, this would come from analytics
      const mockOptimalTimes = [
        '2024-01-15T10:00:00Z',
        '2024-01-15T14:30:00Z',
        '2024-01-15T18:00:00Z',
        '2024-01-16T09:00:00Z',
        '2024-01-16T12:00:00Z',
      ];
      setOptimalTimes(mockOptimalTimes);
    } catch (error) {
      console.error('Failed to fetch optimal times:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async () => {
    if (!postData.platform) {
      toast({
        title: "Platform Required",
        description: "Please select a platform first",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingContent(true);
      const response = await apiClient.generateSocialContent(
        postData.platform,
        'engaging content',
        'professional'
      );

      if (response.success && response.data) {
        const suggestions = Array.isArray(response.data) ? response.data : [response.data.content];
        setAiSuggestions(suggestions);
        
        // Set the first suggestion as the content
        if (suggestions.length > 0) {
          setPostData(prev => ({ ...prev, content: suggestions[0] }));
        }

        toast({
          title: "Content Generated",
          description: "AI has generated content suggestions for your post",
        });
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const schedulePost = async () => {
    if (!postData.content || !postData.platform || !postData.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSchedulingPost(true);
      const response = await apiClient.createSocialPost({
        ...postData,
        status: 'scheduled',
      });

      if (response.success && response.data) {
        toast({
          title: "Post Scheduled",
          description: `Your post has been scheduled for ${new Date(postData.scheduledTime).toLocaleString()}`,
        });

        if (onPostScheduled) {
          onPostScheduled(response.data);
        }

        // Reset form
        setPostData({
          content: '',
          platform: '',
          scheduledTime: '',
          status: 'draft',
        });
        setAiSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to schedule post:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule your post",
        variant: "destructive",
      });
    } finally {
      setSchedulingPost(false);
    }
  };

  const handleInputChange = (field: keyof SocialPost, value: string) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const selectOptimalTime = (time: string) => {
    setPostData(prev => ({ ...prev, scheduledTime: time }));
  };

  const applySuggestion = (suggestion: string) => {
    setPostData(prev => ({ ...prev, content: suggestion }));
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const handleScheduledTimeChange = (value: string) => {
    setPostData(prev => ({ ...prev, scheduledTime: value }));
  };

  const handleDateTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Convert local datetime to ISO string
      const date = new Date(value);
      setPostData(prev => ({ ...prev, scheduledTime: date.toISOString() }));
    }
  };

  const getLocalDateTimeValue = () => {
    if (!postData.scheduledTime) return '';
    const date = new Date(postData.scheduledTime);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const publishNow = async () => {
    if (!postData.content || !postData.platform) {
      toast({
        title: "Missing Information",
        description: "Please fill in content and select a platform",
        variant: "destructive",
      });
      return;
    }

    try {
      setSchedulingPost(true);
      const response = await apiClient.createSocialPost({
        ...postData,
        scheduledTime: new Date().toISOString(),
        status: 'published',
      });

      if (response.success && response.data) {
        toast({
          title: "Post Published",
          description: "Your post has been published successfully",
        });

        if (onPostScheduled) {
          onPostScheduled(response.data);
        }

        // Reset form
        setPostData({
          content: '',
          platform: '',
          scheduledTime: '',
          status: 'draft',
        });
        setAiSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast({
        title: "Publishing Failed",
        description: "Failed to publish your post",
        variant: "destructive",
      });
    } finally {
      setSchedulingPost(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Intelligent Post Scheduler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Selection */}
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={postData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    <div className="flex items-center space-x-2">
                      <span>{platform.icon}</span>
                      <span>{platform.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Input */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIContent}
                disabled={generatingContent || !postData.platform}
              >
                {generatingContent ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="content"
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your post content here..."
              className="min-h-[100px]"
            />
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div>
              <Label>AI Content Suggestions</Label>
              <div className="space-y-2 mt-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Use This
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling */}
          <div>
            <Label htmlFor="scheduled-time">Schedule Time</Label>
            <Input
              id="scheduled-time"
              type="datetime-local"
              value={getLocalDateTimeValue()}
              onChange={handleDateTimeInputChange}
              className="mt-1"
            />
          </div>

          {/* Optimal Times */}
          {optimalTimes.length > 0 && (
            <div>
              <Label>Optimal Posting Times</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {optimalTimes.map((time, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectOptimalTime(time)}
                    className="text-sm"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDateTime(time)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={schedulePost}
              disabled={schedulingPost || !postData.content || !postData.platform || !postData.scheduledTime}
              className="flex-1"
            >
              {schedulingPost ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Post
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={publishNow}
              disabled={schedulingPost || !postData.content || !postData.platform}
            >
              {schedulingPost ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Now'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentPostScheduler;
