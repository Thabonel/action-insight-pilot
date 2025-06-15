
import { BaseApiClient } from './base-api-client';
import { CampaignsService } from './campaigns-service';
import { EnhancedCampaignsService } from './enhanced-campaigns-service';

export class CampaignMethods extends BaseApiClient {
  private campaigns: CampaignsService;
  public enhancedCampaigns: EnhancedCampaignsService;

  constructor() {
    super();
    this.campaigns = new CampaignsService(this.httpClient);
    this.enhancedCampaigns = new EnhancedCampaignsService(this.httpClient);
  }

  async getCampaigns() {
    return this.campaigns.getCampaigns();
  }

  async createCampaign(campaignData: any) {
    return this.campaigns.createCampaign(campaignData);
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.campaigns.bulkCreateCampaigns(campaigns);
  }

  async getCampaignById(id: string) {
    return this.campaigns.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: any) {
    return this.campaigns.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string) {
    return this.campaigns.deleteCampaign(id);
  }
}
