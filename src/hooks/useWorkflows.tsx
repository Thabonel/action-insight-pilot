
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Workflow, ApiResponse } from '@/lib/api-client-interface';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const workflowMethods = apiClient.workflows;
      const result = await workflowMethods.getAll() as ApiResponse<Workflow[]>;
      
      if (result.success && result.data) {
        setWorkflows(result.data);
      } else {
        setError('Failed to fetch workflows');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflow: Partial<Workflow>) => {
    try {
      setLoading(true);
      const workflowMethods = apiClient.workflows;
      const result = await workflowMethods.create(workflow) as ApiResponse<Workflow>;
      
      if (result.success && result.data) {
        setWorkflows(prev => [...prev, result.data!]);
        return { success: true, data: result.data };
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflow = async (id: string, workflow: Partial<Workflow>) => {
    try {
      setLoading(true);
      const workflowMethods = apiClient.workflows;
      const result = await workflowMethods.update(id, workflow) as ApiResponse<Workflow>;
      
      if (result.success && result.data) {
        setWorkflows(prev => prev.map(w => w.id === id ? result.data! : w));
        return { success: true, data: result.data };
      } else {
        throw new Error('Failed to update workflow');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      setLoading(true);
      const workflowMethods = apiClient.workflows;
      const result = await workflowMethods.delete(id) as ApiResponse<void>;
      
      if (result.success) {
        setWorkflows(prev => prev.filter(w => w.id !== id));
        return { success: true };
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (id: string, input?: Record<string, unknown>) => {
    try {
      setLoading(true);
      const workflowMethods = apiClient.workflows;
      const result = await workflowMethods.execute(id, input) as ApiResponse<Record<string, unknown>>;
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return {
    workflows,
    loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    refetch: fetchWorkflows
  };
};
