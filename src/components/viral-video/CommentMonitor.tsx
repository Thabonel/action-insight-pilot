import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user: string;
  comment: string;
  video: string;
  platform: string;
  keyword: string;
  timestamp: string;
  status: 'detected' | 'responded' | 'email_requested' | 'email_collected' | 'failed';
  email?: string;
}

const CommentMonitor: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '@sarah_marketer',
      comment: 'YT please!',
      video: 'AI Marketing Secrets Revealed',
      platform: 'Instagram',
      keyword: 'YT',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'responded'
    },
    {
      id: '2',
      user: '@digitaldan',
      comment: 'This is amazing! AI',
      video: 'ChatGPT Prompts',
      platform: 'TikTok',
      keyword: 'AI',
      timestamp: '2024-01-15T10:25:00Z',
      status: 'email_requested'
    },
    {
      id: '3',
      user: '@growthhacker',
      comment: 'GUIDE needed asap',
      video: 'YouTube Growth Hack',
      platform: 'YouTube',
      keyword: 'GUIDE',
      timestamp: '2024-01-15T10:22:00Z',
      status: 'email_collected',
      email: 'growthhacker@email.com'
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  const handleRespond = async (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, status: 'responded' }
        : comment
    ));
    toast.success('Auto-response sent to commenter');
  };

  const handleCollectEmail = async (commentId: string, email: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, status: 'email_collected', email }
        : comment
    ));
    toast.success('Email collected and added to segment');
  };

  const getStatusIndicator = (status: Comment['status']) => {
    switch (status) {
      case 'detected':
        return <span className="text-yellow-500 font-bold">*</span>;
      case 'responded':
        return <span className="text-blue-500 font-bold">R</span>;
      case 'email_requested':
        return <span className="text-orange-500 font-bold">E</span>;
      case 'email_collected':
        return <span className="text-green-500 font-bold">+</span>;
      case 'failed':
        return <span className="text-red-500 font-bold">!</span>;
      default:
        return <span>-</span>;
    }
  };

  const getStatusColor = (status: Comment['status']) => {
    switch (status) {
      case 'detected':
        return 'secondary';
      case 'responded':
        return 'outline';
      case 'email_requested':
        return 'secondary';
      case 'email_collected':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Live Comment Monitor</CardTitle>
            <CardDescription>
              Real-time keyword detection and automated responses
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.platform}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {comment.keyword}
                      </Badge>
                    </div>
                    <p className="text-sm mb-1">"{comment.comment}"</p>
                    <p className="text-xs text-muted-foreground">
                      On: {comment.video}
                    </p>
                    {comment.email && (
                      <p className="text-xs text-green-600 mt-1">
                        Email: {comment.email}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {getStatusIndicator(comment.status)}
                      <Badge variant={getStatusColor(comment.status)} className="text-xs">
                        {comment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {comment.status === 'detected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRespond(comment.id)}
                    >
                      Send Auto-Response
                    </Button>
                  )}
                  {comment.status === 'email_requested' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCollectEmail(comment.id, 'user@example.com')}
                    >
                      Simulate Email Collection
                    </Button>
                  )}
                  {comment.status === 'email_collected' && (
                    <Button size="sm" variant="outline" disabled>
                      Email Added to Sequence
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentMonitor;