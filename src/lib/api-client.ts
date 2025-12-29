import { ApiResponse, Campaign, ContentBrief, SocialPlatformConnection, IntegrationConnection, Webhook, UserPreferences, Workflow, ResearchNote } from './api-client-interface';
import { supabase } from './supabase';

export class ApiClient {
  private renderBackendUrl: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No valid authentication token found');
    }
    return session.access_token;
  }

  // Legacy method for backward compatibility - now gets token from Supabase
  setToken(token: string): void {
    // This method is now deprecated - tokens are automatically retrieved from Supabase
    console.warn('setToken is deprecated. Tokens are now automatically retrieved from Supabase auth.');
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
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Campaign not found',
          message: `Campaign with ID ${id} does not exist or you don't have access to it`
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
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Campaign not found',
          message: `Campaign with ID ${id} does not exist or you don't have access to it`
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
        .maybeSingle();

      if (fetchError) {
        return {
          success: false,
          error: 'Database error',
          message: fetchError.message
        };
      }

      if (!originalData) {
        return {
          success: false,
          error: 'Campaign not found',
          message: `Campaign with ID ${id} does not exist or you don't have access to it`
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
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Campaign not found',
          message: `Campaign with ID ${id} does not exist or you don't have access to it`
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

  // Campaign Control Methods
  async launchCampaign(id: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.renderBackendUrl}/api/campaigns/${id}/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Launch failed',
          message: result.error || 'Failed to launch campaign'
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message || 'Campaign launched successfully'
      };
    } catch (error) {
      console.error('Error launching campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to launch campaign'
      };
    }
  }

  async pauseCampaign(id: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.renderBackendUrl}/api/campaigns/${id}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Pause failed',
          message: result.error || 'Failed to pause campaign'
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message || 'Campaign paused successfully'
      };
    } catch (error) {
      console.error('Error pausing campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to pause campaign'
      };
    }
  }

  async resumeCampaign(id: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.renderBackendUrl}/api/campaigns/${id}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Resume failed',
          message: result.error || 'Failed to resume campaign'
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message || 'Campaign resumed successfully'
      };
    } catch (error) {
      console.error('Error resuming campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to resume campaign'
      };
    }
  }

  async stopCampaign(id: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.renderBackendUrl}/api/campaigns/${id}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Stop failed',
          message: result.error || 'Failed to stop campaign'
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message || 'Campaign stopped successfully'
      };
    } catch (error) {
      console.error('Error stopping campaign:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to stop campaign'
      };
    }
  }

  async createCampaignFromAI(parsedCampaignData: any): Promise<ApiResponse<Campaign>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User must be logged in to create campaign'
        };
      }

      const dbRecord = this.campaignToDb(parsedCampaignData);
      dbRecord.created_by = user.id;

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
      console.error('Error creating campaign from AI:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: 'Failed to create campaign from AI'
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

  // Dashboard AI Chat via Lovable AI
  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    try {
      console.log('Calling dashboard chat with query:', query);

      const { data, error } = await supabase.functions.invoke('dashboard-chat', {
        body: {
          query,
          context,
          conversationId: context?.conversationId || null
        }
      });

      if (error) {
        console.error('Dashboard chat error:', error);
        
        // Handle specific error types
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          return {
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please wait a moment and try again.'
          };
        }
        
        if (error.message?.includes('credits') || error.message?.includes('402')) {
          return {
            success: false,
            error: 'Credits exhausted',
            message: 'AI credits exhausted. Please add credits to continue.'
          };
        }
        
        throw error;
      }

      const aiResponse = data?.message || 'I apologize, but I could not generate a response at this time.';

      console.log('Dashboard chat response received successfully');

      // Generate relevant suggestions based on query
      const suggestions = this.generateSuggestions(query);

      return {
        success: true,
        data: {
          message: aiResponse,
          suggestions,
          followUp: [
            "Would you like me to elaborate on any specific point?",
            "Should I help you create a detailed plan for this?",
            "Do you need specific examples or templates?"
          ]
        }
      };
    } catch (error) {
      console.error('Error calling dashboard chat:', error);
      return {
        success: false,
        error: 'AI service error',
        message: error instanceof Error ? error.message : 'Failed to connect to AI service'
      };
    }
  }

  // Helper method to generate relevant suggestions
  private generateSuggestions(query: string): string[] {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('campaign')) {
      return [
        "How can I improve my campaign ROI?",
        "What are the best practices for campaign targeting?",
        "Show me campaign performance metrics",
        "Help me optimize my campaign budget"
      ];
    }

    if (queryLower.includes('email')) {
      return [
        "How can I improve my email open rates?",
        "What subject lines work best?",
        "Help me create an email sequence",
        "Show me email automation workflows"
      ];
    }

    if (queryLower.includes('content')) {
      return [
        "Generate content ideas for my industry",
        "Help me create a content calendar",
        "What content performs best on social media?",
        "Show me content optimization tips"
      ];
    }

    if (queryLower.includes('lead')) {
      return [
        "How can I improve lead quality?",
        "What's the best lead scoring strategy?",
        "Help me create lead nurturing campaigns",
        "Show me lead conversion tactics"
      ];
    }

    if (queryLower.includes('social')) {
      return [
        "What's the best posting schedule?",
        "Help me create engaging social content",
        "How can I increase social engagement?",
        "Show me social media analytics"
      ];
    }

    // Default suggestions
    return [
      "Tell me more about marketing automation",
      "How can I improve my overall marketing performance?",
      "What metrics should I be tracking?",
      "Help me create a marketing strategy"
    ];
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

  async getContentCalendar(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('content_calendar')
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

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Failed to fetch content calendar'
      };
    }
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

  // Research notes
  async getResearchNotes(conversationId?: string): Promise<ApiResponse<ResearchNote[]>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }
    let query = supabase.from('research_notes').select('*');
    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as ResearchNote[] };
  }

  async createResearchNote(note: { conversation_id: string; content: string; source_refs?: string }): Promise<ApiResponse<ResearchNote>> {
    const { data, error } = await supabase
      .from('research_notes')
      .insert({
        conversation_id: note.conversation_id,
        content: note.content,
        source_refs: note.source_refs || null
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ResearchNote };
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

  get research() {
    return {
      list: (conversationId?: string) => this.getResearchNotes(conversationId),
      create: (note: { conversation_id: string; content: string; source_refs?: string }) => this.createResearchNote(note)
    };
  }
}

export const apiClient = new ApiClient();