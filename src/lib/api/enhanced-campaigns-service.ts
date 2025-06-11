
import { HttpClient } from '../http-client';

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
}

export interface CampaignPerformance {
  campaign_id: string;
  metrics: CampaignMetric[];
  summary: {
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    conversion_rate: number;
    cost_per_acquisition: number;
    return_on_ad_spend: number;
  };
}

export class EnhancedCampaignsService {
  constructor(private httpClient: HttpClient) {}

  async getCampaignPerformance(campaignId: string, timeRange: string = '7d') {
    return this.httpClient.request<CampaignPerformance>(`/api/campaigns/${campaignId}/performance?range=${timeRange}`);
  }

  async updateCampaignStatus(campaignId: string, status: string) {
    return this.httpClient.request(`/api/campaigns/${campaignId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async optimizeCampaign(campaignId: string) {
    return this.httpClient.request(`/api/campaigns/${campaignId}/optimize`, {
      method: 'POST',
    });
  }

  async duplicateCampaign(campaignId: string, newName: string) {
    return this.httpClient.request(`/api/campaigns/${campaignId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  }

  async getCampaignInsights(campaignId: string) {
    return this.httpClient.request(`/api/campaigns/${campaignId}/insights`);
  }

  async pauseCampaign(campaignId: string) {
    return this.updateCampaignStatus(campaignId, 'paused');
  }

  async resumeCampaign(campaignId: string) {
    return this.updateCampaignStatus(campaignId, 'active');
  }

  async archiveCampaign(campaignId: string) {
    return this.updateCampaignStatus(campaignId, 'archived');
  }
}
