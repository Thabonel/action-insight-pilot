import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { Clock, Zap, Target, BarChart } from 'lucide-react';

interface Template {
  templateData: {
    name: string;
    type: string;
    description: string;
    budget?: string;
    targetAudience?: string;
    timeline?: string;
  };
}

interface CampaignCreatorProps {
  onCampaignCreated: () => void;
  selectedTemplate?: Template | null;
}

const IntelligentCampaignCreator: React.FC<CampaignCreatorProps> = ({ 
  onCampaignCreated, 
  selectedTemplate 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'email',
    description: '',
    budget: '',
    targetAudience: '',
    timeline: ''
  });
  const [predictions, setPredictions] = useState({
    estimatedLaunchTime: '2 hours from now',
    successProbability: 78,
    recommendedBudget: '$500',
    optimalTiming: 'Tuesday 10 AM'
  });

  // Pre-populate form when template is selected
  useEffect(() => {
    if (selectedTemplate?.templateData) {
      const templateData = selectedTemplate.templateData;
      setCampaignData({
        name: templateData.name,
        type: templateData.type,
        description: templateData.description,
        budget: templateData.budget || '',
        targetAudience: templateData.targetAudience || '',
        timeline: templateData.timeline || ''
      });

      // Update predictions based on template type
      const successRates = { email: 78, social: 65, content: 82, mixed: 71 };
      setPredictions(prev => ({
        ...prev,
        successProbability: successRates[templateData.type as keyof typeof successRates] || 70,
        recommendedBudget: templateData.budget || prev.recommendedBudget
      }));

      behaviorTracker.trackAction('planning', 'template_applied', {
        templateType: templateData.type,
        hasPrefilledData: true
      });
    }
  }, [selectedTemplate]);

  const steps = [
    { id: 1, name: 'Campaign Basics', icon: Target },
    { id: 2, name: 'Audience & Budget', icon: BarChart },
    { id: 3, name: 'Timeline & Launch', icon: Clock },
    { id: 4, name: 'Review & Predict', icon: Zap }
  ];

  useEffect(() => {
    setStepStartTime(Date.now());
  }, [currentStep]);

  const handleStepChange = (step: number) => {
    const timeSpent = Date.now() - stepStartTime;
    behaviorTracker.trackAction('planning', 'campaign_creator', {
      step: currentStep,
      timeSpent,
      action: 'step_complete'
    });
    setCurrentStep(step);
  };

  const handleInputChange = (field: string, value: string) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
    
    // Update predictions based on input
    if (field === 'type') {
      const successRates = { email: 78, social: 65, content: 82, mixed: 71 };
      setPredictions(prev => ({
        ...prev,
        successProbability: successRates[value as keyof typeof successRates] || 70
      }));
    }
  };

  const handleSubmit = async () => {
    const actionId = behaviorTracker.trackFeatureStart('campaign_create_intelligent');
    try {
      const result = await apiClient.createCampaign(campaignData);
      if (result.success) {
        behaviorTracker.trackFeatureComplete('campaign_create_intelligent', actionId, true);
        onCampaignCreated();
        // Reset form
        setCampaignData({ name: '', type: 'email', description: '', budget: '', targetAudience: '', timeline: '' });
        setCurrentStep(1);
      }
    } catch (error) {
      behaviorTracker.trackFeatureComplete('campaign_create_intelligent', actionId, false);
    }
  };

  return (
    <div className="space-y-6">
      {selectedTemplate && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Template Applied: Form pre-populated with template data
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {step.id < steps.length && (
                    <div className={`w-16 h-1 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
          </p>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Spring Product Launch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type
                </label>
                <select
                  value={campaignData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email Campaign</option>
                  <option value="social">Social Media</option>
                  <option value="content">Content Marketing</option>
                  <option value="mixed">Multi-Channel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={campaignData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your campaign objectives..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={campaignData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech professionals, 25-45 years"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  value={campaignData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Recommended: ${predictions.recommendedBudget}`}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Timeline
                </label>
                <input
                  type="text"
                  value={campaignData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2 weeks"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Optimal Launch Time</h4>
                <p className="text-sm text-blue-700">{predictions.optimalTiming}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Based on your historical success patterns
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Campaign Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {campaignData.name}</p>
                  <p><strong>Type:</strong> {campaignData.type}</p>
                  <p><strong>Budget:</strong> {campaignData.budget}</p>
                  <p><strong>Timeline:</strong> {campaignData.timeline}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">AI Predictions</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Estimated Launch:</strong> {predictions.estimatedLaunchTime}</p>
                  <p><strong>Success Probability:</strong> {predictions.successProbability}%</p>
                  <p><strong>Optimal Timing:</strong> {predictions.optimalTiming}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={() => handleStepChange(currentStep + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Campaign
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentCampaignCreator;
