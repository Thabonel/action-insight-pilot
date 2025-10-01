
import { BaseApiClient } from './base-api-client';
import { ApiResponse, Campaign } from '../api-client-interface';

export class CampaignMethods extends BaseApiClient {
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    throw new Error('getCampaigns not implemented - use Supabase client directly');
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    throw new Error('createCampaign not implemented - use Supabase client directly');
  }

  async bulkCreateCampaigns(campaigns: Partial<Campaign>[]): Promise<ApiResponse<Campaign[]>> {
    throw new Error('bulkCreateCampaigns not implemented - use Supabase client directly');
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    throw new Error('getCampaignById not implemented - use Supabase client directly');
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    throw new Error('updateCampaign not implemented - use Supabase client directly');
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    throw new Error('deleteCampaign not implemented - use Supabase client directly');
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
