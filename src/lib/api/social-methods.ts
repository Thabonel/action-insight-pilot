
import { ApiResponse, SocialPlatformConnection } from '@/lib/api-client-interface';

export interface SocialMethods {
  getPlatformConnections: () => Promise<ApiResponse<SocialPlatformConnection[]>>;
  initiatePlatformConnection: (platform: string) => Promise<ApiResponse<any>>;
  disconnectPlatform: (platform: string) => Promise<ApiResponse<void>>;
  syncPlatformData: (platform: string) => Promise<ApiResponse<any>>;
  testPlatformConnection: (platform: string) => Promise<ApiResponse<any>>;
  getSocialMediaPosts: () => Promise<ApiResponse<any[]>>;
  createSocialPost: (postData: any) => Promise<ApiResponse<any>>;
  getSocialAnalytics: () => Promise<ApiResponse<any>>;
  generateSocialContent: (brief: any) => Promise<ApiResponse<any>>;
}

export const createSocialMethods = (): SocialMethods => ({
  getPlatformConnections: async () => {
    throw new Error('getPlatformConnections not implemented - use Supabase client directly');
  },

  initiatePlatformConnection: async (platform: string) => {
    throw new Error('initiatePlatformConnection not implemented - use Supabase client directly');
  },

  disconnectPlatform: async (platform: string) => {
    throw new Error('disconnectPlatform not implemented - use Supabase client directly');
  },

  syncPlatformData: async (platform: string) => {
    throw new Error('syncPlatformData not implemented - use Supabase client directly');
  },

  testPlatformConnection: async (platform: string) => {
    throw new Error('testPlatformConnection not implemented - use Supabase client directly');
  },

  getSocialMediaPosts: async () => {
    throw new Error('getSocialMediaPosts not implemented - use Supabase client directly');
  },

  createSocialPost: async (postData: any) => {
    throw new Error('createSocialPost not implemented - use Supabase client directly');
  },

  getSocialAnalytics: async () => {
    throw new Error('getSocialAnalytics not implemented - use Supabase client directly');
  },

  generateSocialContent: async (brief: any) => {
    throw new Error('generateSocialContent not implemented - use Supabase client directly');
  }
});
