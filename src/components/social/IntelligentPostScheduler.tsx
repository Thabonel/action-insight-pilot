
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';
import { Loader2, Calendar, Clock } from 'lucide-react';

interface PostData {
  content: string;
  platform: string;
  scheduledTime: string;
  timezone: string;
}

const IntelligentPostScheduler: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState<PostData>({
    content: '',
    platform: 'twitter',
    scheduledTime: '',
    timezone: 'UTC'
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof PostData, value: string) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const schedulePost = async () => {
    if (!postData.content || !postData.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please provide content and scheduled time",
        variant: "destructive",
      });
      return;
    }

    interface SchedulePostResponse {
      id: string;
      scheduled_time: string;
    }

    setLoading(true);
    try {
      console.log('Scheduling post with data:', postData);
      const result = await apiClient.scheduleSocialPost(postData) as ApiResponse<SchedulePostResponse>;

      if (result.success && result.data) {
        toast({
          title: "Post Scheduled",
          description: `Post scheduled for ${postData.platform} at ${postData.scheduledTime}`,
        });

        // Reset form
        setPostData({
          content: '',
          platform: 'twitter',
          scheduledTime: '',
          timezone: 'UTC'
        });
      } else {
        toast({
          title: "Scheduling Failed",
          description: result.error || "Failed to schedule post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Post scheduling error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Intelligent Post Scheduler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <Select value={postData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue />
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
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <Select value={postData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <Textarea
              rows={4}
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your post content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scheduled Time</label>
            <Input
              type="datetime-local"
              value={postData.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
            />
          </div>

          <Button onClick={schedulePost} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Schedule Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentPostScheduler;
