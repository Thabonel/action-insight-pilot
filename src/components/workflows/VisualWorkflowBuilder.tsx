
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Workflow, WorkflowStep } from '@/lib/api-client-interface';

interface VisualWorkflowBuilderProps {
  workflow: Workflow | null;
  onSave: (workflow: Partial<Workflow>) => void;
  onExecute: (workflowId: string) => void;
}

const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({
  workflow,
  onSave,
  onExecute
}) => {
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<Workflow>>(
    workflow || {
      name: '',
      description: '',
      steps: [],
      status: 'draft'
    }
  );
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<Partial<WorkflowStep> | null>(null);
  const { toast } = useToast();

  const stepTypes = [
    { value: 'email', label: 'Send Email', color: 'bg-blue-500' },
    { value: 'sms', label: 'Send SMS', color: 'bg-green-500' },
    { value: 'wait', label: 'Wait/Delay', color: 'bg-yellow-500' },
    { value: 'condition', label: 'Condition', color: 'bg-purple-500' },
    { value: 'webhook', label: 'Webhook', color: 'bg-red-500' }
  ];

  const getStepColor = (type: string) => {
    const stepType = stepTypes.find(st => st.value === type);
    return stepType?.color || 'bg-gray-500';
  };

  const addStep = () => {
    setEditingStep({
      type: 'email',
      config: {},
      order: editingWorkflow.steps?.length || 0
    });
    setShowStepDialog(true);
  };

  const editStep = (step: WorkflowStep) => {
    setEditingStep(step);
    setShowStepDialog(true);
  };

  const saveStep = () => {
    if (!editingStep) return;

    const steps = [...(editingWorkflow.steps || [])];
    const existingIndex = steps.findIndex(s => s.id === editingStep.id);

    const stepToSave: WorkflowStep = {
      id: editingStep.id || `step-${Date.now()}`,
      type: editingStep.type || 'email',
      config: editingStep.config || {},
      order: editingStep.order || steps.length,
      title: editingStep.title,
      description: editingStep.description,
      status: editingStep.status || 'pending'
    };

    if (existingIndex >= 0) {
      steps[existingIndex] = stepToSave;
    } else {
      steps.push(stepToSave);
    }

    setEditingWorkflow({
      ...editingWorkflow,
      steps: steps.sort((a, b) => a.order - b.order)
    });

    setShowStepDialog(false);
    setEditingStep(null);
  };

  const deleteStep = (stepId: string) => {
    const steps = editingWorkflow.steps?.filter(s => s.id !== stepId) || [];
    setEditingWorkflow({
      ...editingWorkflow,
      steps: steps.map((step, index) => ({ ...step, order: index }))
    });
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const steps = [...(editingWorkflow.steps || [])];
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (stepIndex === -1) return;
    
    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    [steps[stepIndex], steps[newIndex]] = [steps[newIndex], steps[stepIndex]];
    
    setEditingWorkflow({
      ...editingWorkflow,
      steps: steps.map((step, index) => ({ ...step, order: index }))
    });
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    if (!editingWorkflow.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a workflow name",
        variant: "destructive",
      });
      return;
    }

    onSave(editingWorkflow);
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved successfully",
    });
  };

  const handleExecute = () => {
    if (!workflow?.id) return;
    
    if (workflow.status === 'active') {
      onExecute(workflow.id);
      toast({
        title: "Workflow Executed",
        description: "Your workflow is now running",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Input
                value={editingWorkflow.name || ''}
                onChange={(e) => setEditingWorkflow({
                  ...editingWorkflow,
                  name: e.target.value
                })}
                placeholder="Workflow Name"
                className="text-lg font-semibold border-none p-0 h-auto"
              />
              <Textarea
                value={editingWorkflow.description || ''}
                onChange={(e) => setEditingWorkflow({
                  ...editingWorkflow,
                  description: e.target.value
                })}
                placeholder="Workflow Description"
                className="border-none p-0 resize-none"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={editingWorkflow.status === 'active' ? 'default' : 'secondary'}>
                {editingWorkflow.status}
              </Badge>
              <Button onClick={handleSave}>
                Save
              </Button>
              {workflow?.id && editingWorkflow.status === 'active' && (
                <Button onClick={handleExecute}>
                  Execute
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow Steps</CardTitle>
            <Button onClick={addStep}>
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editingWorkflow.steps?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No steps added yet</div>
              <Button variant="outline" onClick={addStep}>
                Add First Step
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {editingWorkflow.steps?.map((step, index) => {
                return (
                  <div key={step.id} className="relative">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:border-blue-500 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStepColor(step.type)}`}>
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {step.title || stepTypes.find(st => st.value === step.type)?.label}
                          </h4>
                          {step.status && (
                            <Badge className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          )}
                        </div>
                        {step.description && (
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.id, 'up')}
                          disabled={index === 0}
                        >
                          Up
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.id, 'down')}
                          disabled={index === (editingWorkflow.steps?.length || 1) - 1}
                        >
                          Down
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editStep(step)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStep(step.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {index < (editingWorkflow.steps?.length || 1) - 1 && (
                      <div className="flex justify-center py-2">
                        <span className="text-gray-400">---</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Configuration Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStep?.id ? 'Edit Step' : 'Add Step'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="step-type">Step Type</Label>
              <Select
                value={editingStep?.type || 'email'}
                onValueChange={(value) => setEditingStep({
                  ...editingStep,
                  type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stepTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="step-title">Title (Optional)</Label>
              <Input
                id="step-title"
                value={editingStep?.title || ''}
                onChange={(e) => setEditingStep({
                  ...editingStep,
                  title: e.target.value
                })}
                placeholder="Custom step title"
              />
            </div>
            
            <div>
              <Label htmlFor="step-description">Description (Optional)</Label>
              <Textarea
                id="step-description"
                value={editingStep?.description || ''}
                onChange={(e) => setEditingStep({
                  ...editingStep,
                  description: e.target.value
                })}
                placeholder="Step description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveStep}>
                Save Step
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisualWorkflowBuilder;
