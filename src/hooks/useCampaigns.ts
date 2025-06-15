
import { useState, useEffect } from 'react'
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

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, description, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load campaigns'
      setError(errorMessage)
      console.error('Error loading campaigns:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  return {
    campaigns,
    isLoading,
    error,
    reload: loadCampaigns
  }
}
