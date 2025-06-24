
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface Campaign {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCampaigns = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Loading campaigns...')
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, description, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Campaigns loaded successfully:', data?.length || 0)
      setCampaigns(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load campaigns'
      console.error('Error loading campaigns:', err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  return {
    campaigns,
    isLoading,
    error,
    reload: loadCampaigns
  }
}
