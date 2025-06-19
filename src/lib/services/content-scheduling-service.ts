
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface ScheduleContentRequest {
  content: string;
  platform: string;
  scheduledTime: string;
  campaignId?: string;
}

export interface ScheduledContent {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  campaignId?: string;
}

export class ContentSchedulingService {
  static async scheduleContent(request: ScheduleContentRequest): Promise<ApiResponse<ScheduledContent>> {
    try {
      const response = await apiClient.scheduleSocialPost(request);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule content'
      };
    }
  }

  static async getScheduledContent(): Promise<ApiResponse<ScheduledContent[]>> {
    try {
      const response = await apiClient.socialPlatforms.getConnected();
      return {
        success: response.success,
        data: response.data || [],
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get scheduled content'
      };
    }
  }
}
