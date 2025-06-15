
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface ContentSchedulingDialogProps {
  children: React.ReactNode;
  content?: string;
  title?: string;
}

const ContentSchedulingDialog: React.FC<ContentSchedulingDialogProps> = ({ 
  children, 
  content = '', 
  title = '' 
}) => {
  const [open, setOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [platform, setPlatform] = useState('blog');
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for scheduling.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);
    try {
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;
      
      // Use existing content service to schedule
      const response = await apiClient.createContent({
        title: title || 'Scheduled Content',
        content,
        platform,
        scheduled_for: scheduledDateTime,
        status: 'scheduled'
      });

      if (response.success) {
        toast({
          title: "Content Scheduled",
          description: `Content scheduled for ${new Date(scheduledDateTime).toLocaleString()}`,
        });
        setOpen(false);
        // Reset form
        setScheduledDate('');
        setScheduledTime('');
        setPlatform('blog');
      } else {
        throw new Error(response.error || 'Failed to schedule content');
      }
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Schedule Content</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="blog">Blog</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="website">Website</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleSchedule}
              disabled={isScheduling}
              className="flex-1"
            >
              {isScheduling ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Schedule Content
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSchedulingDialog;
