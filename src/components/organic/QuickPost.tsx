/* eslint-disable @typescript-eslint/no-explicit-any */
// Quick Post Component - Streamlined auto-generate and publish flow
// User selects platform, AI generates content using stored context, then publish directly

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  Edit2,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface GeneratedContent {
  title: string;
  content: string;
  problemMatchOpening: string;
  personalityElements: string[];
  aeoQuestionsAnswered: string[];
  villainReference: string | null;
  coreMessage: string;
  hashtags: string[];
  callToAction: string;
}

interface QualityAssessment {
  overallScore: number;
  passed: boolean;
  scores: {
    problemMatch: { score: number; feedback: string };
    personalityPresence: { score: number; feedback: string };
    aeoOptimization: { score: number; feedback: string };
    villainReference: { score: number; feedback: string };
    messageClarity: { score: number; feedback: string };
    platformFit: { score: number; feedback: string };
  };
  priorityImprovements: string[];
}

interface PlatformConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'linkedin', name: 'LinkedIn', emoji: 'in', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  { id: 'twitter', name: 'Twitter/X', emoji: 'X', color: 'text-sky-500', bgColor: 'bg-sky-100 dark:bg-sky-950' },
  { id: 'instagram', name: 'Instagram', emoji: 'IG', color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-950' },
  { id: 'facebook', name: 'Facebook', emoji: 'fb', color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  { id: 'youtube', name: 'YouTube', emoji: 'YT', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  { id: 'reddit', name: 'Reddit', emoji: 'r/', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-950' },
];

interface Props {
  onContentCreated?: (contentId: string) => void;
}

interface SetupStatus {
  hasPositioning: boolean;
  hasAudienceResearch: boolean;
  hasConfig: boolean;
  connectedPlatforms: string[];
}

const QuickPost: React.FC<Props> = ({ onContentCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [knowledgeDocsUsed, setKnowledgeDocsUsed] = useState<number>(0);

  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    hasPositioning: false,
    hasAudienceResearch: false,
    hasConfig: false,
    connectedPlatforms: []
  });
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);

  useEffect(() => {
    if (user) {
      checkSetupStatus();
    }
  }, [user]);

  const checkSetupStatus = async () => {
    if (!user) return;
    setIsLoadingSetup(true);

    try {
      // Check positioning
      const { data: positioning } = await (supabase as any)
        .from('positioning_definitions')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Check audience research
      const { data: audience } = await (supabase as any)
        .from('audience_research')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Check organic config
      const { data: config } = await (supabase as any)
        .from('organic_marketing_config')
        .select('id, setup_completed')
        .eq('user_id', user.id)
        .single();

      // Check connected platforms
      const { data: connections } = await (supabase as any)
        .from('oauth_connections')
        .select('platform_name')
        .eq('user_id', user.id)
        .eq('connection_status', 'connected');

      setSetupStatus({
        hasPositioning: !!positioning,
        hasAudienceResearch: !!audience,
        hasConfig: config?.setup_completed || false,
        connectedPlatforms: connections?.map((c: any) => c.platform_name) || []
      });
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !selectedPlatform) return;

    setIsGenerating(true);
    setGeneratedContent(null);
    setQualityAssessment(null);
    setKnowledgeDocsUsed(0);

    try {
      const { data, error } = await supabase.functions.invoke('organic-content-agent', {
        body: {
          userId: user.id,
          platform: selectedPlatform,
          contentType: 'post',
          autoGenerate: true
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      setContentId(data.contentId);
      setKnowledgeDocsUsed(data.knowledgeDocsUsed || 0);

      toast({
        title: 'Content Generated',
        description: 'Running quality assessment...'
      });

      handleScoreContent(data.content, data.contentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScoreContent = async (content: GeneratedContent, id?: string) => {
    if (!user) return;
    setIsScoring(true);

    try {
      const { data: configData } = await (supabase as any)
        .from('organic_marketing_config')
        .select('quality_threshold')
        .eq('user_id', user.id)
        .single();

      const { data: positioningData } = await (supabase as any)
        .from('positioning_definitions')
        .select('positioning_statement, villain, core_messages')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      const { data, error } = await supabase.functions.invoke('quality-gate-agent', {
        body: {
          userId: user.id,
          contentId: id || contentId,
          content: {
            title: content.title,
            content: content.content,
            platform: selectedPlatform,
            problemMatchOpening: content.problemMatchOpening,
            personalityElements: content.personalityElements,
            aeoQuestionsAnswered: content.aeoQuestionsAnswered
          },
          positioning: positioningData ? {
            positioningStatement: positioningData.positioning_statement,
            villain: positioningData.villain,
            coreMessages: positioningData.core_messages
          } : undefined,
          qualityThreshold: configData?.quality_threshold || 70
        }
      });

      if (error) throw error;

      setQualityAssessment(data.assessment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Scoring error:', error);
      toast({
        title: 'Quality check failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsScoring(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !selectedPlatform || !generatedContent) return;

    setIsPublishing(true);

    try {
      const contentToPublish = isEditing ? editedContent : generatedContent.content;

      const { data, error } = await supabase.functions.invoke('social-post', {
        body: {
          platforms: [selectedPlatform],
          content: {
            text: contentToPublish,
            hashtags: generatedContent.hashtags
          }
        }
      });

      if (error) throw error;

      const platformResult = data?.results?.find((r: any) => r.platform === selectedPlatform);

      if (platformResult?.success) {
        // Update content status in database
        if (contentId) {
          await (supabase as any)
            .from('content_pieces')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
              content: contentToPublish
            })
            .eq('id', contentId);
        }

        toast({
          title: 'Posted successfully',
          description: `Your content has been published to ${PLATFORMS.find(p => p.id === selectedPlatform)?.name}`
        });

        if (contentId && onContentCreated) {
          onContentCreated(contentId);
        }

        // Reset for next post
        setGeneratedContent(null);
        setQualityAssessment(null);
        setContentId(null);
        setIsEditing(false);
        setEditedContent('');
      } else {
        throw new Error(platformResult?.error || 'Failed to publish');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Publishing error:', error);
      toast({
        title: 'Publishing Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleEdit = () => {
    if (generatedContent) {
      setEditedContent(generatedContent.content);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleSaveEdit = () => {
    if (generatedContent && editedContent) {
      setGeneratedContent({
        ...generatedContent,
        content: editedContent
      });
      setIsEditing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isSetupComplete = setupStatus.hasPositioning && setupStatus.hasAudienceResearch && setupStatus.hasConfig;

  if (isLoadingSetup) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isSetupComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Complete Setup First
          </CardTitle>
          <CardDescription>
            Quick Post uses your marketing context to generate content automatically.
            Complete the setup to enable this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            {setupStatus.hasPositioning ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className={setupStatus.hasPositioning ? '' : 'text-muted-foreground'}>
              Brand Positioning
            </span>
          </div>
          <div className="flex items-center gap-3">
            {setupStatus.hasAudienceResearch ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className={setupStatus.hasAudienceResearch ? '' : 'text-muted-foreground'}>
              Audience Research
            </span>
          </div>
          <div className="flex items-center gap-3">
            {setupStatus.hasConfig ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className={setupStatus.hasConfig ? '' : 'text-muted-foreground'}>
              Organic Marketing Setup
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Go to the Setup tab to complete your marketing context configuration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Post
          </CardTitle>
          <CardDescription>
            Select a platform and AI will generate engaging content using your brand positioning,
            audience insights, and uploaded knowledge docs - no topic needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Platform Selection */}
          <div>
            <p className="font-medium mb-3">1. Where do you want to post?</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PLATFORMS.map((platform) => {
                const isConnected = setupStatus.connectedPlatforms.includes(platform.id);
                const isSelected = selectedPlatform === platform.id;

                return (
                  <button
                    key={platform.id}
                    onClick={() => isConnected && setSelectedPlatform(platform.id)}
                    disabled={!isConnected}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : isConnected
                          ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                          : 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <div className={`h-10 w-10 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${isConnected ? platform.color : 'text-muted-foreground'}`}>
                        {platform.emoji}
                      </span>
                    </div>
                    <span className="text-xs font-medium">{platform.name}</span>
                    {!isConnected && (
                      <Badge variant="outline" className="text-xs absolute -bottom-2 px-1">
                        Not Connected
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            {setupStatus.connectedPlatforms.length === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                No platforms connected. Go to Settings &gt; Integrations to connect your accounts.
              </p>
            )}
          </div>

          {/* Step 2: Generate Button */}
          <div>
            <p className="font-medium mb-3">2. Generate your post</p>
            <Button
              onClick={handleGenerate}
              disabled={!selectedPlatform || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Post
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Generated Content
                  {qualityAssessment && (
                    <Badge
                      variant={qualityAssessment.passed ? 'default' : 'secondary'}
                      className={qualityAssessment.passed ? 'bg-green-600' : ''}
                    >
                      Score: {qualityAssessment.overallScore}/100
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <FileText className="h-4 w-4" />
                  Based on your positioning + audience research
                  {knowledgeDocsUsed > 0 && (
                    <span className="text-primary"> + {knowledgeDocsUsed} knowledge doc{knowledgeDocsUsed > 1 ? 's' : ''}</span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Display/Edit */}
            <div className="bg-muted rounded-lg p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-sans">{generatedContent.content}</pre>
              )}
            </div>

            {/* Hashtags */}
            {generatedContent.hashtags?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Score Details (Collapsed by default) */}
            {qualityAssessment && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  View quality breakdown
                </summary>
                <div className="mt-3 space-y-2">
                  {Object.entries(qualityAssessment.scores).map(([key, value]) => {
                    const maxScore = ['villainReference', 'messageClarity'].includes(key) ? 15 :
                                   key === 'platformFit' ? 10 : 20;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                    const percentage = (value.score / maxScore) * 100;

                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{label}</span>
                          <span className={getScoreColor(percentage)}>{value.score}/{maxScore}</span>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </details>
            )}

            {/* Priority Improvements */}
            {qualityAssessment && !qualityAssessment.passed && qualityAssessment.priorityImprovements?.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Suggestions for improvement</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {qualityAssessment.priorityImprovements.slice(0, 2).map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>

              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex-1"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}

              <Button
                onClick={handlePublish}
                disabled={isPublishing || isScoring}
                className="flex-1"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : isScoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State for Scoring */}
      {isScoring && !qualityAssessment && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Running quality assessment...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickPost;
