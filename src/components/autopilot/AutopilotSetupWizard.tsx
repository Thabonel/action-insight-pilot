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
      // Call AI Campaign Assistant to generate strategy
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

      // Parse AI response
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
      // Save autopilot configuration
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

      // Update user preference to simple mode
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_category: 'interface',
          preference_data: { interface_mode: 'simple' }
        });

      toast({
        title: 'Marketing Autopilot Activated! 🚀',
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

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          What do you sell or offer?
        </CardTitle>
        <CardDescription>
          Describe your business, products, or services in a few sentences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea
            id="businessDescription"
            placeholder="e.g., We provide project management software for construction companies..."
            value={config.businessDescription}
            onChange={(e) => setConfig({ ...config, businessDescription: e.target.value })}
            rows={6}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-2">
            Be specific: What makes you unique? What problem do you solve?
          </p>
        </div>

        <Button
          onClick={() => setStep(2)}
          disabled={!config.businessDescription.trim()}
          className="w-full"
        >
          Next: Define Your Audience
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Who are your ideal customers?
        </CardTitle>
        <CardDescription>
          Help us understand who you're trying to reach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="demographics">Demographics & Characteristics</Label>
          <Textarea
            id="demographics"
            placeholder="e.g., Construction project managers, 30-50 years old, managing teams of 10-100..."
            value={config.targetAudience.demographics}
            onChange={(e) => setConfig({
              ...config,
              targetAudience: { ...config.targetAudience, demographics: e.target.value }
            })}
            rows={3}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="painPoints">Their Main Pain Points</Label>
          <Textarea
            id="painPoints"
            placeholder="e.g., Struggling with project delays, budget overruns, poor communication..."
            value={config.targetAudience.painPoints}
            onChange={(e) => setConfig({
              ...config,
              targetAudience: { ...config.targetAudience, painPoints: e.target.value }
            })}
            rows={3}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="goals">What They Want to Achieve</Label>
          <Textarea
            id="goals"
            placeholder="e.g., Complete projects on time, reduce costs, improve team collaboration..."
            value={config.targetAudience.goals}
            onChange={(e) => setConfig({
              ...config,
              targetAudience: { ...config.targetAudience, goals: e.target.value }
            })}
            rows={3}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
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
            Next: Set Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          What's your monthly marketing budget?
        </CardTitle>
        <CardDescription>
          We'll optimize your spend across the most effective channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="budget">Monthly Budget ($USD)</Label>
          <div className="flex items-center gap-4 mt-2">
            <Input
              id="budget"
              type="number"
              min="100"
              step="100"
              value={config.monthlyBudget}
              onChange={(e) => setConfig({ ...config, monthlyBudget: Number(e.target.value) })}
              className="text-2xl font-bold"
            />
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <div className="flex gap-2 mt-3">
            {[500, 1000, 2500, 5000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setConfig({ ...config, monthlyBudget: amount })}
              >
                ${amount.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Your Primary Goals (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              'Generate Leads',
              'Increase Brand Awareness',
              'Drive Website Traffic',
              'Boost Sales',
              'Build Email List',
              'Grow Social Following'
            ].map((goal) => (
              <Button
                key={goal}
                variant={config.goals.includes(goal) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (config.goals.includes(goal)) {
                    setConfig({ ...config, goals: config.goals.filter(g => g !== goal) });
                  } else {
                    setConfig({ ...config, goals: [...config.goals, goal] });
                  }
                }}
              >
                {goal}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleGenerateStrategy}
            disabled={config.monthlyBudget < 100 || config.goals.length === 0 || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              'Generating Strategy...'
            ) : (
              'Generate AI Strategy'
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
          <CardTitle className="flex items-center gap-2">
            Your AI-Generated Marketing Strategy
          </CardTitle>
          <CardDescription>
            Review and activate your automated marketing plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Strategy */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Recommended Marketing Channels</h3>
            <div className="space-y-3">
              {aiStrategy.channels?.map((channel, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{channel.name}</h4>
                    <Badge variant="secondary">{channel.budgetPercentage}% of budget</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{channel.rationale}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    ${((config.monthlyBudget * channel.budgetPercentage) / 100).toFixed(0)}/month
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Messaging */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Your Messaging Strategy</h3>
            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Value Proposition</Label>
                <p className="text-sm">{aiStrategy.messaging?.valueProp}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Tone & Voice</Label>
                <p className="text-sm">{aiStrategy.messaging?.toneAndVoice}</p>
              </div>
            </div>
          </div>

          {/* Expected Results */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Expected Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <Label className="text-xs text-gray-500">Monthly Leads</Label>
                <p className="text-2xl font-bold text-blue-600">{aiStrategy.expectedResults?.leads}</p>
              </div>
              <div className="border rounded-lg p-4">
                <Label className="text-xs text-gray-500">Expected ROI</Label>
                <p className="text-2xl font-bold text-green-600">{aiStrategy.expectedResults?.roi}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Timeline:</strong> {aiStrategy.timeline}
            </p>
          </div>

          {/* Activation */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ AI will automatically create and launch campaigns</li>
              <li>✓ Continuous optimization based on performance</li>
              <li>✓ Weekly reports delivered to your email</li>
              <li>✓ Leads delivered to your inbox</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
              Modify Settings
            </Button>
            <Button onClick={handleActivateAutopilot} className="flex-1">
              Activate Autopilot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s === step
                  ? 'bg-blue-600 text-white'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 md:w-24 h-1 mx-2 ${
                  s < step ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
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
