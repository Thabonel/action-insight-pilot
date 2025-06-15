
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { behaviorTracker } from '@/lib/behavior-tracker';
import PostCreationForm from './PostCreationForm';
import OptimalTimeSlotsDisplay from './OptimalTimeSlotsDisplay';
import BulkSchedulingSection from './BulkSchedulingSection';

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
      <PostCreationForm
        postContent={postContent}
        setPostContent={setPostContent}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={togglePlatform}
        onPostNow={handlePostNow}
        onScheduleForLater={handleScheduleForLater}
        isPosting={isPosting}
        isScheduling={isScheduling}
        platforms={platforms}
      />

      <OptimalTimeSlotsDisplay timeSlots={timeSlots} />

      <BulkSchedulingSection />
    </div>
  );
};

export default IntelligentPostScheduler;
