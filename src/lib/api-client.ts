import { ApiResponse, Campaign, ContentBrief, SocialPlatformConnection, IntegrationConnection, Webhook, UserPreferences, Workflow } from './api-client-interface';

export class ApiClient {
  private token: string = '';
  private mockCampaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Email Campaign',
      description: 'Comprehensive email marketing campaign for summer product launch',
      type: 'email',
      status: 'active',
      created_at: '2024-06-01T10:00:00Z',
      updated_at: '2024-06-20T15:30:00Z',
      created_by: 'user@example.com',
      primaryObjective: 'lead_generation',
      secondaryObjectives: ['Increase brand awareness', 'Drive website traffic'],
      totalBudget: 50000,
      budget_allocated: 50000,
      budget_spent: 15000,
      budgetBreakdown: {
        media: '25000',
        content: '10000',
        technology: '5000',
        personnel: '8000',
        contingency: '2000'
      },
      startDate: '2024-06-15',
      endDate: '2024-08-15',
      channels: ['Email Marketing', 'Social Media', 'Paid Search'],
      contentTypes: ['Email Newsletters', 'Blog Posts', 'Social Posts'],
      metrics: {
        reach: 25000,
        conversion_rate: 3.8,
        impressions: 120000,
        clicks: 4500
      }
    },
    {
      id: '2',
      name: 'test',
      description: 'Test campaign for development',
      type: 'Email',
      status: 'draft',
      created_at: '2024-06-23T00:00:00Z',
      updated_at: '2024-06-23T00:00:00Z',
      created_by: '9eb79e1b-54c0-4893-bd36-501b09c6b30d',
      budget_allocated: 0,
      budget_spent: 0,
      metrics: {
        reach: 2919,
        conversion_rate: 4.66
      }
    }
  ];

  setToken(token: string) {
    this.token = token;
  }

  // Enhanced Campaign Methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      data: this.mockCampaigns 
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const campaign = this.mockCampaigns.find(c => c.id === id);
    if (campaign) {
      return { success: true, data: campaign };
    }
    
    return { 
      success: false, 
      error: 'Campaign not found',
      message: `Campaign with ID ${id} does not exist`
    };
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validation
    if (!campaignData.name || campaignData.name.trim() === '') {
      return {
        success: false,
        error: 'Validation failed',
        message: 'Campaign name is required'
      };
    }

    const newCampaign: Campaign = {
      id: 'campaign-' + Date.now(),
      name: campaignData.name,
      description: campaignData.description || '',
      type: campaignData.type || 'email',
      status: campaignData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user@example.com',
      
      // Objectives & Goals
      primaryObjective: campaignData.primaryObjective || '',
      secondaryObjectives: campaignData.secondaryObjectives || [],
      smartGoals: campaignData.smartGoals || '',
      
      // KPIs & Targets
      primaryKPI: campaignData.primaryKPI || '',
      kpiTargets: campaignData.kpiTargets || {
        revenue: '',
        leads: '',
        conversion: '',
        roi: '',
        impressions: '',
        clicks: ''
      },
      
      // Budget & Timeline
      totalBudget: campaignData.totalBudget || 0,
      budget_allocated: campaignData.totalBudget || 0,
      budget_spent: 0,
      budgetBreakdown: campaignData.budgetBreakdown || {
        media: '',
        content: '',
        technology: '',
        personnel: '',
        contingency: ''
      },
      startDate: campaignData.startDate || '',
      endDate: campaignData.endDate || '',
      
      // Target Audience
      targetAudience: campaignData.targetAudience || '',
      audienceSegments: campaignData.audienceSegments || [],
      buyerPersonas: campaignData.buyerPersonas || [],
      demographics: campaignData.demographics || {
        ageRange: '',
        location: '',
        income: '',
        interests: ''
      },
      
      // Messaging & Content
      valueProposition: campaignData.valueProposition || '',
      keyMessages: campaignData.keyMessages || [],
      contentStrategy: campaignData.contentStrategy || '',
      creativeRequirements: campaignData.creativeRequirements || '',
      brandGuidelines: campaignData.brandGuidelines || '',
      
      // Channels & Distribution
      channels: campaignData.channels || [],
      channelStrategy: campaignData.channelStrategy || '',
      contentTypes: campaignData.contentTypes || [],
      
      // Legal & Compliance
      complianceChecklist: campaignData.complianceChecklist || {
        dataProtection: false,
        advertisingStandards: false,
        industryRegulations: false,
        termsOfService: false,
        privacyPolicy: false
      },
      legalNotes: campaignData.legalNotes || '',
      
      // Monitoring & Reporting
      analyticsTools: campaignData.analyticsTools || [],
      reportingFrequency: campaignData.reportingFrequency || '',
      stakeholders: campaignData.stakeholders || [],
      successCriteria: campaignData.successCriteria || '',
      
      // Default metrics
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

    // Add to mock data
    this.mockCampaigns.push(newCampaign);
    
    return { 
      success: true, 
      data: newCampaign 
    };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const campaignIndex = this.mockCampaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      return {
        success: false,
        error: 'Campaign not found',
        message: `Campaign with ID ${id} does not exist`
      };
    }

    // Validation
    if (updates.name && updates.name.trim() === '') {
      return {
        success: false,
        error: 'Validation failed',
        message: 'Campaign name cannot be empty'
      };
    }

    // Update campaign
    const updatedCampaign = {
      ...this.mockCampaigns[campaignIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.mockCampaigns[campaignIndex] = updatedCampaign;

    return { 
      success: true, 
      data: updatedCampaign 
    };
  }

  async duplicateCampaign(id: string): Promise<ApiResponse<Campaign>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const originalCampaign = this.mockCampaigns.find(c => c.id === id);
    if (!originalCampaign) {
      return {
        success: false,
        error: 'Campaign not found',
        message: `Campaign with ID ${id} does not exist`
      };
    }

    const duplicatedCampaign: Campaign = {
      ...originalCampaign,
      id: 'campaign-' + Date.now(),
      name: `${originalCampaign.name} (Copy)`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      budget_spent: 0,
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

    this.mockCampaigns.push(duplicatedCampaign);

    return {
      success: true,
      data: duplicatedCampaign
    };
  }

  async archiveCampaign(id: string): Promise<ApiResponse<Campaign>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const campaign = this.mockCampaigns.find(c => c.id === id);
    if (!campaign) {
      return {
        success: false,
        error: 'Campaign not found',
        message: `Campaign with ID ${id} does not exist`
      };
    }

    campaign.status = 'archived';
    campaign.updated_at = new Date().toISOString();

    return {
      success: true,
      data: campaign
    };
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const campaignIndex = this.mockCampaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      return {
        success: false,
        error: 'Campaign not found',
        message: `Campaign with ID ${id} does not exist`
      };
    }

    this.mockCampaigns.splice(campaignIndex, 1);

    return {
      success: true,
      data: undefined
    };
  }

  // Budget calculation helper
  calculateBudgetUsage(campaign: Campaign): number {
    if (!campaign.budget_allocated || campaign.budget_allocated === 0) {
      return 0;
    }
    return (campaign.budget_spent || 0) / campaign.budget_allocated * 100;
  }

  // Performance calculation helper
  calculateROI(campaign: Campaign): number {
    const revenue = campaign.metrics?.revenue_generated || 0;
    const spent = campaign.budget_spent || 0;
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  }

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

  // Integrations Methods
  get integrations() {
    return {
      getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
        return { success: true, data: [] };
      },

      connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { service, connected_at: new Date() } };
      },

      syncService: async (service: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { service, synced_at: new Date() } };
      },

      disconnectService: async (service: string): Promise<ApiResponse<any>> => {
        return { success: true, data: undefined };
      },

      getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
        return { success: true, data: [] };
      },

      createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
        return { 
          success: true, 
          data: { 
            id: 'webhook-' + Date.now(), 
            url: webhookData.url || '', 
            events: webhookData.events || [],
            ...webhookData 
          } as Webhook 
        };
      },

      deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
        return { success: true, data: undefined };
      },

      testWebhook: async (id: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { tested: true } };
      }
    };
  }

  // User Preferences Methods
  get userPreferences() {
    return {
      getUserPreferences: async (category?: string): Promise<ApiResponse<any[]>> => {
        return { 
          success: true, 
          data: [{ 
            id: '1', 
            category: category || 'general', 
            preference_data: {} 
          }] 
        };
      },

      updateUserPreferences: async (category: string, data: any): Promise<ApiResponse<any>> => {
        return { 
          success: true, 
          data: { id: '1', category, preference_data: data } 
        };
      },

      get: async (): Promise<ApiResponse<UserPreferences>> => {
        return { 
          success: true, 
          data: { theme: 'light', notifications: true } 
        };
      },

      update: async (preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> => {
        return { success: true, data: preferences };
      }
    };
  }

  // Workflows Methods
  get workflows() {
    return {
      getWorkflows: async (): Promise<ApiResponse<Workflow[]>> => {
        return { success: true, data: [] };
      },

      getAll: async (): Promise<ApiResponse<Workflow[]>> => {
        return { success: true, data: [] };
      },

      create: async (workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
        return { 
          success: true, 
          data: { 
            id: 'workflow-' + Date.now(), 
            name: workflow.name || 'New Workflow',
            ...workflow 
          } as Workflow 
        };
      },

      createWorkflow: async (workflow: any): Promise<ApiResponse<any>> => {
        return { success: true, data: { id: 'workflow-' + Date.now(), ...workflow } };
      },

      update: async (id: string, updates: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
        return { 
          success: true, 
          data: { id, ...updates } as Workflow 
        };
      },

      updateWorkflow: async (id: string, updates: any): Promise<ApiResponse<any>> => {
        return { success: true, data: { id, ...updates } };
      },

      delete: async (id: string): Promise<ApiResponse<void>> => {
        return { success: true, data: undefined };
      },

      deleteWorkflow: async (id: string): Promise<ApiResponse<any>> => {
        return { success: true, data: undefined };
      },

      execute: async (id: string, input?: any): Promise<ApiResponse<any>> => {
        return { success: true, data: { executed: true, result: 'Success' } };
      },

      executeWorkflow: async (id: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { executed: true } };
      }
    };
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
        content: `Generated content for ${brief.title}`,
        suggestions: ['Use more engaging headlines', 'Add call-to-action']
      }
    };
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> => {
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

  // Connection Methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    return {
      success: true,
      data: {
        id: 'conn-' + Date.now(),
        name: connectionData.name || 'New Connection',
        type: connectionData.type || 'api',
        status: 'connected',
        config: connectionData.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return { success: true, data: undefined };
  }

  // Social Platform Methods (top-level for compatibility)
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getPlatformConnections();
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'social-' + Date.now(),
        platform: config.platform,
        status: 'connected'
      }
    };
  }

  // Chat/Agent Methods
  async callGeneralCampaignAgent(message: string, campaigns?: any[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `Based on your ${campaigns?.length || 0} campaigns, here's my analysis: ${message}`,
        suggestions: ['Consider A/B testing', 'Optimize send times']
      }
    };
  }

  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    console.log('Querying agent with:', query, context);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        message: `Response to: ${query}`,
        context
      }
    };
  }

  // Other Methods
  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'scheduled-post-' + Date.now(),
        ...postData,
        status: 'scheduled',
        scheduled_at: postData.scheduled_for
      }
    };
  }

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