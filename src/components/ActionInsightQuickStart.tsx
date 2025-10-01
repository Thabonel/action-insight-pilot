import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, Target, Mail, Users, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickStartStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
}

const ActionInsightQuickStart: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    valueProposition: '',
    budget: '',
    primaryGoal: '',
    timeframe: '30 days'
  });

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const quickStartSteps: QuickStartStep[] = [
    {
      id: 'setup',
      title: 'Define Your Product',
      description: 'Tell me about your business or service',
      icon: <Target className="h-5 w-5" />,
      completed: completedSteps.has(0)
    },
    {
      id: 'audience',
      title: 'Identify Target Audience',
      description: 'Who are your ideal customers?',
      icon: <Users className="h-5 w-5" />,
      completed: completedSteps.has(1)
    },
    {
      id: 'strategy',
      title: 'Create Marketing Strategy',
      description: 'Generate your custom marketing plan',
      icon: <Rocket className="h-5 w-5" />,
      completed: completedSteps.has(2)
    },
    {
      id: 'launch',
      title: 'Launch First Campaign',
      description: 'Start your marketing automation',
      icon: <Zap className="h-5 w-5" />,
      completed: completedSteps.has(3)
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const completeStep = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex < quickStartSteps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
    toast({
      title: "Step Completed!",
      description: `${quickStartSteps[stepIndex].title} has been completed.`,
    });
  };

  const generateMarketingStrategy = () => {
    const strategy = `
# Action Insight Pilot Marketing Strategy

## Product Overview
- **Product**: ${formData.productName}
- **Value Proposition**: ${formData.valueProposition}
- **Target Audience**: ${formData.targetAudience}
- **Budget**: ${formData.budget}
- **Primary Goal**: ${formData.primaryGoal}
- **Timeframe**: ${formData.timeframe}

## Recommended Campaign Strategy

### Phase 1: Content Marketing (Week 1-2)
- Create blog posts showcasing your product's value
- Video testimonials from satisfied customers
- Case studies showing ROI improvements

### Phase 2: Lead Generation (Week 2-3)
- Free tools or resources for your audience
- Lead magnets aligned with your value proposition
- Email sequence for trial sign-ups or conversions

### Phase 3: Social Proof & Conversion (Week 3-4)
- Customer success stories
- Free trial or demo promotion
- Limited-time offers for conversions

### Automation Triggers
1. **New Visitor**: Send welcome email with free resource
2. **Trial Sign-up**: 7-day onboarding sequence
3. **Trial Day 5**: Success story email
4. **Trial Day 7**: Conversion offer

### KPI Targets
- 100 new leads per month
- 15% trial-to-paid conversion rate
- $50 customer acquisition cost
- 25% email open rate

### Budget Allocation
- 40% - Paid advertising (Google/Facebook)
- 30% - Content creation
- 20% - Email marketing tools
- 10% - Analytics and optimization
    `;

    localStorage.setItem('actionInsightStrategy', strategy);
    completeStep(2);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Your product or service name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Value Proposition</label>
              <Textarea
                value={formData.valueProposition}
                onChange={(e) => handleInputChange('valueProposition', e.target.value)}
                placeholder="What problem does your product solve? How does it help customers?"
                rows={3}
              />
            </div>
            <Button 
              onClick={() => completeStep(0)}
              disabled={!formData.valueProposition.trim()}
              className="w-full"
            >
              Next: Define Audience
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <Textarea
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="Who are your ideal customers? (e.g., small business owners, marketing professionals)"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal</label>
              <Input
                value={formData.primaryGoal}
                onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                placeholder="e.g., Get 100 free trial signups, Generate $10k MRR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Budget</label>
              <Input
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="$1,000"
              />
            </div>
            <Button 
              onClick={() => completeStep(1)}
              disabled={!formData.targetAudience.trim() || !formData.primaryGoal.trim()}
              className="w-full"
            >
              Next: Generate Strategy
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center py-6">
              <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Generate Your Strategy!</h3>
              <p className="text-muted-foreground mb-6">
                I'll create a custom marketing strategy based on your inputs.
              </p>
              <Button onClick={generateMarketingStrategy} className="w-full">
                Generate Marketing Strategy
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Strategy Created!</h3>
              <p className="text-muted-foreground mb-6">
                Your marketing strategy is ready. Now let's launch your first campaign.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    const strategy = localStorage.getItem('actionInsightStrategy');
                    if (strategy) {
                      const blob = new Blob([strategy], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'action-insight-strategy.txt';
                      a.click();
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Download Strategy
                </Button>
                <Button 
                  onClick={() => completeStep(3)}
                  className="w-full"
                >
                  Start First Campaign
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Start Complete!</h3>
            <p className="text-muted-foreground">
              You're ready to start marketing effectively with Action Insight Pilot.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Action Insight Pilot - Marketing Quick Start
        </h1>
        <p className="text-muted-foreground">
          Let's get your marketing automation set up in 10 minutes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Steps */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStartSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      index === currentStep
                        ? 'bg-primary/10 border border-primary/20'
                        : step.completed
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        step.completed
                          ? 'bg-green-100 text-green-600'
                          : index === currentStep
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Step Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {quickStartSteps[currentStep]?.title || 'Complete!'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Quick Marketing Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Focus on Benefits</h4>
              <p className="text-xs text-muted-foreground">Show ROI, time savings, cost reduction</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Free Trial</h4>
              <p className="text-xs text-muted-foreground">Let customers experience the value</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Case Studies</h4>
              <p className="text-xs text-muted-foreground">Prove success with real examples</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionInsightQuickStart;
