
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  TrendingUp,
  Image,
  Link,
  MessageSquare,
  Search,
  Accessibility,
  Shield,
  Calendar,
  BarChart3
} from 'lucide-react';

interface PublishingWorkflowProps {
  content: string;
  title: string;
  contentId?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  score?: number;
  issues?: string[];
  suggestions?: string[];
}

const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
  content,
  title,
  contentId
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'content-quality',
      label: 'Content Quality',
      description: 'Overall content score and readability',
      icon: Eye,
      status: 'pending'
    },
    {
      id: 'seo-optimization',
      label: 'SEO Optimization',
      description: 'Title tags, meta description, headers',
      icon: Search,
      status: 'pending'
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      description: 'Alt text, reading level, contrast',
      icon: Accessibility,
      status: 'pending'
    },
    {
      id: 'legal-compliance',
      label: 'Legal Compliance',
      description: 'Disclaimers, citations, copyright',
      icon: Shield,
      status: 'pending'
    },
    {
      id: 'featured-image',
      label: 'Featured Image',
      description: 'AI-generated image suggestions',
      icon: Image,
      status: 'pending'
    },
    {
      id: 'internal-links',
      label: 'Internal Links',
      description: 'Automatic link insertion from content library',
      icon: Link,
      status: 'pending'
    }
  ]);

  const [overallScore, setOverallScore] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingQueue, setPublishingQueue] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (content && title) {
      runContentAnalysis();
    }
  }, [content, title]);

  const runContentAnalysis = async () => {
    try {
      // Run all checks in parallel
      await Promise.all([
        checkContentQuality(),
        checkSEOOptimization(),
        checkAccessibility(),
        checkLegalCompliance(),
        generateFeaturedImageSuggestions(),
        findInternalLinks()
      ]);
    } catch (error) {
      console.error('Content analysis error:', error);
    }
  };

  const checkContentQuality = async () => {
    updateChecklistItem('content-quality', 'checking');
    
    try {
      // Simulate content quality analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const wordCount = content.split(' ').length;
      const readabilityScore = Math.min(100, Math.max(60, 100 - (wordCount / 20)));
      const grammarScore = Math.random() * 20 + 80; // Mock grammar score
      
      const issues = [];
      if (wordCount < 300) issues.push('Content is too short for optimal SEO');
      if (readabilityScore < 70) issues.push('Content readability could be improved');
      
      updateChecklistItem('content-quality', readabilityScore > 75 ? 'passed' : 'failed', {
        score: Math.round((readabilityScore + grammarScore) / 2),
        issues,
        suggestions: [
          'Add more descriptive subheadings',
          'Break up long paragraphs',
          'Use more transition words'
        ]
      });
    } catch (error) {
      updateChecklistItem('content-quality', 'failed');
    }
  };

  const checkSEOOptimization = async () => {
    updateChecklistItem('seo-optimization', 'checking');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const seoIssues = [];
      const seoSuggestions = [];
      
      if (title.length < 30) {
        seoIssues.push('Title is too short');
        seoSuggestions.push('Expand title to 50-60 characters');
      }
      
      if (title.length > 60) {
        seoIssues.push('Title is too long');
        seoSuggestions.push('Shorten title to under 60 characters');
      }
      
      if (!content.includes('<h2>') && !content.includes('##')) {
        seoIssues.push('No H2 headings found');
        seoSuggestions.push('Add H2 headings to structure content');
      }
      
      const score = Math.max(40, 100 - (seoIssues.length * 15));
      
      updateChecklistItem('seo-optimization', score > 70 ? 'passed' : 'failed', {
        score,
        issues: seoIssues,
        suggestions: seoSuggestions
      });
    } catch (error) {
      updateChecklistItem('seo-optimization', 'failed');
    }
  };

  const checkAccessibility = async () => {
    updateChecklistItem('accessibility', 'checking');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const accessibilityIssues = [];
      const suggestions = [];
      
      // Check for images without alt text
      const imageCount = (content.match(/<img/g) || []).length;
      if (imageCount > 0) {
        accessibilityIssues.push('Images may be missing alt text');
        suggestions.push('Add descriptive alt text to all images');
      }
      
      // Check reading level
      const wordCount = content.split(' ').length;
      const sentenceCount = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = wordCount / sentenceCount;
      
      if (avgWordsPerSentence > 20) {
        accessibilityIssues.push('Sentences are too long');
        suggestions.push('Break up long sentences for better readability');
      }
      
      const score = Math.max(50, 100 - (accessibilityIssues.length * 20));
      
      updateChecklistItem('accessibility', score > 75 ? 'passed' : 'failed', {
        score,
        issues: accessibilityIssues,
        suggestions
      });
    } catch (error) {
      updateChecklistItem('accessibility', 'failed');
    }
  };

  const checkLegalCompliance = async () => {
    updateChecklistItem('legal-compliance', 'checking');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const legalIssues = [];
      const suggestions = [];
      
      // Check for citations
      if (content.includes('according to') || content.includes('study shows')) {
        if (!content.includes('source:') && !content.includes('http')) {
          legalIssues.push('Claims made without proper citations');
          suggestions.push('Add citations to support claims');
        }
      }
      
      // Check for disclaimers
      if (content.toLowerCase().includes('advice') || content.toLowerCase().includes('recommendation')) {
        if (!content.toLowerCase().includes('disclaimer')) {
          legalIssues.push('Professional advice given without disclaimer');
          suggestions.push('Add appropriate disclaimer');
        }
      }
      
      const score = Math.max(60, 100 - (legalIssues.length * 25));
      
      updateChecklistItem('legal-compliance', score > 80 ? 'passed' : 'failed', {
        score,
        issues: legalIssues,
        suggestions
      });
    } catch (error) {
      updateChecklistItem('legal-compliance', 'failed');
    }
  };

  const generateFeaturedImageSuggestions = async () => {
    updateChecklistItem('featured-image', 'checking');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const suggestions = [
        'Abstract concept illustration for: ' + title,
        'Professional stock photo related to: ' + content.substring(0, 100),
        'Custom graphic with key statistics',
        'Brand-colored background with title overlay'
      ];
      
      updateChecklistItem('featured-image', 'passed', {
        score: 85,
        suggestions
      });
    } catch (error) {
      updateChecklistItem('featured-image', 'failed');
    }
  };

  const findInternalLinks = async () => {
    updateChecklistItem('internal-links', 'checking');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate finding relevant internal content
      const linkSuggestions = [
        'Link to related blog post: "Getting Started with Content Marketing"',
        'Link to service page: "Content Strategy Consulting"',
        'Link to case study: "How We Helped Company X Increase Traffic"'
      ];
      
      updateChecklistItem('internal-links', 'passed', {
        score: 90,
        suggestions: linkSuggestions
      });
    } catch (error) {
      updateChecklistItem('internal-links', 'failed');
    }
  };

  const updateChecklistItem = (id: string, status: ChecklistItem['status'], extra?: any) => {
    setChecklist(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status, ...extra }
        : item
    ));
    
    // Update overall score
    setChecklist(current => {
      const completedItems = current.filter(item => item.status === 'passed' || item.status === 'failed');
      const passedItems = current.filter(item => item.status === 'passed');
      const newScore = Math.round((passedItems.length / current.length) * 100);
      setOverallScore(newScore);
      return current;
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // Create publishing queue
      const platforms = ['blog', 'linkedin', 'twitter'];
      const queue = platforms.map(platform => ({
        id: Math.random().toString(36).substr(2, 9),
        platform,
        status: 'queued',
        scheduledTime: new Date(Date.now() + Math.random() * 3600000).toISOString()
      }));
      
      setPublishingQueue(queue);
      
      // Simulate publishing process
      for (const item of queue) {
        setPublishingQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'publishing' } : q
        ));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPublishingQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'published' } : q
        ));
      }
      
      // Start performance monitoring
      setTimeout(() => {
        setPerformanceData({
          views: Math.floor(Math.random() * 500) + 100,
          engagement: Math.floor(Math.random() * 50) + 10,
          shares: Math.floor(Math.random() * 25) + 5,
          timeOnPage: Math.floor(Math.random() * 120) + 60
        });
      }, 3000);
      
      toast({
        title: "Content Published Successfully",
        description: "Your content has been published across all selected platforms.",
      });
      
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "There was an error publishing your content.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const allChecksPassed = checklist.every(item => item.status === 'passed');
  const checksCompleted = checklist.every(item => item.status !== 'pending' && item.status !== 'checking');

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Publish Ready Score</span>
            <Badge variant={overallScore > 80 ? "default" : overallScore > 60 ? "secondary" : "destructive"}>
              {overallScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="mb-4" />
          <p className="text-sm text-gray-600">
            {overallScore > 80 
              ? "Excellent! Your content is ready to publish."
              : overallScore > 60 
              ? "Good progress. Address the remaining issues for optimal performance."
              : "Several issues need attention before publishing."
            }
          </p>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Flight Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {checklist.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <item.icon className="h-5 w-5 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{item.label}</h4>
                          {getStatusIcon(item.status)}
                          {item.score && (
                            <Badge variant="outline">{item.score}%</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        
                        {item.issues && item.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-red-600">Issues:</p>
                            <ul className="text-sm text-red-600 list-disc list-inside">
                              {item.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.suggestions && item.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-blue-600">Suggestions:</p>
                            <ul className="text-sm text-blue-600 list-disc list-inside">
                              {item.suggestions.map((suggestion, idx) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Publishing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-green-600" />
            <span>Publishing & Automation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Multi-Platform Publishing</p>
              <p className="text-sm text-gray-600">Publish to blog, LinkedIn, and Twitter simultaneously</p>
            </div>
            <Button 
              onClick={handlePublish}
              disabled={!checksCompleted || isPublishing}
              className="min-w-[120px]"
            >
              {isPublishing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </>
              )}
            </Button>
          </div>
          
          {!allChecksPassed && checksCompleted && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Some checks failed. You can still publish, but addressing these issues will improve performance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Queue */}
      {publishingQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Publishing Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {publishingQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'published' ? 'bg-green-500' :
                      item.status === 'publishing' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`} />
                    <span className="font-medium capitalize">{item.platform}</span>
                  </div>
                  <Badge variant={
                    item.status === 'published' ? 'default' :
                    item.status === 'publishing' ? 'secondary' :
                    'outline'
                  }>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Monitoring */}
      {performanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Initial Performance (24h)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{performanceData.views}</p>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{performanceData.engagement}%</p>
                <p className="text-sm text-gray-600">Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{performanceData.shares}</p>
                <p className="text-sm text-gray-600">Shares</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{performanceData.timeOnPage}s</p>
                <p className="text-sm text-gray-600">Time on Page</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublishingWorkflow;
