
import { BaseApiClient } from './base-api-client';
import { ApiResponse, Campaign } from '../api-client-interface';

export class CampaignMethods extends BaseApiClient {
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Summer Email Campaign',
        description: 'Targeted email campaign for summer products',
        type: 'email',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          impressions: 1000,
          clicks: 250,
          conversion_rate: 5.0
        }
      },
      {
        id: '2',
        name: 'Social Media Promotion',
        description: 'Cross-platform social media campaign',
        type: 'social_media',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          impressions: 5000,
          engagement_rate: 3.0
        }
      }
    ];

    return {
      success: true,
      data: mockCampaigns
    };
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: 'new-campaign-' + Date.now(),
        name: campaign.name || 'New Campaign',
        description: campaign.description || '',
        type: campaign.type || 'email',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async bulkCreateCampaigns(campaigns: Partial<Campaign>[]): Promise<ApiResponse<Campaign[]>> {
    const createdCampaigns = campaigns.map((campaign, index) => ({
      id: 'bulk-campaign-' + Date.now() + '-' + index,
      name: campaign.name || 'New Campaign',
      description: campaign.description || '',
      type: campaign.type || 'email',
      status: 'draft' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    return {
      success: true,
      data: createdCampaigns
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: 'Sample Campaign',
        description: 'A sample campaign',
        type: 'email',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: updates.name || 'Updated Campaign',
        description: updates.description || '',
        type: updates.type || 'email',
        status: updates.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      data: undefined
    };
  }

  get enhancedCampaigns() {
    return {
      getCampaigns: this.getCampaigns.bind(this),
      createCampaign: this.createCampaign.bind(this),
      updateCampaign: this.updateCampaign.bind(this),
      deleteCampaign: this.deleteCampaign.bind(this)
    };
  }
}
