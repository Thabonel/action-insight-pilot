
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Campaign as ApiCampaign } from '@/lib/api-client-interface'

interface Campaign extends ApiCampaign {
  channel: string
  created_by: string
  start_date?: string
  end_date?: string
  target_audience?: any
  content?: any
  settings?: any
}

// Map database types to our interface types
const mapDatabaseTypeToInterface = (dbType: string): Campaign['type'] => {
  switch (dbType) {
    case 'social': return 'social_media'
    case 'partnership': return 'other'
    default: return dbType as Campaign['type']
  }
}

// Map our interface types to database types
const mapInterfaceTypeToDatabase = (interfaceType: Campaign['type']): string => {
  switch (interfaceType) {
    case 'social_media': return 'social'
    case 'seo': return 'other'
    default: return interfaceType || 'other'
  }
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
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Campaigns loaded successfully:', data?.length || 0)
      
      // Map database data to our interface
      const mappedCampaigns = (data || []).map(campaign => ({
        ...campaign,
        type: mapDatabaseTypeToInterface(campaign.type) || 'other'
      }))
      
      setCampaigns(mappedCampaigns)
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
    reload: loadCampaigns,
    mapInterfaceTypeToDatabase
  }
}

export type { Campaign }
export { mapDatabaseTypeToInterface, mapInterfaceTypeToDatabase }
