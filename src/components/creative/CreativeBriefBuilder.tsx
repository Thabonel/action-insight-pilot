
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ModuleContent {
  primary?: string;
  secondary?: string[];
  success_metrics?: string[];
  demographics?: string;
  psychographics?: string;
  pain_points?: string[];
  main_message?: string;
  supporting_messages?: string[];
  tone?: string;
  ai_suggestion?: {
    hook: string;
    body: string;
    cta: string;
  };
}

interface BriefModule {
  id: string;
  type: 'objective' | 'audience' | 'messaging' | 'creative' | 'timeline' | 'kpis';
  title: string;
  content: ModuleContent;
  isComplete: boolean;
}

interface CreativeBrief {
  id: string;
  name: string;
  modules: BriefModule[];
  status: 'draft' | 'review' | 'approved' | 'in_progress';
  createdAt: string;
  assignedTo?: string;
}

const CreativeBriefBuilder: React.FC = () => {
  const [brief, setBrief] = useState<CreativeBrief>({
    id: 'brief_001',
    name: 'Q1 Product Launch Campaign',
    status: 'draft',
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'obj_1',
        type: 'objective',
        title: 'Campaign Objectives',
        content: { primary: '', secondary: [], success_metrics: [] },
        isComplete: false
      },
      {
        id: 'aud_1',
        type: 'audience',
        title: 'Target Audience',
        content: { demographics: '', psychographics: '', pain_points: [] },
        isComplete: false
      },
      {
        id: 'msg_1',
        type: 'messaging',
        title: 'Key Messaging',
        content: { main_message: '', supporting_messages: [], tone: '' },
        isComplete: false
      }
    ]
  });

  const [selectedModule, setSelectedModule] = useState<string>('obj_1');

  const updateModuleContent = (moduleId: string, field: string, value: string | string[]) => {
    setBrief(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { ...module, content: { ...module.content, [field]: value } }
          : module
      )
    }));
  };

  const addModule = (type: BriefModule['type']) => {
    const newModule: BriefModule = {
      id: `${type}_${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: {},
      isComplete: false
    };
    
    setBrief(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const generateAIScript = async () => {
    // Mock AI generation
    const aiSuggestion = {
      hook: "Transform your daily routine with our revolutionary new product",
      body: "Join thousands of customers who have already discovered the difference",
      cta: "Start your transformation today - Limited time offer!"
    };
    
    // Update the creative module if it exists
    setBrief(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.type === 'creative' 
          ? { ...module, content: { ...module.content, ai_suggestion: aiSuggestion }, isComplete: true }
          : module
      )
    }));
  };

  const currentModule = brief.modules.find(m => m.id === selectedModule);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Module Navigation */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Brief Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brief.modules.map(module => {
              return (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModule === module.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{module.title}</span>
                    </div>
                    {module.isComplete && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}

            <Button variant="outline" className="w-full" onClick={() => addModule('creative')}>
              Add Module
            </Button>
          </CardContent>
        </Card>

        {/* Brief Status */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="text-center">
              <Badge className={`mb-2 ${
                brief.status === 'approved' ? 'bg-green-100 text-green-800' :
                brief.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {brief.status.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600">
                {brief.modules.filter(m => m.isComplete).length} of {brief.modules.length} modules complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Editor */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{currentModule?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentModule?.type === 'objective' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primary-objective">Primary Objective</Label>
                  <Textarea
                    id="primary-objective"
                    placeholder="What is the main goal of this campaign?"
                    value={currentModule.content.primary || ''}
                    onChange={(e) => updateModuleContent(currentModule.id, 'primary', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="success-metrics">Success Metrics</Label>
                  <Input
                    id="success-metrics"
                    placeholder="e.g., 10% increase in conversions, 50k impressions"
                    value={currentModule.content.success_metrics?.join(', ') || ''}
                    onChange={(e) => updateModuleContent(currentModule.id, 'success_metrics', e.target.value.split(', '))}
                  />
                </div>
              </div>
            )}

            {currentModule?.type === 'audience' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="demographics">Demographics</Label>
                  <Textarea
                    id="demographics"
                    placeholder="Age, gender, location, income level..."
                    value={currentModule.content.demographics || ''}
                    onChange={(e) => updateModuleContent(currentModule.id, 'demographics', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="psychographics">Psychographics</Label>
                  <Textarea
                    id="psychographics"
                    placeholder="Interests, values, lifestyle, behaviors..."
                    value={currentModule.content.psychographics || ''}
                    onChange={(e) => updateModuleContent(currentModule.id, 'psychographics', e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentModule?.type === 'messaging' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="main-message">Main Message</Label>
                  <Textarea
                    id="main-message"
                    placeholder="Core message that resonates with your audience"
                    value={currentModule.content.main_message || ''}
                    onChange={(e) => updateModuleContent(currentModule.id, 'main_message', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tone">Brand Tone</Label>
                  <select 
                    id="tone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={currentModule.content.tone || ''}
                    onChange={(e) => updateModuleContent(currentModule.id, 'tone', e.target.value)}
                  >
                    <option value="">Select tone</option>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="urgent">Urgent</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="humorous">Humorous</option>
                  </select>
                </div>
              </div>
            )}

            {currentModule?.type === 'creative' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Creative Direction</h4>
                  <Button onClick={generateAIScript} className="bg-purple-600 hover:bg-purple-700">
                    Generate AI Script
                  </Button>
                </div>
                
                {currentModule.content.ai_suggestion && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">AI Generated Script</h5>
                    <div className="space-y-2 text-sm">
                      <div><strong>Hook:</strong> {currentModule.content.ai_suggestion.hook}</div>
                      <div><strong>Body:</strong> {currentModule.content.ai_suggestion.body}</div>
                      <div><strong>CTA:</strong> {currentModule.content.ai_suggestion.cta}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline">Save Draft</Button>
              <div className="space-x-2">
                <Button variant="outline">Preview</Button>
                <Button>Submit for Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreativeBriefBuilder;
