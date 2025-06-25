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
      status: record.status || 'draft',
      created_at: record.created_at,
      updated_at: record.updated_at,
      created_by: record.created_by,
      
      // Basic fields that exist in your database
      primaryObjective: record.primary_objective || '',
      totalBudget: record.total_budget || 0,
      budget_allocated: record.budget_allocated || 0,
      budget_spent: record.budget_spent || 0,
      startDate: record.start_date,
      endDate: record.end_date,
      targetAudience: record.target_audience || '',
      channels: record.channels || [],
      
      // JSONB fields with defaults
      demographics: record.demographics || {
        ageRange: '',
        location: '',
        income: '',
        interests: ''
      },
      kpiTargets: record.kpi_targets || {
        revenue: '',
        leads: '',
        conversion: '',
        roi: '',
        impressions: '',
        clicks: ''
      },
      budgetBreakdown: record.budget_breakdown || {
        media: '',
        content: '',
        technology: '',
        personnel: '',
        contingency: ''
      },
      complianceChecklist: record.compliance_checklist || {
        dataProtection: false,
        advertisingStandards: false,
        industryRegulations: false,
        termsOfService: false,
        privacyPolicy: false
      },
      
      // Extract from content JSONB field
      valueProposition: record.content?.valueProposition || '',
      keyMessages: record.content?.keyMessages || [],
      contentStrategy: record.content?.contentStrategy || '',
      creativeRequirements: record.content?.creativeRequirements || '',
      brandGuidelines: record.content?.brandGuidelines || '',
      
      // Extract from settings JSONB field
      secondaryObjectives: record.settings?.secondaryObjectives || [],
      smartGoals: record.settings?.smartGoals || '',
      primaryKPI: record.settings?.primaryKPI || '',
      audienceSegments: record.settings?.audienceSegments || [],
      buyerPersonas: record.settings?.buyerPersonas || [],
      channelStrategy: record.settings?.channelStrategy || '',
      contentTypes: record.settings?.contentTypes || [],
      legalNotes: record.settings?.legalNotes || '',
      analyticsTools: record.settings?.analyticsTools || [],
      reportingFrequency: record.settings?.reportingFrequency || '',
      stakeholders: record.settings?.stakeholders || [],
      successCriteria: record.settings?.successCriteria || '',
      
      // Performance metrics from existing metrics JSONB
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
  private campaignToDb(campaign: any): any {
    return {
      // Required fields
      name: campaign.name,
      type: campaign.type,
      channel: campaign.channel || campaign.type || 'email', // Required field
      
      // Optional text fields
      description: campaign.description || null,
      target_audience: campaign.target_audience || null, // Note: snake_case
      status: campaign.status || 'draft',
      
      // Budget fields
      total_budget: campaign.total_budget || 0,
      budget_allocated: campaign.budget_allocated || 0,
      budget_spent: campaign.budget_spent || 0,
      
      // Dates - proper null handling for timestamps
      start_date: campaign.start_date || null,
      end_date: campaign.end_date || null,
      
      // Text fields
      primary_objective: campaign.primary_objective || null,
      
      // JSONB fields - always provide objects, never undefined
      channels: campaign.channels || [],
      demographics: campaign.demographics || {},
      kpi_targets: campaign.kpi_targets || {},
      budget_breakdown: campaign.budget_breakdown || {},
      compliance_checklist: campaign.compliance_checklist || {},
      content: campaign.content || {},
      settings: campaign.settings || {},
      metrics: campaign.metrics || {}
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

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
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

      console.log('Sending to database:', dbRecord);

      const { data, error } = await supabase
        .from('campaigns')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('Database insertion error:', error);
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

  // AI Chat Methods
  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to use AI chat'
        };
      }

      const { data, error } = await supabase.functions.invoke('chat-agent', {
        body: {
          query,
          context,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          success: false,
          error: 'AI service error',
          message: error.message || 'Failed to get AI response'
        };
      }

      return {
        success: true,
        data: {
          message: data.response || data.message,
          suggestions: data.suggestions || [],
          followUp: data.followUp || []
        }
      };
    } catch (error) {
      console.error('Error calling AI agent:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to connect to AI service'
      };
    }
  }

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

  // User Preferences methods
  async getUserPreferences(category?: string): Promise<ApiResponse<UserPreferences>> {
    let query = supabase.from('user_preferences').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || {} };
  }

  async updateUserPreferences(category: string, preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        category,
        preference_data: preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || {} };
  }

  // Integration methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  async createConnection(connection: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> {
    const { data, error } = await supabase
      .from('integration_connections')
      .insert(connection)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: { id: '1', name: 'Mock Workflow', ...workflow } as Workflow
    };
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: { id, name: 'Updated Workflow', ...workflow } as Workflow
    };
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return { success: true, data: undefined };
  }

  async executeWorkflow(id: string, data?: any): Promise<ApiResponse<any>> {
    return { success: true, data: { executed: true } };
  }

  // Social media methods
  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id: '1', status: 'scheduled', ...postData }
    };
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    const { data, error } = await supabase
      .from('social_platform_connections')
      .select('*');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  async connectSocialPlatform(platform: Partial<SocialPlatformConnection>): Promise<ApiResponse<SocialPlatformConnection>> {
    const { data, error } = await supabase
      .from('social_platform_connections')
      .insert(platform)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  // Chat/Agent methods
  async callGeneralCampaignAgent(message: string, context?: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        response: "This is a mock response from the campaign agent",
        suggestions: ["Suggestion 1", "Suggestion 2"],
        context
      }
    };
  }

  // Expose properties for backward compatibility
  get userPreferences() {
    return {
      get: (category?: string) => this.getUserPreferences(category),
      update: (category: string, prefs: Partial<UserPreferences>) => this.updateUserPreferences(category, prefs),
      getUserPreferences: (category?: string) => this.getUserPreferences(category),
      updateUserPreferences: (category: string, prefs: Partial<UserPreferences>) => this.updateUserPreferences(category, prefs)
    };
  }

  get integrations() {
    return {
      getConnections: () => this.getConnections(),
      createConnection: (conn: Partial<IntegrationConnection>) => this.createConnection(conn),
      deleteConnection: (id: string) => this.deleteConnection(id),
      getWebhooks: () => Promise.resolve({ success: true, data: [] }),
      connectService: (service: string, apiKey?: string) => this.createConnection({ service_name: service }),
      syncService: (id: string) => Promise.resolve({ success: true, data: { synced_at: new Date().toISOString() } }),
      disconnectService: (id: string) => this.deleteConnection(id),
      createWebhook: (webhook: any) => Promise.resolve({ success: true, data: { id: '1', ...webhook } }),
      deleteWebhook: (id: string) => Promise.resolve({ success: true, data: undefined }),
      testWebhook: (id: string) => Promise.resolve({ success: true, data: { status: 'ok' } })
    };
  }

  get workflows() {
    return {
      getAll: () => this.getWorkflows(),
      create: (workflow: Partial<Workflow>) => this.createWorkflow(workflow),
      update: (id: string, workflow: Partial<Workflow>) => this.updateWorkflow(id, workflow),
      delete: (id: string) => this.deleteWorkflow(id),
      execute: (id: string, data?: any) => this.executeWorkflow(id, data)
    };
  }

  get socialPlatforms() {
    return {
      getAll: () => this.getSocialPlatforms(),
      connect: (platform: Partial<SocialPlatformConnection>) => this.connectSocialPlatform(platform),
      getSocialPlatforms: () => this.getSocialPlatforms(),
      connectSocialPlatform: (platform: Partial<SocialPlatformConnection>) => this.connectSocialPlatform(platform),
      getPlatformConnections: () => this.getSocialPlatforms(),
      initiatePlatformConnection: (platform: string) => this.connectSocialPlatform({ platform: platform }),
      disconnectPlatform: (platform: string) => Promise.resolve({ success: true, data: undefined }),
      syncPlatformData: (platform: string) => Promise.resolve({ success: true, data: { synced_at: new Date().toISOString() } }),
      testPlatformConnection: (platform: string) => Promise.resolve({ success: true, data: { status: 'connected' } }),
      getSocialMediaPosts: () => Promise.resolve({ success: true, data: [] }),
      createSocialPost: (postData: any) => this.scheduleSocialPost(postData),
      getSocialAnalytics: () => Promise.resolve({ success: true, data: { followers: 100, engagement: 5.2 } }),
      generateSocialContent: (brief: any) => Promise.resolve({ success: true, data: { content: 'Generated content', hashtags: [] } })
    };
  }
}

export const apiClient = new ApiClient();