/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable no-explicit-any for this file until Supabase types are regenerated after migration
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Search, Target, MessageSquare, Clock, Sparkles } from 'lucide-react';

interface OrganicConfig {
  businessDescription: string;
  founderStory: string;
  targetAudience: string;
  industry: string;
  personalityTraits: string[];
  brandVoice: string;
  qualityThreshold: number;
}

interface AuditResults {
  platformsDiscovered: Array<{
    platform: string;
    specific: string;
    estimatedSize: string;
    activityLevel: string;
    relevanceScore: number;
    notes: string;
  }>;
  problemLanguage: Array<{
    phrase: string;
    context: string;
    emotionalIntensity: string;
    frequency: string;
  }>;
  questionsAsked: string[];
  competitorGaps: Array<{
    topic: string;
    opportunity: string;
  }>;
}

interface PositioningResults {
  positioningStatement: string;
  whatYouDo: string;
  whoYouServe: string;
  villain: {
    name: string;
    type: string;
    description: string;
  };
  downstreamCosts: Array<{
    cost: string;
    timeframe: string;
  }>;
  coreMessages: Array<{
    message: string;
    pillar: string;
    emotionalHook: string;
  }>;
}

const PERSONALITY_TRAITS = [
  'Authentic', 'Bold', 'Caring', 'Direct', 'Empathetic',
  'Expert', 'Friendly', 'Humorous', 'Innovative', 'Passionate',
  'Professional', 'Rebellious', 'Supportive', 'Thoughtful', 'Visionary'
];

const stepLabels = [
  'Your Business',
  'Your Story',
  'The Audit',
  'Positioning',
  'Quality Settings'
];

interface Props {
  onComplete: () => void;
}

const OrganicSetupWizard: React.FC<Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<OrganicConfig>({
    businessDescription: '',
    founderStory: '',
    targetAudience: '',
    industry: '',
    personalityTraits: [],
    brandVoice: '',
    qualityThreshold: 70
  });
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);
  const [positioningResults, setPositioningResults] = useState<PositioningResults | null>(null);

  const handleRunAudit = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('audience-audit-agent', {
        body: {
          userId: user.id,
          businessDescription: config.businessDescription,
          targetAudience: config.targetAudience,
          industry: config.industry
        }
      });

      if (error) throw error;

      setAuditResults(data.audit);
      setStep(4);
      toast({
        title: 'Audit Complete',
        description: `Discovered ${data.audit.platformsDiscovered?.length || 0} platforms and captured audience language`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Audit error:', error);
      toast({
        title: 'Audit Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePositioning = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('positioning-definition-agent', {
        body: {
          userId: user.id,
          businessDescription: config.businessDescription,
          targetAudience: config.targetAudience,
          auditData: auditResults ? {
            problemLanguage: auditResults.problemLanguage,
            competitorGaps: auditResults.competitorGaps
          } : undefined
        }
      });

      if (error) throw error;

      setPositioningResults(data.positioning);
      setStep(5);
      toast({
        title: 'Positioning Created',
        description: 'Your Blank for Blank positioning is ready'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Positioning error:', error);
      toast({
        title: 'Positioning Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Using 'as any' until types are regenerated after migration
      const { error } = await (supabase as any)
        .from('organic_marketing_config')
        .upsert({
          user_id: user.id,
          business_description: config.businessDescription,
          founder_story: config.founderStory,
          personality_traits: config.personalityTraits,
          brand_voice: config.brandVoice,
          quality_threshold: config.qualityThreshold,
          golden_hour_enabled: true,
          setup_completed: true,
          setup_step: 5
        });

      if (error) throw error;

      toast({
        title: 'Setup Complete',
        description: 'Your Seven Ideas organic marketing system is ready'
      });

      onComplete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Setup error:', error);
      toast({
        title: 'Setup Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraitToggle = (trait: string) => {
    if (config.personalityTraits.includes(trait)) {
      setConfig({ ...config, personalityTraits: config.personalityTraits.filter(t => t !== trait) });
    } else if (config.personalityTraits.length < 5) {
      setConfig({ ...config, personalityTraits: [...config.personalityTraits, trait] });
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Tell us about your business</CardTitle>
            <CardDescription>
              AI uses this to understand what makes you unique and who you help
            </CardDescription>
          </div>
          <Badge variant="outline">Step 1 of 5</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="businessDescription" className="text-base font-medium">
            What does your business do?
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Describe the problem you solve and the result your customers get.
          </p>
          <Textarea
            id="businessDescription"
            placeholder="Example: We help small business owners automate their marketing so they can focus on serving customers instead of chasing leads..."
            value={config.businessDescription}
            onChange={(e) => setConfig({ ...config, businessDescription: e.target.value })}
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="targetAudience" className="text-base font-medium">
            Who is your ideal customer?
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Be specific - the more detail, the better AI can match their language.
          </p>
          <Textarea
            id="targetAudience"
            placeholder="Example: Busy founders of service businesses (agencies, consultants, coaches) who know they need to do marketing but don't have time to figure it out..."
            value={config.targetAudience}
            onChange={(e) => setConfig({ ...config, targetAudience: e.target.value })}
            rows={3}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="industry" className="text-base font-medium">
            Industry or niche
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            This helps AI find the right communities and language patterns.
          </p>
          <Textarea
            id="industry"
            placeholder="Example: B2B SaaS for marketing automation"
            value={config.industry}
            onChange={(e) => setConfig({ ...config, industry: e.target.value })}
            rows={1}
            className="mt-2"
          />
        </div>

        <Button
          onClick={() => setStep(2)}
          disabled={!config.businessDescription || !config.targetAudience}
          className="w-full"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Add your personal touch</CardTitle>
            <CardDescription>
              This is what makes your content sound like YOU, not a robot
            </CardDescription>
          </div>
          <Badge variant="outline">Step 2 of 5</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="founderStory" className="text-base font-medium">
            What's your story?
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            AI will weave bits of your story into content to make it authentic and relatable.
          </p>
          <Textarea
            id="founderStory"
            placeholder="Example: I spent 10 years in corporate marketing watching small businesses struggle with the same problems big companies solved with huge teams. I started this because I believed AI could level the playing field..."
            value={config.founderStory}
            onChange={(e) => setConfig({ ...config, founderStory: e.target.value })}
            rows={5}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Pick traits that describe your brand voice (up to 5)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Content will reflect these personality traits in tone and style.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {PERSONALITY_TRAITS.map((trait) => (
              <Badge
                key={trait}
                variant={config.personalityTraits.includes(trait) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleTraitToggle(trait)}
              >
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="brandVoice" className="text-base font-medium">
            How should your brand sound?
          </Label>
          <Textarea
            id="brandVoice"
            placeholder="e.g., Professional but approachable, uses analogies, avoids jargon, speaks directly to the reader..."
            value={config.brandVoice}
            onChange={(e) => setConfig({ ...config, brandVoice: e.target.value })}
            rows={2}
            className="mt-2"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button onClick={() => setStep(3)} className="flex-1">
            Continue to The Audit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-5 w-5" />
              Audience Research
            </CardTitle>
            <CardDescription>
              AI analyzes where your audience spends time online and how they talk about their problems
            </CardDescription>
          </div>
          <Badge variant="outline">Step 3 of 5</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3">
          <p className="font-medium">What happens when you click "Run Research":</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Find communities</strong> - Subreddits, LinkedIn groups, forums where your audience gathers</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Capture their words</strong> - Exact phrases they use to describe problems (so your content resonates)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Find questions</strong> - What they're asking online (great for content ideas)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Spot gaps</strong> - Topics competitors aren't covering well</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          <Button onClick={handleRunAudit} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching your audience...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run Research
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Unique Position
            </CardTitle>
            <CardDescription>
              AI creates a clear statement of what you do and who you help - plus identifies what you stand against
            </CardDescription>
          </div>
          <Badge variant="outline">Step 4 of 5</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {auditResults && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
              <p className="font-medium text-green-800 dark:text-green-200">Audit Results</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>{auditResults.platformsDiscovered?.length || 0} platforms discovered</li>
                <li>{auditResults.problemLanguage?.length || 0} problem phrases captured</li>
                <li>{auditResults.questionsAsked?.length || 0} questions for AEO</li>
              </ul>
            </div>

            {auditResults.platformsDiscovered?.slice(0, 3).map((p, i) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium">{p.specific}</p>
                <p className="text-sm text-muted-foreground">{p.notes}</p>
              </div>
            ))}
          </div>
        )}

        {positioningResults ? (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
              <p className="font-medium">Your Positioning</p>
              <p className="text-lg mt-2">{positioningResults.positioningStatement}</p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium">The Villain: {positioningResults.villain?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{positioningResults.villain?.description}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => setStep(5)} className="flex-1">
                Continue to Quality Settings
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={handleCreatePositioning} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Positioning...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Positioning
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Final Settings
            </CardTitle>
            <CardDescription>
              Set your quality standards - you're almost ready to create content
            </CardDescription>
          </div>
          <Badge variant="outline">Step 5 of 5</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Quality Bar: {config.qualityThreshold}/100</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Every piece of content gets a quality score. Only content scoring above this threshold is recommended for publishing.
            Start at 70 and adjust based on your results.
          </p>
          <Slider
            value={[config.qualityThreshold]}
            onValueChange={(value) => setConfig({ ...config, qualityThreshold: value[0] })}
            min={50}
            max={90}
            step={5}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>50 (Post more often)</span>
            <span>90 (Only the best)</span>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4">
          <div className="flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-200">
            <Clock className="h-4 w-4" />
            Golden Hour Reminders
          </div>
          <p className="text-sm mt-2">
            The first 60 minutes after posting is critical for engagement. We'll show you the best times to post and remind you to engage with comments quickly.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
          <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing Setup...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Setup
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Set Up Your Content System</h1>
        <p className="text-muted-foreground">
          Answer a few questions so AI can create content that sounds like you and resonates with your audience.
          This takes about 5 minutes.
        </p>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            {stepLabels.map((label, index) => (
              <span
                key={label}
                className={index + 1 <= step ? 'text-primary font-medium' : 'text-muted-foreground'}
              >
                {label}
              </span>
            ))}
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </div>
      </div>

      {renderCurrentStep()}
    </div>
  );
};

export default OrganicSetupWizard;
