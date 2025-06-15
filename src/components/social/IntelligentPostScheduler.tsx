
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, TrendingUp, Target, Zap, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { behaviorTracker } from '@/lib/behavior-tracker';

const IntelligentPostScheduler: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();
  
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', engagement: '12.3%', bestTime: '10:30 AM', color: 'blue' },
    { id: 'twitter', name: 'Twitter', engagement: '8.7%', bestTime: '2:15 PM', color: 'sky' },
    { id: 'facebook', name: 'Facebook', engagement: '6.2%', bestTime: '7:45 PM', color: 'indigo' },
    { id: 'instagram', name: 'Instagram', engagement: '9.1%', bestTime: '8:30 PM', color: 'pink' }
  ];

  const timeSlots = [
    { time: '9:00 AM', prediction: 'High', score: 94, posts: 12 },
    { time: '10:30 AM', prediction: 'Excellent', score: 98, posts: 8 },
    { time: '12:00 PM', prediction: 'Medium', score: 72, posts: 15 },
    { time: '2:15 PM', prediction: 'High', score: 89, posts: 10 },
    { time: '5:30 PM', prediction: 'Low', score: 45, posts: 20 },
    { time: '7:45 PM', prediction: 'High', score: 91, posts: 6 }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePostNow = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content for your post",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    
    try {
      behaviorTracker.trackAction('feature_use', 'post_now', {
        platforms: selectedPlatforms,
        contentLength: postContent.length
      });

      // Post to each selected platform
      for (const platform of selectedPlatforms) {
        await apiClient.createSocialPost({
          content: postContent,
          platform,
          scheduled_for: null, // Post immediately
          status: 'published'
        });
      }

      toast({
        title: "Post Published",
        description: `Successfully posted to ${selectedPlatforms.length} platform(s)`,
      });

      // Clear form
      setPostContent('');
      setSelectedPlatforms(['linkedin']);

    } catch (error) {
      console.error('Error posting:', error);
      toast({
        title: "Post Failed",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleScheduleForLater = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content for your post",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);
    
    try {
      behaviorTracker.trackAction('feature_use', 'schedule_post', {
        platforms: selectedPlatforms,
        contentLength: postContent.length
      });

      // Find the best time slot for scheduling
      const bestTimeSlot = timeSlots.find(slot => slot.prediction === 'Excellent') || timeSlots[0];
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(bestTimeSlot.time.split(':')[0]));
      scheduledTime.setMinutes(parseInt(bestTimeSlot.time.split(' ')[0].split(':')[1]));
      
      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      // Schedule on each selected platform
      for (const platform of selectedPlatforms) {
        await apiClient.scheduleSocialPost({
          content: postContent,
          platform,
          scheduled_for: scheduledTime.toISOString(),
          status: 'scheduled'
        });
      }

      toast({
        title: "Post Scheduled",
        description: `Scheduled for ${scheduledTime.toLocaleString()} on ${selectedPlatforms.length} platform(s)`,
      });

      // Clear form
      setPostContent('');
      setSelectedPlatforms(['linkedin']);

    } catch (error) {
      console.error('Error scheduling:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Post Creation */}
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
            <Textarea
              placeholder="What would you like to share? AI will optimize for each platform..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Platforms</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
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
              onClick={handlePostNow}
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
              onClick={handleScheduleForLater}
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

      {/* Optimal Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Optimal Posting Times Today</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{slot.time}</span>
                  <Badge className={getPredictionColor(slot.prediction)}>
                    {slot.prediction}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Predicted score:</span>
                    <span className="font-medium">{slot.score}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your posts at this time:</span>
                    <span className="text-gray-800">{slot.posts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Bulk Schedule Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-5 w-5 mb-2" />
              <span className="text-sm">Schedule Week</span>
              <span className="text-xs text-gray-600">AI-optimized times</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-5 w-5 mb-2" />
              <span className="text-sm">Batch Upload</span>
              <span className="text-xs text-gray-600">Multiple posts</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Zap className="h-5 w-5 mb-2" />
              <span className="text-sm">Auto-Optimize</span>
              <span className="text-xs text-gray-600">Platform variations</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentPostScheduler;
