import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface VideoData {
  title: string;
  description: string;
  platforms: string[];
  keyword: string;
  autoResponse: string;
  scheduleDate?: string;
}

const VideoUploader: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData>({
    title: '',
    description: '',
    platforms: [],
    keyword: '',
    autoResponse: 'Thanks for commenting! Please reply with your email address and I\'ll send you the full guide.',
    scheduleDate: ''
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram Reels' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'youtube', name: 'YouTube Shorts' },
    { id: 'twitter', name: 'Twitter/X' }
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    setVideoData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platformId]
        : prev.platforms.filter(p => p !== platformId)
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !videoData.title || !videoData.keyword || videoData.platforms.length === 0) {
      toast.error('Please fill in all required fields and select a video file');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Video uploaded and scheduled successfully!');
      
      // Reset form
      setVideoData({
        title: '',
        description: '',
        platforms: [],
        keyword: '',
        autoResponse: 'Thanks for commenting! Please reply with your email address and I\'ll send you the full guide.',
        scheduleDate: ''
      });
      setVideoFile(null);
    } catch (error) {
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Viral Video</CardTitle>
        <CardDescription>
          Upload and schedule your short-form video with automated comment monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video File Upload */}
        <div className="space-y-2">
          <Label htmlFor="video-upload">Video File *</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            {videoFile ? (
              <div>
                <p className="font-semibold">{videoFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setVideoFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your video file here, or click to browse
                </p>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </div>

        {/* Video Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title *</Label>
            <Input
              id="title"
              placeholder="Enter video title..."
              value={videoData.title}
              onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyword">Trigger Keyword *</Label>
            <Input
              id="keyword"
              placeholder="e.g., YT, AI, GUIDE"
              value={videoData.keyword}
              onChange={(e) => setVideoData(prev => ({ ...prev, keyword: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Video Description</Label>
          <Textarea
            id="description"
            placeholder="Include your call-to-action here (e.g., 'Comment YT for the full guide!')"
            value={videoData.description}
            onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <Label>Select Platforms *</Label>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={videoData.platforms.includes(platform.id)}
                  onCheckedChange={(checked) => 
                    handlePlatformChange(platform.id, checked as boolean)
                  }
                />
                <Label htmlFor={platform.id}>{platform.name}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Response */}
        <div className="space-y-2">
          <Label htmlFor="auto-response">Auto-Response Message</Label>
          <Textarea
            id="auto-response"
            placeholder="Message sent when keyword is detected..."
            value={videoData.autoResponse}
            onChange={(e) => setVideoData(prev => ({ ...prev, autoResponse: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <Label htmlFor="schedule">Schedule (Optional)</Label>
          <Input
            id="schedule"
            type="datetime-local"
            value={videoData.scheduleDate}
            onChange={(e) => setVideoData(prev => ({ ...prev, scheduleDate: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to post immediately after upload
          </p>
        </div>

        {/* Upload Button */}
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload & Schedule Video'}
        </Button>

        {/* Preview */}
        {videoData.title && videoData.keyword && (
          <Card className="border border-primary">
            <CardHeader>
              <CardTitle className="text-sm">Preview Setup</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {videoData.title}</p>
                <p><strong>Keyword:</strong> {videoData.keyword}</p>
                <p><strong>Platforms:</strong> {videoData.platforms.join(', ')}</p>
                <p><strong>Auto-Response:</strong> {videoData.autoResponse}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUploader;