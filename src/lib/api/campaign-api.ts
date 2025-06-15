
import { ClientCore } from './client-core';
import { CampaignMethods } from './campaign-methods';

export class CampaignApi extends ClientCore {
  private campaignMethods: CampaignMethods;

  constructor() {
    super();
    this.campaignMethods = new CampaignMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.campaignMethods.setToken(token);
  }

  async getCampaigns() {
    return this.campaignMethods.getCampaigns();
  }

  async createCampaign(campaignData: any) {
    return this.campaignMethods.createCampaign(campaignData);
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.campaignMethods.bulkCreateCampaigns(campaigns);
  }

  async getCampaignById(id: string) {
    return this.campaignMethods.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: any) {
    return this.campaignMethods.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string) {
    return this.campaignMethods.deleteCampaign(id);
  }

  get enhancedCampaigns() {
    return this.campaignMethods.enhancedCampaigns;
  }
}
