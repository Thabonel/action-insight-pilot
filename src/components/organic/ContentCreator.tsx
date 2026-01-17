/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable no-explicit-any for this file until Supabase types are regenerated after migration
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface ContentPiece {
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

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'blog', label: 'Blog' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'facebook', label: 'Facebook' }
];

const CONTENT_TYPES = [
  { value: 'post', label: 'Single Post' },
  { value: 'thread', label: 'Thread' },
  { value: 'article', label: 'Article' },
  { value: 'video_script', label: 'Video Script' },
  { value: 'carousel', label: 'Carousel' }
];

interface Props {
  onContentCreated?: (contentId: string) => void;
}

const ContentCreator: React.FC<Props> = ({ onContentCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [platform, setPlatform] = useState('linkedin');
  const [contentType, setContentType] = useState('post');
  const [topic, setTopic] = useState('');
  const [messageTag, setMessageTag] = useState('any');
  const [generatedContent, setGeneratedContent] = useState<ContentPiece | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [coreMessages, setCoreMessages] = useState<string[]>([]);

  useEffect(() => {
    const loadPositioning = async () => {
      if (!user) return;

      // Using 'as any' until types are regenerated after migration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('positioning_definitions')
        .select('core_messages')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data?.core_messages) {
        const messages = (data.core_messages as Array<{ message: string }>).map(m => m.message);
        setCoreMessages(messages);
      }
    };

    loadPositioning();
  }, [user]);

  const handleGenerate = async () => {
    if (!user || !topic) return;
    setIsGenerating(true);
    setQualityAssessment(null);

    try {
      // Using 'as any' until types are regenerated after migration
      const { data: configData } = await (supabase as any)
        .from('organic_marketing_config')
        .select('founder_story, personality_traits, brand_voice')
        .eq('user_id', user.id)
        .single();

      const { data: positioningData } = await (supabase as any)
        .from('positioning_definitions')
        .select('positioning_statement, villain, core_messages')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      const { data: auditData } = await (supabase as any)
        .from('audience_research')
        .select('problem_language, raw_quotes')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('organic-content-agent', {
        body: {
          userId: user.id,
          platform,
          contentType,
          topic,
          messageTag: (messageTag && messageTag !== 'any') ? messageTag : undefined,
          positioning: positioningData ? {
            positioningStatement: positioningData.positioning_statement,
            villain: positioningData.villain,
            coreMessages: positioningData.core_messages
          } : undefined,
          audienceData: auditData ? {
            problemLanguage: auditData.problem_language,
            rawQuotes: auditData.raw_quotes
          } : undefined,
          personalityElements: configData ? {
            founderStory: configData.founder_story,
            personalityTraits: configData.personality_traits,
            brandVoice: configData.brand_voice
          } : undefined
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      setContentId(data.contentId);

      toast({
        title: 'Content Generated',
        description: 'Now running quality assessment...'
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

  const handleScoreContent = async (content: ContentPiece, id?: string) => {
    if (!user) return;
    setIsScoring(true);

    try {
      // Using 'as any' until types are regenerated after migration
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
            platform,
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

      toast({
        title: data.passed ? 'Quality Gate Passed' : 'Needs Improvement',
        description: `Score: ${data.overallScore}/100`,
        variant: data.passed ? 'default' : 'destructive'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Scoring error:', error);
      toast({
        title: 'Scoring Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsScoring(false);
    }
  };

  const handleSchedule = () => {
    if (contentId && onContentCreated) {
      onContentCreated(contentId);
    }
    toast({
      title: 'Ready to Schedule',
      description: 'Content added to your queue'
    });
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Content</CardTitle>
          <CardDescription>
            Tell AI what you want to talk about. It will create content using your audience's language,
            your personality, and format it for your chosen platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Where will you post this?</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Content format</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {coreMessages.length > 0 && (
            <div>
              <Label>Theme (optional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Pick a core message to focus on, or leave blank for general content.
              </p>
              <Select value={messageTag} onValueChange={setMessageTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a theme..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any theme</SelectItem>
                  {coreMessages.map((msg, i) => (
                    <SelectItem key={i} value={msg}>{msg.slice(0, 50)}...</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="topic">What do you want to talk about?</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Share your idea, insight, or story. AI will transform it into engaging content.
            </p>
            <Textarea
              id="topic"
              placeholder="Example: I just realized that most small business owners spend more time on marketing admin than actually talking to customers. Here's what I think we should do about it..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || !topic} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{generatedContent.title}</CardTitle>
              {qualityAssessment && (
                <Badge variant={qualityAssessment.passed ? 'default' : 'destructive'}>
                  Score: {qualityAssessment.overallScore}/100
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent.content}</pre>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Problem Match Opening</p>
                <p className="text-muted-foreground">{generatedContent.problemMatchOpening}</p>
              </div>
              <div>
                <p className="font-medium">Core Message</p>
                <p className="text-muted-foreground">{generatedContent.coreMessage}</p>
              </div>
            </div>

            {generatedContent.personalityElements?.length > 0 && (
              <div>
                <p className="font-medium text-sm">Personality Elements</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {generatedContent.personalityElements.map((el, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{el}</Badge>
                  ))}
                </div>
              </div>
            )}

            {generatedContent.aeoQuestionsAnswered?.length > 0 && (
              <div>
                <p className="font-medium text-sm">AEO Questions Answered</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {generatedContent.aeoQuestionsAnswered.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {qualityAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {qualityAssessment.passed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              {qualityAssessment.passed ? 'Ready to Publish' : 'Needs Improvement'}
            </CardTitle>
            <CardDescription>
              {qualityAssessment.passed
                ? 'This content meets your quality standards and is ready to schedule.'
                : 'Review the feedback below and regenerate, or approve anyway if you\'re happy with it.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(qualityAssessment.scores).map(([key, value]) => {
                const maxScore = ['villainReference', 'messageClarity'].includes(key) ? 15 :
                               key === 'platformFit' ? 10 : 20;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label}</span>
                      <span className={getScoreColor(value.score, maxScore)}>
                        {value.score}/{maxScore}
                      </span>
                    </div>
                    <Progress value={(value.score / maxScore) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{value.feedback}</p>
                  </div>
                );
              })}
            </div>

            {qualityAssessment.priorityImprovements?.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4">
                <p className="font-medium text-sm">Priority Improvements</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {qualityAssessment.priorityImprovements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {qualityAssessment.passed && (
              <Button onClick={handleSchedule} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Add to Schedule Queue
              </Button>
            )}

            {!qualityAssessment.passed && (
              <Button onClick={handleGenerate} variant="outline" className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate Content
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isScoring && (
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

export default ContentCreator;
