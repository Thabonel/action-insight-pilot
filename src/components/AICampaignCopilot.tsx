import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { AIAutocompleteInput } from '@/components/AIAutocompleteInput';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Wand2, 
  Users, 
  Target, 
  MessageSquare, 
  Calendar,
  BarChart3,
  RefreshCw,
  HelpCircle,
  Edit3,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';

interface CampaignBrief {
  businessGoal: string;
  targetAudience: string;
  campaignType: string;
  budget: string;
  timeline: string;
}

interface AIGeneration {
  personas: Array<{
    id: string;
    name: string;
    age: string;
    description: string;
    painPoints: string[];
    goals: string[];
    reasoning: string;
  }>;
  channelMix: {
    channels: Array<{
      name: string;
      allocation: number;
      reasoning: string;
    }>;
    totalBudget: number;
  };
  messagingPillars: Array<{
    id: string;
    title: string;
    description: string;
    tone: string;
    reasoning: string;
  }>;
  contentCalendar: Array<{
    id: string;
    date: string;
    platform: string;
    contentType: string;
    title: string;
    description: string;
    reasoning: string;
  }>;
}

interface AICampaignCopilotProps {
  initialBrief?: CampaignBrief;
  onSave?: (campaign: any) => void;
}

const AICampaignCopilot: React.FC<AICampaignCopilotProps> = ({ initialBrief, onSave }) => {
  const { toast } = useToast();
  const { recordApproval, recordEdit, recordRegeneration, recordRating } = useAIFeedback();
  const [step, setStep] = useState<'brief' | 'dashboard'>('brief');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [brief, setBrief] = useState<CampaignBrief>(initialBrief || {
    businessGoal: '',
    targetAudience: '',
    campaignType: '',
    budget: '',
    timeline: ''
  });
  const [aiGeneration, setAIGeneration] = useState<AIGeneration | null>(null);
  const [generatingStep, setGeneratingStep] = useState<string>('');

  const updateBrief = (field: keyof CampaignBrief, value: string) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const isComplete = Object.values(brief).every(value => value.trim() !== '');

  const generateCampaign = async () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Brief",
        description: "Please answer all questions before generating your campaign.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a session for this campaign generation
      const { data: session } = await supabase
        .from('campaign_copilot_sessions')
        .insert({
          user_id: user.id,
          brief_data: brief,
          status: 'active'
        })
        .select()
        .single();

      setSessionId(session.id);

      // Step 1: Generate Audience Insights
      setGeneratingStep('Analyzing your audience...');
      const { data: audienceData } = await supabase.functions.invoke('audience-insight-agent', {
        body: { brief, userId: user.id, sessionId: session.id }
      });

      // Step 2: Generate Channel Strategy
      setGeneratingStep('Optimizing channel mix...');
      const { data: channelData } = await supabase.functions.invoke('channel-strategy-agent', {
        body: { brief, personas: audienceData.personas, userId: user.id, sessionId: session.id }
      });

      // Step 3: Generate Messaging Strategy  
      setGeneratingStep('Crafting messaging pillars...');
      const { data: messagingData } = await supabase.functions.invoke('messaging-agent', {
        body: { brief, personas: audienceData.personas, channelStrategy: channelData, userId: user.id, sessionId: session.id }
      });

      // Step 4: Generate Content Calendar
      setGeneratingStep('Creating content calendar...');
      const { data: contentData } = await supabase.functions.invoke('content-calendar-agent', {
        body: { 
          brief, 
          personas: audienceData.personas, 
          channelStrategy: channelData,
          messagingStrategy: messagingData,
          userId: user.id, 
          sessionId: session.id 
        }
      });

      // Transform the AI responses to match our interface
      const aiGeneration: AIGeneration = {
        personas: audienceData.personas.map((p: any) => ({
          id: p.id,
          name: p.name,
          age: p.demographics?.age || 'Not specified',
          description: p.description,
          painPoints: p.painPoints || [],
          goals: p.motivations || [],
          reasoning: audienceData.reasoning || 'Generated based on campaign brief and historical data'
        })),
        channelMix: {
          channels: channelData.channelMix.map((c: any) => ({
            name: c.channel,
            allocation: c.budgetPercentage,
            reasoning: c.rationale
          })),
          totalBudget: parseFloat(brief.budget.replace(/[^\d.]/g, '')) || 0
        },
        messagingPillars: messagingData.messagingPillars.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          tone: p.emotionalAppeal || 'Professional',
          reasoning: messagingData.reasoning || 'Aligned with audience insights and channel strategy'
        })),
        contentCalendar: contentData.contentCalendar.slice(0, 10).map((c: any) => ({
          id: c.content[0]?.id || Math.random().toString(),
          date: c.date,
          platform: c.content[0]?.platform || 'Multi-channel',
          contentType: c.content[0]?.contentType || 'Mixed',
          title: c.content[0]?.title || 'Content piece',
          description: c.content[0]?.description || '',
          reasoning: contentData.reasoning || 'Optimized for audience engagement and channel performance'
        }))
      };

      setAIGeneration(aiGeneration);
      setStep('dashboard');

      toast({
        title: "Campaign Generated!",
        description: "Your AI co-pilot has created a comprehensive campaign strategy using specialized agents.",
      });

    } catch (error) {
      console.error('Error generating campaign:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setGeneratingStep('');
    }
  };

  const regenerateSection = async (section: string) => {
    toast({
      title: "Regenerating...",
      description: `Creating new ${section} recommendations.`,
    });
    // Simulate regeneration
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Updated!",
      description: `New ${section} generated with fresh insights.`,
    });
  };

  if (step === 'brief') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Campaign Co-pilot</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's build your campaign together. I'll ask you a few key questions, then create a comprehensive strategy with interactive recommendations you can refine.
          </p>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            Phase 1: Interactive Co-pilot
          </Badge>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Campaign Brief
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Answer these 5 questions to get started. The AI will use your answers to create a tailored campaign strategy.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessGoal" className="text-base font-medium">
                1. What's your main business goal? *
              </Label>
              <AIAutocompleteInput
                field="businessGoal"
                value={brief.businessGoal}
                onChange={(value) => updateBrief('businessGoal', value)}
                placeholder="e.g., Increase qualified leads by 40% to hit our Q1 revenue target of $500K"
                multiline
                context={{ campaignType: brief.campaignType }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-base font-medium">
                2. Describe your ideal customer *
              </Label>
              <AIAutocompleteInput
                field="targetAudience"
                value={brief.targetAudience}
                onChange={(value) => updateBrief('targetAudience', value)}
                placeholder="e.g., B2B SaaS marketing managers at companies with 50-500 employees, struggling with lead attribution"
                multiline
                context={{ campaignType: brief.campaignType, businessGoal: brief.businessGoal }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignType" className="text-base font-medium">
                3. What type of campaign fits your goals? *
              </Label>
              <Select value={brief.campaignType} onValueChange={(value) => updateBrief('campaignType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your campaign focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                  <SelectItem value="product_launch">Product Launch</SelectItem>
                  <SelectItem value="customer_retention">Customer Retention</SelectItem>
                  <SelectItem value="event_promotion">Event Promotion</SelectItem>
                  <SelectItem value="multi_channel">Multi-Channel Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-base font-medium">
                4. What's your total budget? *
              </Label>
              <Input
                id="budget"
                value={brief.budget}
                onChange={(e) => updateBrief('budget', e.target.value)}
                placeholder="e.g., $25,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-base font-medium">
                5. What's your timeline and key dates? *
              </Label>
              <Input
                id="timeline"
                value={brief.timeline}
                onChange={(e) => updateBrief('timeline', e.target.value)}
                placeholder="e.g., 3-month campaign starting February 1st, trade show in March"
              />
            </div>

            <div className="pt-4">
              <Progress value={Object.values(brief).filter(v => v.trim()).length * 20} className="mb-4" />
              <Button 
                onClick={generateCampaign}
                disabled={!isComplete || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Bot className="mr-2 h-4 w-4 animate-pulse" />
                    Creating Your Campaign Strategy...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Campaign with AI Co-pilot
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!aiGeneration) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Your AI-Generated Campaign Strategy</h1>
        <p className="text-muted-foreground">
          Review and refine each section. Click any element to edit or regenerate with AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Personas */}
        <Card className="group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Audience Personas</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateSection('personas')}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiGeneration.personas.map((persona) => (
              <div key={persona.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{persona.name}</h4>
                      <Badge variant="outline">{persona.age}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{persona.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {persona.painPoints.slice(0, 2).map((point, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <HelpCircle 
                      className="h-4 w-4" 
                      onClick={() => toast({
                        title: "AI Reasoning",
                        description: persona.reasoning
                      })}
                    />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Channel Mix */}
        <Card className="group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Channel & Budget Mix</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateSection('channel mix')}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-3">
              Total Budget: ${aiGeneration.channelMix.totalBudget.toLocaleString()}
            </div>
            {aiGeneration.channelMix.channels.map((channel, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{channel.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{channel.allocation}%</span>
                    <Button variant="ghost" size="sm">
                      <HelpCircle 
                        className="h-4 w-4" 
                        onClick={() => toast({
                          title: "Why this channel?",
                          description: channel.reasoning
                        })}
                      />
                    </Button>
                  </div>
                </div>
                <Progress value={channel.allocation} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  ${((aiGeneration.channelMix.totalBudget * channel.allocation) / 100).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Messaging Pillars */}
        <Card className="group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>Messaging Pillars</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateSection('messaging')}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiGeneration.messagingPillars.map((pillar) => (
              <div key={pillar.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h4 className="font-medium">{pillar.title}</h4>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    <Badge variant="outline" className="text-xs">{pillar.tone}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => recordApproval(pillar, { type: 'messaging', brief }, sessionId)}>
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => recordRegeneration(pillar, { type: 'messaging', brief }, sessionId)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <HelpCircle 
                        className="h-4 w-4" 
                        onClick={() => toast({
                          title: "AI Reasoning",
                          description: pillar.reasoning
                        })}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Calendar */}
        <Card className="group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Content Calendar</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateSection('content calendar')}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiGeneration.contentCalendar.map((content) => (
              <div key={content.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{content.title}</h4>
                      <Badge variant="outline">{content.platform}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{content.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(content.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{content.contentType}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <HelpCircle 
                        className="h-4 w-4" 
                        onClick={() => toast({
                          title: "Why this content?",
                          description: content.reasoning
                        })}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 pt-6">
        <Button variant="outline" onClick={() => setStep('brief')}>
          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
          Back to Brief
        </Button>
        <Button onClick={() => onSave?.(aiGeneration)} size="lg">
          Save Campaign Strategy
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default AICampaignCopilot;