
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Campaign as ApiCampaign } from '@/lib/api-client-interface'

interface Campaign extends ApiCampaign {
  channel: string
  created_by: string
  start_date?: string
  end_date?: string
  target_audience?: Record<string, unknown>
  content?: Record<string, unknown>
  settings?: Record<string, unknown>
}

// Map database types to our interface types
const mapDatabaseTypeToInterface = (dbType: string): Campaign['type'] => {
  switch (dbType) {
    case 'social': return 'social_media'
    case 'partnership': return 'other'
    case 'content': return 'content'
    case 'paid_ads': return 'paid_ads'
    case 'seo': return 'seo'
    case 'email': return 'email'
    default: return 'other'
  }
}

// Map database status to our interface status
const mapDatabaseStatusToInterface = (dbStatus: string): Campaign['status'] => {
  switch (dbStatus) {
    case 'active': return 'active'
    case 'draft': return 'draft'
    case 'paused': return 'paused'
    case 'completed': return 'completed'
    case 'archived': return 'archived'
    case 'scheduled': return 'scheduled'
    default: return 'draft'
  }
}

// Map our interface types to database types
const mapInterfaceTypeToDatabase = (interfaceType: Campaign['type']): string => {
  switch (interfaceType) {
    case 'social_media': return 'social'
    case 'content': return 'content'
    case 'paid_ads': return 'paid_ads'
    case 'seo': return 'seo'  
    case 'email': return 'email'
    default: return 'other'
  }
}

// Helper function to safely parse metrics from database Json type
const parseMetrics = (metrics: unknown): Campaign['metrics'] => {
  if (!metrics) return undefined
  
  if (typeof metrics === 'string') {
    try {
      const parsed = JSON.parse(metrics)
      return parsed && typeof parsed === 'object' ? parsed : undefined
    } catch {
      return undefined
    }
  }
  
  if (typeof metrics === 'object' && metrics !== null) {
    return metrics
  }
  
  return undefined
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
      
      // Map database data to our interface with proper type conversion
      const mappedCampaigns: Campaign[] = (data || []).map(campaign => ({
        ...campaign,
        type: mapDatabaseTypeToInterface(campaign.type),
        status: mapDatabaseStatusToInterface(campaign.status),
        metrics: parseMetrics(campaign.metrics),
        // Properly parse demographics JSON field
        demographics: typeof campaign.demographics === 'object' && campaign.demographics !== null
          ? campaign.demographics as Record<string, unknown>
          : {},
        // Properly parse other JSONB fields
        kpi_targets: typeof campaign.kpi_targets === 'object' && campaign.kpi_targets !== null
          ? campaign.kpi_targets as Record<string, unknown>
          : {},
        budget_breakdown: typeof campaign.budget_breakdown === 'object' && campaign.budget_breakdown !== null
          ? campaign.budget_breakdown as Record<string, unknown>
          : {},
        channels: Array.isArray(campaign.channels) ? campaign.channels.map(c => String(c)) : [],
        content: typeof campaign.content === 'object' && campaign.content !== null
          ? campaign.content as Record<string, unknown>
          : {},
        settings: typeof campaign.settings === 'object' && campaign.settings !== null
          ? campaign.settings as Record<string, unknown>
          : {},
        compliance_checklist: typeof campaign.compliance_checklist === 'object' && campaign.compliance_checklist !== null
          ? campaign.compliance_checklist as Record<string, unknown>
          : {},
        // Ensure all required fields are present
        created_at: campaign.created_at || new Date().toISOString(),
        updated_at: campaign.updated_at || new Date().toISOString(),
        created_by: campaign.created_by || '',
        channel: campaign.channel || 'general'
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
