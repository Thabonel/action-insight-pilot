
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Settings, Share2, Mail, MessageSquare, Calendar, Target } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';

const VisualWorkflowBuilder: React.FC = () => {
  const { workflows, loading, executeWorkflow } = useWorkflows();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Get the first workflow or create a default one
  const currentWorkflow = workflows.length > 0 ? workflows[0] : null;
  const workflowSteps = currentWorkflow?.steps || [];

  const iconMap: { [key: string]: any } = {
    Target,
    Mail,
    Calendar,
    MessageSquare,
    Share2
  };

  const getColorClasses = (color: string, status: string) => {
    const opacity = status === 'active' ? '' : 'opacity-60';
    const colors = {
      green: `bg-green-100 border-green-300 text-green-800 ${opacity}`,
      blue: `bg-blue-100 border-blue-300 text-blue-800 ${opacity}`,
      orange: `bg-orange-100 border-orange-300 text-orange-800 ${opacity}`,
      purple: `bg-purple-100 border-purple-300 text-purple-800 ${opacity}`,
      indigo: `bg-indigo-100 border-indigo-300 text-indigo-800 ${opacity}`
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;
    
    try {
      setIsExecuting(true);
      await executeWorkflow(currentWorkflow.id);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visual Workflow Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Visual Workflow Builder</span>
            {currentWorkflow && (
              <Badge variant="secondary">{currentWorkflow.name}</Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button 
              size="sm" 
              onClick={handleExecuteWorkflow}
              disabled={!currentWorkflow || isExecuting}
            >
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? 'Launching...' : 'Launch'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Workflow Canvas */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-96">
          {workflowSteps.length > 0 ? (
            <div className="space-y-4">
              {workflowSteps.map((step, index) => {
                const Icon = iconMap[step.icon] || Target;
                const isLast = index === workflowSteps.length - 1;
                
                return (
                  <div key={step.id} className="relative">
                    {/* Workflow Step */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getColorClasses(step.color, step.status)}`}
                      onClick={() => setSelectedWorkflow(step.id.toString())}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{step.title}</h4>
                            <Badge variant={step.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {step.type}
                            </Badge>
                          </div>
                          <p className="text-sm opacity-80 mt-1">{step.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {step.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Connection Arrow */}
                    {!isLast && (
                      <div className="flex justify-center my-2">
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="absolute w-2 h-2 bg-gray-400 rounded-full transform translate-y-2"></div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Step Button */}
              <div className="flex justify-center pt-4">
                <Button variant="outline" className="border-dashed border-2 border-gray-300 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Target className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Workflows Available</h3>
              <p className="text-sm text-center mb-4">Create your first workflow to get started with automation</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          )}
        </div>

        {/* Workflow Controls */}
        {currentWorkflow && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Performance Prediction</h4>
              <p className="text-sm text-blue-700 mt-1">Expected 34% conversion rate</p>
              <p className="text-xs text-blue-600 mt-1">Based on similar workflows</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900">AI Optimization</h4>
              <p className="text-sm text-green-700 mt-1">Timing optimized for your audience</p>
              <p className="text-xs text-green-600 mt-1">+23% expected improvement</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900">Cross-Channel Sync</h4>
              <p className="text-sm text-purple-700 mt-1">Coordinating with 3 channels</p>
              <p className="text-xs text-purple-600 mt-1">Email, Social, Content</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualWorkflowBuilder;
