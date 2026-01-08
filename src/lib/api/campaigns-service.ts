
import { HttpClient } from '../http-client';
import { Campaign } from '../api-client-interface';

export class CampaignsService {
  constructor(private httpClient: HttpClient) {}

  async getCampaigns() {
    return this.httpClient.request('/api/campaigns');
  }

  async createCampaign(campaignData: Partial<Campaign>) {
    return this.httpClient.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async bulkCreateCampaigns(campaigns: Partial<Campaign>[]) {
    return this.httpClient.request('/api/campaigns/bulk/create', {
      method: 'POST',
      body: JSON.stringify({ campaigns }),
    });
  }

  async getCampaignById(id: string) {
    return this.httpClient.request(`/api/campaigns/${id}`);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>) {
    return this.httpClient.request(`/api/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(id: string) {
    return this.httpClient.request(`/api/campaigns/${id}`, {
      method: 'DELETE',
    });
  }
}
