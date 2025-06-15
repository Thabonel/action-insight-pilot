
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

interface WorkflowStatus {
  workflow_id: string;
  status: string;
  current_step: number;
  total_steps: number;
  started_at: string;
  estimated_completion: string;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getWorkflows();
      
      if (response.success && response.data) {
        setWorkflows(response.data);
      } else {
        throw new Error('Failed to fetch workflows');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workflows';
      setError(errorMessage);
      console.error('Workflows fetch error:', err);
      
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflowData: any) => {
    try {
      const response = await apiClient.createWorkflow(workflowData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Workflow created successfully",
        });
        await fetchWorkflows(); // Refresh list
        return response.data;
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await apiClient.executeWorkflow(workflowId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Workflow execution started",
        });
        return response.data;
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getWorkflowStatus = async (workflowId: string): Promise<WorkflowStatus | null> => {
    try {
      const response = await apiClient.getWorkflowStatus(workflowId);
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      return null;
    }
  };

  const updateWorkflow = async (workflowId: string, updates: any) => {
    try {
      const response = await apiClient.updateWorkflow(workflowId, updates);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Workflow updated successfully",
        });
        await fetchWorkflows(); // Refresh list
        return response.data;
      } else {
        throw new Error('Failed to update workflow');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const response = await apiClient.deleteWorkflow(workflowId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Workflow deleted successfully",
        });
        await fetchWorkflows(); // Refresh list
        return response.data;
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return {
    workflows,
    loading,
    error,
    fetchWorkflows,
    createWorkflow,
    executeWorkflow,
    getWorkflowStatus,
    updateWorkflow,
    deleteWorkflow
  };
};
