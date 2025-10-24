
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Target,
  Zap,
  Upload,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFlowProps {
  onClose: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    industry: '',
    teamSize: '',
    goals: [] as string[],
    currentTools: [] as string[],
    budgetRange: '',
    targetAudience: '',
    contentTypes: [] as string[]
  });

  const totalSteps = 5;

  const businessTypes = [
    { id: 'startup', label: 'Startup', description: 'Early-stage company with growth focus' },
    { id: 'smb', label: 'Small Business', description: 'Established local or regional business' },
    { id: 'enterprise', label: 'Enterprise', description: 'Large organization with complex needs' },
    { id: 'agency', label: 'Marketing Agency', description: 'Serving multiple clients and brands' }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 
    'Manufacturing', 'Real Estate', 'Professional Services', 'Retail', 'Other'
  ];

  const marketingGoals = [
    'Increase brand awareness', 'Generate more leads', 'Improve conversion rates',
    'Enhance customer engagement', 'Boost social media presence', 'Optimize content strategy',
    'Automate marketing workflows', 'Better analytics and insights'
  ];

  const currentTools = [
    'HubSpot', 'Mailchimp', 'Salesforce', 'Google Analytics', 'Facebook Ads',
    'LinkedIn Ads', 'Hootsuite', 'Buffer', 'Canva', 'WordPress', 'Shopify', 'None'
  ];

  const contentTypes = [
    'Blog posts', 'Social media posts', 'Email campaigns', 'Landing pages',
    'Video scripts', 'Infographics', 'Case studies', 'Whitepapers', 'Product descriptions'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to complete onboarding',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_category: 'onboarding',
          preference_data: {
            business_type: formData.businessType,
            industry: formData.industry,
            team_size: formData.teamSize,
            goals: formData.goals,
            current_tools: formData.currentTools,
            budget_range: formData.budgetRange,
            target_audience: formData.targetAudience,
            content_types: formData.contentTypes,
            completed_at: new Date().toISOString()
          }
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Onboarding completed',
        description: 'Your preferences have been saved successfully'
      });

      onClose();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save onboarding data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
              <p className="text-gray-600">This helps us customize the AI behavior for your specific needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessTypes.map(type => (
                <div
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.businessType === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, businessType: type.id }))}
                >
                  <h3 className="font-medium">{type.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team Size</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="1-5">1-5 people</option>
                  <option value="6-20">6-20 people</option>
                  <option value="21-100">21-100 people</option>
                  <option value="100+">100+ people</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What are your marketing goals?</h2>
              <p className="text-gray-600">Select all that apply to help us prioritize AI suggestions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketingGoals.map(goal => (
                <div
                  key={goal}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.goals.includes(goal)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleArrayItem(
                    formData.goals, 
                    goal, 
                    (items) => setFormData(prev => ({ ...prev, goals: items }))
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{goal}</span>
                    {formData.goals.includes(goal) && <CheckCircle className="h-4 w-4 text-blue-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Current marketing tools</h2>
              <p className="text-gray-600">We'll help you integrate with existing tools</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentTools.map(tool => (
                <div
                  key={tool}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    formData.currentTools.includes(tool)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleArrayItem(
                    formData.currentTools, 
                    tool, 
                    (items) => setFormData(prev => ({ ...prev, currentTools: items }))
                  )}
                >
                  <span className="text-sm">{tool}</span>
                  {formData.currentTools.includes(tool) && (
                    <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Content preferences</h2>
              <p className="text-gray-600">Help us understand what content you need most</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contentTypes.map(type => (
                <div
                  key={type}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    formData.contentTypes.includes(type)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleArrayItem(
                    formData.contentTypes, 
                    type, 
                    (items) => setFormData(prev => ({ ...prev, contentTypes: items }))
                  )}
                >
                  <span className="text-sm">{type}</span>
                  {formData.contentTypes.includes(type) && (
                    <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <Input
                  placeholder="e.g., Small business owners, Tech professionals"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Marketing Budget</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select range</option>
                  <option value="under-1k">Under $1,000</option>
                  <option value="1k-5k">$1,000 - $5,000</option>
                  <option value="5k-20k">$5,000 - $20,000</option>
                  <option value="20k-plus">$20,000+</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Import existing data</h2>
              <p className="text-gray-600">Optional: Upload data from your current tools to get started faster</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium mb-2">Customer Data</h4>
                <p className="text-sm text-gray-600 mb-3">CSV file with contacts and leads</p>
                <Button variant="outline" size="sm">Upload CSV</Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium mb-2">Campaign Data</h4>
                <p className="text-sm text-gray-600 mb-3">Past campaign performance data</p>
                <Button variant="outline" size="sm">Upload Data</Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">🎉 You're all set!</h4>
              <p className="text-sm text-blue-700">
                Based on your responses, we'll configure the AI to match your business needs. 
                You can always adjust these settings later in the AI Behavior section.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Welcome to MarketingAI</CardTitle>
              <p className="text-gray-600 mt-1">Let's customize your experience</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
              <Badge variant="outline">{Math.round((currentStep / totalSteps) * 100)}% Complete</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {renderStep()}
        </CardContent>

        <div className="flex justify-between p-6 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button onClick={handleNext} disabled={isSaving}>
            {currentStep === totalSteps ? (isSaving ? 'Saving...' : 'Complete Setup') : 'Next'}
            {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
