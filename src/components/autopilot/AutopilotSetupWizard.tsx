import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InlineGuidance, FieldGuidance } from '@/components/help/InlineGuidance';
import { DecisionHelper, GoalSelector, budgetOptions, marketingGoals } from '@/components/help/DecisionHelper';
import { TermTooltip } from '@/components/help/MarketingGlossary';
import { HelpCircle, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AutopilotConfig {
  businessDescription: string;
  targetAudience: {
    demographics: string;
    painPoints: string;
    goals: string;
  };
  monthlyBudget: number;
  goals: string[];
}

interface AIStrategy {
  channels: Array<{
    name: string;
    budgetPercentage: number;
    rationale: string;
  }>;
  messaging: {
    valueProp: string;
    toneAndVoice: string;
  };
  timeline: string;
  expectedResults: {
    leads: string;
    roi: string;
  };
}

const stepLabels = [
  'Your Business',
  'Your Customers',
  'Budget & Goals',
  'Your Strategy'
];

const AutopilotSetupWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<AutopilotConfig>({
    businessDescription: '',
    targetAudience: {
      demographics: '',
      painPoints: '',
      goals: ''
    },
    monthlyBudget: 1000,
    goals: []
  });
  const [aiStrategy, setAiStrategy] = useState<AIStrategy | null>(null);

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-campaign-assistant', {
        body: {
          message: `Generate a comprehensive marketing strategy for this business:

Business: ${config.businessDescription}
Target Audience: ${config.targetAudience.demographics}
Pain Points: ${config.targetAudience.painPoints}
Customer Goals: ${config.targetAudience.goals}
Monthly Budget: $${config.monthlyBudget}
Goals: ${config.goals.join(', ')}

Provide a complete automated marketing strategy with:
1. Recommended marketing channels and budget allocation
2. Messaging and value proposition
3. Expected timeline and results
4. Channel-specific tactics

Format as JSON with: channels (array of {name, budgetPercentage, rationale}), messaging {valueProp, toneAndVoice}, timeline, expectedResults {leads, roi}`,
          userId: user?.id,
          context: { type: 'autopilot_setup', config }
        }
      });

      if (error) throw error;

      const strategy = typeof data.response === 'string'
        ? JSON.parse(data.response)
        : data.response;

      setAiStrategy(strategy);
      setStep(4);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error generating strategy:', error);
      toast({
        title: 'Strategy Generation Failed',
        description: errorMessage || 'Failed to generate marketing strategy',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivateAutopilot = async () => {
    if (!user || !aiStrategy) return;

    try {
      const { error } = await supabase
        .from('marketing_autopilot_config')
        .upsert({
          user_id: user.id,
          business_description: config.businessDescription,
          target_audience: config.targetAudience,
          monthly_budget: config.monthlyBudget,
          goals: config.goals,
          ai_strategy: aiStrategy,
          is_active: true,
          last_optimized_at: new Date().toISOString()
        });

      if (error) throw error;

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_category: 'interface',
          preference_data: { interface_mode: 'simple' }
        });

      toast({
        title: 'Marketing Autopilot Activated!',
        description: 'Your AI-powered marketing is now running automatically',
      });

      onComplete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error activating autopilot:', error);
      toast({
        title: 'Activation Failed',
        description: errorMessage || 'Failed to activate autopilot',
        variant: 'destructive'
      });
    }
  };

  const handleGoalToggle = (goalId: string) => {
    const goalLabel = marketingGoals.find(g => g.id === goalId)?.label || goalId;
    if (config.goals.includes(goalLabel)) {
      setConfig({ ...config, goals: config.goals.filter(g => g !== goalLabel) });
    } else if (config.goals.length < 3) {
      setConfig({ ...config, goals: [...config.goals, goalLabel] });
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Tell us about your business</CardTitle>
            <CardDescription className="mt-1">
              This helps our AI create marketing that speaks to your customers
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Step 1 of 4
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <InlineGuidance
          variant="tip"
          shortTip="The more specific you are, the better your marketing will be"
          expandedContent="Describe what makes your business different from competitors. Include the specific problem you solve and for whom. AI uses this to write ads and content that feel authentic to your brand."
          example="We sell ergonomic office chairs designed for people with back pain. Our chairs have a unique lumbar support system developed by chiropractors, and we offer a 30-day pain-free guarantee."
        />

        <div>
          <Label htmlFor="businessDescription" className="text-base font-medium">
            What do you sell or offer?
          </Label>
          <Textarea
            id="businessDescription"
            placeholder="Describe your product or service, who it's for, and what makes it special..."
            value={config.businessDescription}
            onChange={(e) => setConfig({ ...config, businessDescription: e.target.value })}
            rows={6}
            className="mt-2"
          />
          <FieldGuidance guidance="Include: what you sell, who buys it, why they choose you over alternatives" />
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Good business descriptions include:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              The specific problem you solve
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Who your typical customer is
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              What makes you different from competitors
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Price range or positioning (budget, premium, etc.)
            </li>
          </ul>
        </div>

        <Button
          onClick={() => setStep(2)}
          disabled={!config.businessDescription.trim() || config.businessDescription.length < 50}
          className="w-full"
          size="lg"
        >
          Next: Define Your Customers
        </Button>

        {config.businessDescription.trim() && config.businessDescription.length < 50 && (
          <p className="text-xs text-center text-yellow-600">
            Add more detail - at least 50 characters helps AI create better marketing
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Who are your ideal customers?</CardTitle>
            <CardDescription className="mt-1">
              Understanding your customers helps AI target the right people
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Step 2 of 4
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <InlineGuidance
          variant="info"
          shortTip="Think about your best customers - the ones you wish you had more of"
          expandedContent="Don't try to target everyone. The more specific your customer description, the better AI can find similar people. Think about: age, job title, location, income level, interests, and buying habits."
        />

        <div>
          <Label htmlFor="demographics" className="flex items-center gap-2 text-base font-medium">
            Who are they?
            <span className="text-xs text-gray-500 font-normal">(demographics)</span>
          </Label>
          <Textarea
            id="demographics"
            placeholder="e.g., Small business owners, 35-55 years old, running companies with 10-50 employees..."
            value={config.targetAudience.demographics}
            onChange={(e) => setConfig({
              ...config,
              targetAudience: { ...config.targetAudience, demographics: e.target.value }
            })}
            rows={3}
            className="mt-2"
          />
          <FieldGuidance guidance="Age, job title, company size, location, income level, industry" />
        </div>

        <div>
          <Label htmlFor="painPoints" className="flex items-center gap-2 text-base font-medium">
            What problems do they have?
            <span className="text-xs text-gray-500 font-normal">(pain points)</span>
          </Label>
          <Textarea
            id="painPoints"
            placeholder="e.g., Wasting hours on manual data entry, missing sales opportunities, struggling to track customer relationships..."
            value={config.targetAudience.painPoints}
            onChange={(e) => setConfig({
              ...config,
              targetAudience: { ...config.targetAudience, painPoints: e.target.value }
            })}
            rows={3}
            className="mt-2"
          />
          <FieldGuidance guidance="Frustrations, challenges, things that cost them time or money" />
        </div>

        <div>
          <Label htmlFor="customerGoals" className="flex items-center gap-2 text-base font-medium">
            What do they want to achieve?
            <span className="text-xs text-gray-500 font-normal">(goals)</span>
          </Label>
          <Textarea
            id="customerGoals"
            placeholder="e.g., Grow their business without hiring more staff, reduce costs, have more free time..."
            value={config.targetAudience.goals}
            onChange={(e) => setConfig({
              ...config,
              targetAudience: { ...config.targetAudience, goals: e.target.value }
            })}
            rows={3}
            className="mt-2"
          />
          <FieldGuidance guidance="Outcomes they dream about, what success looks like for them" />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
            Back
          </Button>
          <Button
            onClick={() => setStep(3)}
            disabled={
              !config.targetAudience.demographics.trim() ||
              !config.targetAudience.painPoints.trim() ||
              !config.targetAudience.goals.trim()
            }
            className="flex-1"
          >
            Next: Set Budget & Goals
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
            <CardTitle className="text-xl">How much do you want to spend?</CardTitle>
            <CardDescription className="mt-1">
              AI will optimize every dollar across the best channels for your business
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Step 3 of 4
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Budget Selection with Decision Helper */}
        <div>
          <DecisionHelper
            question="Choose your monthly marketing budget"
            description="This is how much you'll spend on ads and marketing each month. You can change it anytime."
            options={budgetOptions}
            selectedValue={config.monthlyBudget}
            onSelect={(value) => setConfig({ ...config, monthlyBudget: value as number })}
            recommendation="Start with $1,000/month if you're new to marketing - it's enough to learn what works without a big commitment"
            layout="list"
          />

          <div className="mt-4 flex items-center gap-4">
            <Label htmlFor="customBudget" className="text-sm">
              Or enter a custom amount:
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-lg">$</span>
              <Input
                id="customBudget"
                type="number"
                min="100"
                step="100"
                value={config.monthlyBudget}
                onChange={(e) => setConfig({ ...config, monthlyBudget: Number(e.target.value) })}
                className="w-32"
              />
              <span className="text-sm text-gray-500">/month</span>
            </div>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="border-t pt-6">
          <GoalSelector
            goals={marketingGoals}
            selectedGoals={marketingGoals
              .filter(g => config.goals.includes(g.label))
              .map(g => g.id)}
            onToggleGoal={handleGoalToggle}
            maxGoals={3}
          />

          <InlineGuidance
            className="mt-4"
            variant="tip"
            shortTip="Pick 1-2 goals to start. You can add more later."
            expandedContent="Trying to achieve too many goals at once spreads your budget thin and makes it harder for AI to optimize. Focus on what matters most right now, get results, then expand."
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleGenerateStrategy}
            disabled={config.monthlyBudget < 100 || config.goals.length === 0 || isGenerating}
            className="flex-1"
            size="lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Creating Your Strategy...
              </span>
            ) : (
              'Create My Marketing Strategy'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => {
    if (!aiStrategy) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Your Personalized Marketing Strategy</CardTitle>
              <CardDescription className="mt-1">
                AI created this plan based on your business and goals
              </CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-700">
              Ready to Launch
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Strategy */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-lg">Where your money will go</h3>
              <TermTooltip term="campaign">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TermTooltip>
            </div>
            <div className="space-y-3">
              {aiStrategy.channels?.map((channel, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{channel.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{channel.budgetPercentage}% of budget</Badge>
                      <span className="text-sm text-gray-600">
                        ${((config.monthlyBudget * channel.budgetPercentage) / 100).toFixed(0)}/mo
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{channel.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Messaging */}
          <div>
            <h3 className="font-semibold text-lg mb-3">How we'll talk about your business</h3>
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Your main message (value proposition)</p>
                <p className="text-sm font-medium">{aiStrategy.messaging?.valueProp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tone of voice</p>
                <p className="text-sm">{aiStrategy.messaging?.toneAndVoice}</p>
              </div>
            </div>
          </div>

          {/* Expected Results */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-lg">What to expect</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Leads</p>
                  <TermTooltip term="leads">
                    <HelpCircle className="h-3 w-3 text-gray-400" />
                  </TermTooltip>
                </div>
                <p className="text-2xl font-bold text-blue-600">{aiStrategy.expectedResults?.leads}</p>
                <p className="text-xs text-gray-500 mt-1">People who show interest</p>
              </div>
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expected ROI</p>
                  <TermTooltip term="roi">
                    <HelpCircle className="h-3 w-3 text-gray-400" />
                  </TermTooltip>
                </div>
                <p className="text-2xl font-bold text-green-600">{aiStrategy.expectedResults?.roi}</p>
                <p className="text-xs text-gray-500 mt-1">Return on your investment</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Timeline:</strong> {aiStrategy.timeline}
            </p>
          </div>

          {/* What happens next */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">What happens when you activate?</h4>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>AI creates and launches your campaigns automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Campaigns run 24/7, optimizing based on what works</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>New leads appear in your inbox as they come in</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Weekly email reports show your results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>You can pause, adjust, or stop anytime</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
              Change Settings
            </Button>
            <Button onClick={handleActivateAutopilot} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
              Activate Autopilot Marketing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {stepLabels.map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    idx + 1 === step
                      ? 'bg-blue-600 text-white'
                      : idx + 1 < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx + 1 < step ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  idx + 1 === step ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`w-12 md:w-20 h-1 mx-1 transition-colors ${
                    idx + 1 < step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default AutopilotSetupWizard;
