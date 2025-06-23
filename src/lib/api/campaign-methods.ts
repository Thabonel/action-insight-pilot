
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
          sent: 1000,
          opened: 250,
          clicked: 50
        }
      },
      {
        id: '2',
        name: 'Social Media Promotion',
        description: 'Cross-platform social media campaign',
        type: 'social',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          impressions: 5000,
          engagement: 150
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
}
