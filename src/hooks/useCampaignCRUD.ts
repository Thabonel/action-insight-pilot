
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Campaign, mapInterfaceTypeToDatabase } from './useCampaigns';

export const useCampaignCRUD = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    setIsLoading(true);
    try {
      // Prepare updates for database
      const dbUpdates: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Map interface type to database type if type is being updated
      if (updates.type) {
        dbUpdates.type = mapInterfaceTypeToDatabase(updates.type);
      }

      const { data, error } = await supabase
        .from('campaigns')
        .update(dbUpdates)
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
    type: Campaign['type'];
    channel: string;
    status?: Campaign['status'];
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

      // Prepare data for database with proper type casting
      const dbData = {
        ...campaignData,
        type: mapInterfaceTypeToDatabase(campaignData.type) as 'email' | 'content' | 'paid_ads' | 'social' | 'partnership',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert([dbData])
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
