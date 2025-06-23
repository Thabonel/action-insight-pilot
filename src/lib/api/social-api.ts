
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export class SocialApi {
  async getPosts() {
    try {
      const socialMethods = apiClient.socialPlatforms;
      const result = await socialMethods.getSocialMediaPosts();
      return result;
    } catch (error) {
      console.error('Error fetching social posts:', error);
      return { success: false, error: 'Failed to fetch posts' };
    }
  }

  async createPost(postData: any) {
    try {
      const socialMethods = apiClient.socialPlatforms;
      const result = await socialMethods.createSocialPost(postData);
      return result;
    } catch (error) {
      console.error('Error creating social post:', error);
      return { success: false, error: 'Failed to create post' };
    }
  }

  async getAnalytics() {
    try {
      const socialMethods = apiClient.socialPlatforms;
      const result = await socialMethods.getSocialAnalytics();
      return result;
    } catch (error) {
      console.error('Error fetching social analytics:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  async generateContent(brief: any) {
    try {
      const socialMethods = apiClient.socialPlatforms;
      const result = await socialMethods.generateSocialContent(brief);
      return result;
    } catch (error) {
      console.error('Error generating social content:', error);
      return { success: false, error: 'Failed to generate content' };
    }
  }
}

export const socialApi = new SocialApi();
