
import { apiClient } from '@/lib/api-client';
import { ApiResponse, SocialPost } from '@/lib/api-client-interface';

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
      const socialPostData: SocialPost = {
        id: '',
        content: request.content,
        platform: request.platform,
        scheduledTime: request.scheduledTime,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        campaignId: request.campaignId
      };

      const response = await apiClient.scheduleSocialPost(socialPostData);
      
      if (response.success && response.data) {
        const scheduledContent: ScheduledContent = {
          id: response.data.id,
          content: response.data.content,
          platform: response.data.platform,
          scheduledTime: response.data.scheduledTime,
          status: response.data.status === 'draft' ? 'scheduled' : response.data.status,
          campaignId: response.data.campaignId
        };
        
        return {
          success: true,
          data: scheduledContent
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to schedule content'
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
      const response = await apiClient.getSocialPosts();
      
      if (response.success && response.data) {
        const scheduledContent: ScheduledContent[] = response.data.map(post => ({
          id: post.id,
          content: post.content,
          platform: post.platform,
          scheduledTime: post.scheduledTime,
          status: post.status === 'draft' ? 'scheduled' : post.status,
          campaignId: post.campaignId
        }));
        
        return {
          success: true,
          data: scheduledContent
        };
      }
      
      return {
        success: false,
        data: [],
        error: response.error || 'Failed to get scheduled content'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get scheduled content'
      };
    }
  }
}
