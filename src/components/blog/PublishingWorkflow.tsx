
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Globe, 
  Share2,
  Eye,
  Calendar,
  Image,
  Link,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublishingWorkflowProps {
  content: string;
  title: string;
}

export const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
  content,
  title
}) => {
  const [checklist, setChecklist] = useState({
    contentQuality: false,
    seoOptimization: false,
    accessibility: false,
    legalCompliance: false,
    featuredImage: false,
    internalLinks: false,
    callToAction: false,
    socialPromotion: false
  });
  
  const [publishingQueue, setPublishingQueue] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const qualityChecks = [
    {
      id: 'contentQuality',
      title: 'Content Quality Score',
      description: 'Grammar, readability, and engagement analysis',
      score: 85,
      issues: ['Add more specific examples', 'Improve conclusion'],
      icon: CheckCircle,
      status: 'warning'
    },
    {
      id: 'seoOptimization',
      title: 'SEO Optimization',
      description: 'Title tags, meta description, headers, keywords',
      score: 92,
      issues: ['Add meta description'],
      icon: TrendingUp,
      status: 'success'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Compliance',
      description: 'Alt text, reading level, contrast ratios',
      score: 78,
      issues: ['Add alt text to images', 'Improve heading structure'],
      icon: Eye,
      status: 'warning'
    },
    {
      id: 'legalCompliance',
      title: 'Legal Compliance',
      description: 'Disclaimers, citations, copyright checks',
      score: 95,
      issues: [],
      icon: CheckCircle,
      status: 'success'
    }
  ];

  const publishingOptions = [
    {
      platform: 'WordPress',
      status: 'connected',
      scheduledTime: '2024-01-15 09:00 AM',
      optimizations: ['Auto internal links', 'Featured image generation']
    },
    {
      platform: 'Medium',
      status: 'connected',
      scheduledTime: '2024-01-15 10:00 AM',
      optimizations: ['Format conversion', 'Tag optimization']
    },
    {
      platform: 'LinkedIn',
      status: 'pending',
      scheduledTime: '2024-01-15 11:00 AM',
      optimizations: ['Professional formatting', 'Hashtag suggestions']
    }
  ];

  const handleChecklistToggle = (item: string) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item as keyof typeof prev]
    }));
  };

  const runQualityCheck = (checkId: string) => {
    toast({
      title: "Quality check started",
      description: "Running automated quality analysis..."
    });
    
    setTimeout(() => {
      handleChecklistToggle(checkId);
      toast({
        title: "Quality check complete",
        description: "Issues have been identified and suggestions provided"
      });
    }, 2000);
  };

  const addToPublishingQueue = (platform: string) => {
    const newQueueItem = {
      id: Date.now().toString(),
      platform,
      content: { title, content },
      scheduledTime: new Date(Date.now() + 60000).toISOString(),
      status: 'queued',
      optimizations: ['Auto-formatting', 'Link insertion']
    };
    
    setPublishingQueue(prev => [...prev, newQueueItem]);
    
    toast({
      title: "Added to queue",
      description: `${platform} publishing scheduled`
    });
  };

  const publishNow = async () => {
    setIsPublishing(true);
    
    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Published successfully!",
        description: "Your content is now live across selected platforms"
      });
    } catch (error) {
      toast({
        title: "Publishing failed",
        description: "There was an error publishing your content",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const overallScore = qualityChecks.reduce((acc, check) => acc + check.score, 0) / qualityChecks.length;
  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Publishing Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {Math.round(overallScore)}%
            </div>
            <p className="text-gray-600">Content Quality Score</p>
            <Progress value={overallScore} className="mt-4" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-green-600">
                {completedChecks}/{totalChecks}
              </div>
              <p className="text-sm text-gray-600">Checks Completed</p>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">
                {publishingQueue.length}
              </div>
              <p className="text-sm text-gray-600">Platforms Queued</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Publication Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityChecks.map((check) => {
              const IconComponent = check.icon;
              return (
                <div key={check.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${
                        check.status === 'success' ? 'text-green-500' : 'text-orange-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">{check.title}</h4>
                        <p className="text-sm text-gray-600">{check.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        check.score >= 90 ? 'text-green-600' :
                        check.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {check.score}%
                      </div>
                      <Badge variant={check.status === 'success' ? 'default' : 'secondary'}>
                        {check.status === 'success' ? 'Passed' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                  
                  {check.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Issues to address:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {check.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => runQualityCheck(check.id)}>
                      Run Check
                    </Button>
                    {check.issues.length > 0 && (
                      <Button size="sm" variant="outline">
                        Auto-Fix
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publishing Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publishingOptions.map((option, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">{option.platform}</h4>
                      <p className="text-sm text-gray-600">
                        Scheduled: {option.scheduledTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={option.status === 'connected' ? 'default' : 'secondary'}>
                      {option.status}
                    </Badge>
                    <Button size="sm" onClick={() => addToPublishingQueue(option.platform)}>
                      Queue
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {option.optimizations.map((opt, optIndex) => (
                    <Badge key={optIndex} variant="outline" className="text-xs">
                      {opt}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Publish Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Ready to publish?</h4>
                <p className="text-sm text-gray-600">
                  Content will be published to {publishingQueue.length} platforms
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button onClick={publishNow} disabled={isPublishing}>
                  {isPublishing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Publish Now
                    </>
                  )}
                </Button>
              </div>
            </div>

            {publishingQueue.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Queued for Publishing</h4>
                <div className="space-y-2">
                  {publishingQueue.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{item.platform}</span>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post-Publication Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Post-Publication Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">24hr</div>
              <p className="text-sm text-gray-600">Initial Monitoring</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Share2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">Auto</div>
              <p className="text-sm text-gray-600">Social Promotion</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">Smart</div>
              <p className="text-sm text-gray-600">Performance Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
