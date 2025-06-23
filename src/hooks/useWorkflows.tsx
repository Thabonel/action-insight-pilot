
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient, Workflow } from '@/lib/api-client';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const result = await apiClient.workflows.getAll();
      
      if (result.success && result.data) {
        setWorkflows(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch workflows');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (name: string, description?: string) => {
    try {
      const result = await apiClient.workflows.create(name, description);
      
      if (result.success && result.data) {
        setWorkflows(prev => [...prev, result.data!]);
        toast({
          title: "Workflow Created",
          description: "New workflow has been created successfully",
        });
        return result.data;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create workflow",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkflow = async (id: string, data: Partial<Workflow>) => {
    try {
      const result = await apiClient.workflows.update(id, data);
      
      if (result.success && result.data) {
        setWorkflows(prev => prev.map(w => w.id === id ? result.data! : w));
        toast({
          title: "Workflow Updated",
          description: "Workflow has been updated successfully",
        });
        return result.data;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update workflow",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const result = await apiClient.workflows.delete(id);
      
      if (result.success) {
        setWorkflows(prev => prev.filter(w => w.id !== id));
        toast({
          title: "Workflow Deleted",
          description: "Workflow has been deleted successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete workflow",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const executeWorkflow = async (id: string) => {
    try {
      const result = await apiClient.workflows.execute(id);
      
      if (result.success) {
        toast({
          title: "Workflow Executed",
          description: "Workflow has been executed successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to execute workflow",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
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
