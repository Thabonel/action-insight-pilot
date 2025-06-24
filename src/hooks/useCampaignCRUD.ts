
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
  type?: 'social_media' | 'email' | 'content' | 'paid_ads' | 'seo' | 'other';
  budget_allocated?: number;
  budget_spent?: number;
  metrics?: any;
  channel: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  content?: any;
  settings?: any;
}

export const useCampaignCRUD = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const archiveCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'archived' });
  };

  const createCampaign = async (campaignData: {
    name: string;
    description?: string;
    type: 'social_media' | 'email' | 'content' | 'paid_ads' | 'seo' | 'other';
    channel: string;
    status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
    budget_allocated?: number;
    start_date?: string;
    end_date?: string;
    target_audience?: any;
    content?: any;
    settings?: any;
    metrics?: any;
  }) => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          ...campaignData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCampaign,
    deleteCampaign,
    archiveCampaign,
    createCampaign,
    isLoading
  };
};
