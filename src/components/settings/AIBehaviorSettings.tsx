
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Target, 
  MessageSquare, 
  BarChart3, 
  Save,
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-react';

const AIBehaviorSettings: React.FC = () => {
  const [aiSettings, setAiSettings] = useState({
    creativity: [75],
    speed: [60],
    riskTolerance: [40],
    personalization: [85],
    automation: {
      autoOptimize: true,
      autoSuggest: true,
      autoSchedule: false,
      autoReport: true
    },
    preferences: {
      tone: 'professional',
      industry: 'technology',
      targetAudience: 'business',
      contentLength: 'medium'
    },
    advanced: {
      learningRate: [70],
      adaptationSpeed: [55],
      conservatism: [30]
    }
  });

  const handleSave = () => {
    console.log('Saving AI behavior settings:', aiSettings);
    // Implementation would save to backend
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal, business-oriented communication' },
    { value: 'casual', label: 'Casual', description: 'Friendly, conversational tone' },
    { value: 'technical', label: 'Technical', description: 'Detailed, data-driven approach' },
    { value: 'creative', label: 'Creative', description: 'Innovative, experimental style' }
  ];

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' }
  ];

  return (
    <div className="space-y-6">
      {/* AI Personality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Personality & Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Creativity Level</label>
                <Badge variant="outline">{aiSettings.creativity[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.creativity}
                onValueChange={(value) => setAiSettings(prev => ({ ...prev, creativity: value }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">How creative and experimental AI suggestions should be</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Response Speed</label>
                <Badge variant="outline">{aiSettings.speed[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.speed}
                onValueChange={(value) => setAiSettings(prev => ({ ...prev, speed: value }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">Balance between speed and thoroughness of AI responses</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Risk Tolerance</label>
                <Badge variant="outline">{aiSettings.riskTolerance[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.riskTolerance}
                onValueChange={(value) => setAiSettings(prev => ({ ...prev, riskTolerance: value }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">Willingness to suggest bold, experimental strategies</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Personalization</label>
                <Badge variant="outline">{aiSettings.personalization[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.personalization}
                onValueChange={(value) => setAiSettings(prev => ({ ...prev, personalization: value }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">How much AI adapts to your specific business and audience</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Automation Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(aiSettings.automation).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {key === 'autoOptimize' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                  {key === 'autoSuggest' && <Lightbulb className="h-4 w-4 text-blue-600" />}
                  {key === 'autoSchedule' && <Clock className="h-4 w-4 text-blue-600" />}
                  {key === 'autoReport' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                </div>
                <div>
                  <h4 className="font-medium">
                    {key === 'autoOptimize' && 'Auto-Optimize Campaigns'}
                    {key === 'autoSuggest' && 'AI Suggestions'}
                    {key === 'autoSchedule' && 'Auto-Schedule Content'}
                    {key === 'autoReport' && 'Automated Reporting'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {key === 'autoOptimize' && 'Automatically optimize campaigns based on performance'}
                    {key === 'autoSuggest' && 'Proactive AI suggestions for improvements'}
                    {key === 'autoSchedule' && 'AI determines optimal posting times'}
                    {key === 'autoReport' && 'Generate performance reports automatically'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => setAiSettings(prev => ({
                  ...prev,
                  automation: { ...prev.automation, [key]: checked }
                }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication Style</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="font-medium mb-3 block">Tone of Voice</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {toneOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    aiSettings.preferences.tone === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setAiSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, tone: option.value }
                  }))}
                >
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium mb-2 block">Industry Focus</label>
              <select
                value={aiSettings.preferences.industry}
                onChange={(e) => setAiSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, industry: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {industryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium mb-2 block">Target Audience</label>
              <select
                value={aiSettings.preferences.targetAudience}
                onChange={(e) => setAiSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, targetAudience: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="business">Business Professionals</option>
                <option value="consumers">General Consumers</option>
                <option value="technical">Technical Audience</option>
                <option value="creative">Creative Professionals</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Advanced AI Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Learning Rate</label>
                <Badge variant="outline">{aiSettings.advanced.learningRate[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.advanced.learningRate}
                onValueChange={(value) => setAiSettings(prev => ({
                  ...prev,
                  advanced: { ...prev.advanced, learningRate: value }
                }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">How quickly AI adapts to new data</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Adaptation Speed</label>
                <Badge variant="outline">{aiSettings.advanced.adaptationSpeed[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.advanced.adaptationSpeed}
                onValueChange={(value) => setAiSettings(prev => ({
                  ...prev,
                  advanced: { ...prev.advanced, adaptationSpeed: value }
                }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">Speed of strategy adjustments</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Conservatism</label>
                <Badge variant="outline">{aiSettings.advanced.conservatism[0]}%</Badge>
              </div>
              <Slider
                value={aiSettings.advanced.conservatism}
                onValueChange={(value) => setAiSettings(prev => ({
                  ...prev,
                  advanced: { ...prev.advanced, conservatism: value }
                }))}
                max={100}
                step={5}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">Preference for proven strategies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save AI Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default AIBehaviorSettings;
