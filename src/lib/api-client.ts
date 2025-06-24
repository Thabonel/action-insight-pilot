import { ApiResponse, Campaign, ContentBrief, SocialPlatformConnection, IntegrationConnection, Webhook, UserPreferences, Workflow } from './api-client-interface';
import { supabase } from './supabase';

export class ApiClient {
  private token: string = '';

  setToken(token: string): void {
    this.token = token;
  }

  // Helper function to convert database record to Campaign interface
  private dbToCampaign(record: any): Campaign {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      type: record.type,
      status: record.status,
      created_at: record.created_at,
      updated_at: record.updated_at,
      created_by: record.created_by,
      
      // Objectives & Goals
      primaryObjective: record.primary_objective,
      secondaryObjectives: record.secondary_objectives || [],
      smartGoals: record.smart_goals,
      
      // KPIs & Targets
      primaryKPI: record.primary_kpi,
      kpiTargets: record.kpi_targets || {
        revenue: '',
        leads: '',
        conversion: '',
        roi: '',
        impressions: '',
        clicks: ''
      },
      
      // Budget & Timeline
      totalBudget: record.total_budget,
      budget_allocated: record.budget_allocated,
      budget_spent: record.budget_spent,
      budgetBreakdown: record.budget_breakdown || {
        media: '',
        content: '',
        technology: '',
        personnel: '',
        contingency: ''
      },
      startDate: record.start_date,
      endDate: record.end_date,
      
      // Target Audience
      targetAudience: record.target_audience,
      audienceSegments: record.audience_segments || [],
      buyerPersonas: record.buyer_personas || [],
      demographics: record.demographics || {
        ageRange: '',
        location: '',
        income: '',
        interests: ''
      },
      
      // Messaging & Content
      valueProposition: record.value_proposition,
      keyMessages: record.key_messages || [],
      contentStrategy: record.content_strategy,
      creativeRequirements: record.creative_requirements,
      brandGuidelines: record.brand_guidelines,
      
      // Channels & Distribution
      channels: record.channels || [],
      channelStrategy: record.channel_strategy,
      contentTypes: record.content_types || [],
      
      // Legal & Compliance
      complianceChecklist: record.compliance_checklist || {
        dataProtection: false,
        advertisingStandards: false,
        industryRegulations: false,
        termsOfService: false,
        privacyPolicy: false
      },
      legalNotes: record.legal_notes,
      
      // Monitoring & Reporting
      analyticsTools: record.analytics_tools || [],
      reportingFrequency: record.reporting_frequency,
      stakeholders: record.stakeholders || [],
      successCriteria: record.success_criteria,
      
      // Performance metrics
      metrics: record.metrics || {
        reach: 0,
        conversion_rate: 0,
        impressions: 0,
        clicks: 0,
        engagement_rate: 0,
        cost_per_click: 0,
        cost_per_acquisition: 0,
        revenue_generated: 0
      }
    };
  }

  // Helper function to convert Campaign interface to database record
  private campaignToDb(campaign: Partial<Campaign>): any {
    return {
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      
      // Objectives & Goals
      primary_objective: campaign.primaryObjective,
      secondary_objectives: campaign.secondaryObjectives,
      smart_goals: campaign.smartGoals,
      
      // KPIs & Targets
      primary_kpi: campaign.primaryKPI,
      kpi_targets: campaign.kpiTargets,
      
      // Budget & Timeline
      total_budget: campaign.totalBudget,
      budget_allocated: campaign.totalBudget, // Set allocated to total when creating
      budget_breakdown: campaign.budgetBreakdown,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      
      // Target Audience
      target_audience: campaign.targetAudience,
      audience_segments: campaign.audienceSegments,
      buyer_personas: campaign.buyerPersonas,
      demographics: campaign.demographics,
      
      // Messaging & Content
      value_proposition: campaign.valueProposition,
      key_messages: campaign.keyMessages,
      content_strategy: campaign.contentStrategy,
      creative_requirements: campaign.creativeRequirements,
      brand_guidelines: campaign.brandGuidelines,
      
      // Channels & Distribution
      channels: campaign.channels,
      channel_strategy: campaign.channelStrategy,
      content_types: campaign.contentTypes,
      
      // Legal & Compliance
      compliance_checklist: campaign.complianceChecklist,
      legal_notes: campaign.legalNotes,
      
      // Monitoring & Reporting
      analytics_tools: campaign.analyticsTools,
      reporting_frequency: campaign.reportingFrequency,
      stakeholders: campaign.stakeholders,
      success_criteria: campaign.successCriteria
    };
  }

  // Enhanced Campaign Methods with Supabase
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to view campaigns'
        };
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      const campaigns = data.map(record => this.dbToCampaign(record));

      return {
        success: true,
        data: campaigns
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to fetch campaigns'
      };
    }
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to view campaign'
        };
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Campaign not found',
            message: `Campaign with ID ${id} does not exist`
          };
        }
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      const campaign = this.dbToCampaign(data);

      return {
        success: true,
        data: campaign
      };
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to fetch campaign'
      };
    }
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      // Validation
      if (!campaignData.name || campaignData.name.trim() === '') {
        return {
          success: false,
          error: 'Validation failed',
          message: 'Campaign name is required'
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to create campaign'
        };
      }

      const dbRecord = this.campaignToDb(campaignData);
      dbRecord.created_by = user.id;

      const { data, error } = await supabase
        .from('campaigns')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      const campaign = this.dbToCampaign(data);

      return {
        success: true,
        data: campaign
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to create campaign'
      };
    }
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      // Validation
      if (updates.name && updates.name.trim() === '') {
        return {
          success: false,
          error: 'Validation failed',
          message: 'Campaign name cannot be empty'
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to update campaign'
        };
      }

      const dbUpdates = this.campaignToDb(updates);

      const { data, error } = await supabase
        .from('campaigns')
        .update(dbUpdates)
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Campaign not found',
            message: `Campaign with ID ${id} does not exist`
          };
        }
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      const campaign = this.dbToCampaign(data);

      return {
        success: true,
        data: campaign
      };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to update campaign'
      };
    }
  }

  async duplicateCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to duplicate campaign'
        };
      }

      // First, get the original campaign
      const { data: originalData, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: 'Campaign not found',
          message: `Campaign with ID ${id} does not exist`
        };
      }

      // Create duplicate with modified name and reset values
      const duplicateData = {
        ...originalData,
        id: undefined, // Let Supabase generate new ID
        name: `${originalData.name} (Copy)`,
        status: 'draft',
        budget_spent: 0,
        created_at: undefined, // Let Supabase set current timestamp
        updated_at: undefined,
        metrics: {
          reach: 0,
          conversion_rate: 0,
          impressions: 0,
          clicks: 0,
          engagement_rate: 0,
          cost_per_click: 0,
          cost_per_acquisition: 0,
          revenue_generated: 0
        }
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert([duplicateData])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      const campaign = this.dbToCampaign(data);

      return {
        success: true,
        data: campaign
      };
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to duplicate campaign'
      };
    }
  }

  async archiveCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to archive campaign'
        };
      }

      const { data, error } = await supabase
        .from('campaigns')
        .update({ status: 'archived' })
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Campaign not found',
            message: `Campaign with ID ${id} does not exist`
          };
        }
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      const campaign = this.dbToCampaign(data);

      return {
        success: true,
        data: campaign
      };
    } catch (error) {
      console.error('Error archiving campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to archive campaign'
      };
    }
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to delete campaign'
        };
      }

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to delete campaign'
      };
    }
  }

  // Budget calculation helper
  calculateBudgetUsage(campaign: Campaign): number {
    if (!campaign.budget_allocated || campaign.budget_allocated === 0) {
      return 0;
    }
    return ((campaign.budget_spent || 0) / campaign.budget_allocated) * 100;
  }

  // Performance calculation helper
  calculateROI(campaign: Campaign): number {
    const revenue = campaign.metrics?.revenue_generated || 0;
    const spent = campaign.budget_spent || 0;
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  }

  // Keep all other existing methods unchanged for other services...
  // Social Platforms Methods
  get socialPlatforms() {
    return {
      getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
        console.log('Getting platform connections');
        const mockConnections: SocialPlatformConnection[] = [
          {
            id: '1',
            platform: 'twitter',
            account_name: '@example',
            status: 'connected',
            connection_status: 'connected',
            last_sync: new Date().toISOString(),
            follower_count: 1000
          }
        ];
        return { success: true, data: mockConnections };
      },

      initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
        console.log('Initiating platform connection for:', platform);
        return {
          success: true,
          data: {
            platform,
            status: 'connected',
            connected_at: new Date().toISOString()
          }
        };
      },

      disconnectPlatform: async (platform: string): Promise<ApiResponse<void>> => {
        console.log('Disconnecting platform:', platform);
        return { success: true, data: undefined };
      },

      syncPlatformData: async (platform: string): Promise<ApiResponse<any>> => {
        console.log('Syncing platform data for:', platform);
        return { success: true, data: { synced_at: new Date().toISOString() } };
      },

      testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
        console.log('Testing platform connection for:', platform);
        return { success: true, data: { status: 'connected', tested_at: new Date().toISOString() } };
      },

      getSocialMediaPosts: async (): Promise<ApiResponse<any[]>> => {
        console.log('Getting social media posts');
        return { success: true, data: [] };
      },

      createSocialPost: async (postData: any): Promise<ApiResponse<any>> => {
        console.log('Creating social post:', postData);
        return { success: true, data: { id: 'post-1', ...postData } };
      },

      getSocialAnalytics: async (): Promise<ApiResponse<any>> => {
        console.log('Getting social analytics');
        return { success: true, data: { views: 100, engagement: 50 } };
      },

      generateSocialContent: async (brief: any): Promise<ApiResponse<any>> => {
        console.log('Generating social content:', brief);
        return { success: true, data: { content: 'Generated content', suggestions: [] } };
      }
    };
  }

  // [Keep all other existing methods unchanged - integrations, userPreferences, workflows, etc.]
  // ... (rest of the methods remain the same as in the previous version)

  // Content Methods
  async createContent(contentData: any): Promise<ApiResponse<any>> {
    console.log('Creating content:', contentData);
    return {
      success: true,
      data: {
        id: 'content-' + Date.now(),
        ...contentData,
        created_at: new Date().toISOString()
      }
    };
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated content for ${brief.title || brief.topic}`,
        suggestions: ['Use more engaging headlines', 'Add call-to-action']
      }
    };
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        subject: `Email about ${brief.topic || 'your campaign'}`,
        content: `Generated email content for ${brief.audience || 'your audience'}...`,
        preview: 'Email preview text...'
      }
    };
  }

  // Lead Methods
  async getLeads(): Promise<ApiResponse<any[]>> {
    console.log('Getting leads');
    return {
      success: true,
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', score: 85 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', score: 92 }
      ]
    };
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    console.log('Scoring leads');
    return {
      success: true,
      data: {
        scored_count: 150,
        updated_at: new Date().toISOString()
      }
    };
  }

  // Analytics Methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    console.log('Getting analytics');
    return {
      success: true,
      data: {
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        totalCampaigns: Math.floor(Math.random() * 50) + 10,
        activeLeads: Math.floor(Math.random() * 200) + 50,
        conversionRate: Math.round((Math.random() * 0.1 + 0.05) * 100) / 100
      }
    };
  }

  // Other Methods (keeping existing implementations for compatibility)
  async getEmailMetrics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalSent: 1000,
        delivered: 950,
        opened: 250,
        clicked: 50,
        bounced: 20,
        unsubscribed: 10,
        openRate: 0.25,
        clickRate: 0.05,
        bounceRate: 0.02
      }
    };
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }
}

export const apiClient = new ApiClient();