
import { ApiResponse, SocialPlatformConnection } from '@/lib/api-client-interface';

export interface PlatformConnectionResult {
  [key: string]: unknown;
}

export interface SocialPost {
  [key: string]: unknown;
}

export interface SocialAnalytics {
  [key: string]: unknown;
}

export interface SocialContentBrief {
  [key: string]: unknown;
}

export interface GeneratedContent {
  [key: string]: unknown;
}

export interface SocialMethods {
  getPlatformConnections: () => Promise<ApiResponse<SocialPlatformConnection[]>>;
  initiatePlatformConnection: (platform: string) => Promise<ApiResponse<PlatformConnectionResult>>;
  disconnectPlatform: (platform: string) => Promise<ApiResponse<void>>;
  syncPlatformData: (platform: string) => Promise<ApiResponse<Record<string, unknown>>>;
  testPlatformConnection: (platform: string) => Promise<ApiResponse<Record<string, unknown>>>;
  getSocialMediaPosts: () => Promise<ApiResponse<SocialPost[]>>;
  createSocialPost: (postData: Record<string, unknown>) => Promise<ApiResponse<SocialPost>>;
  getSocialAnalytics: () => Promise<ApiResponse<SocialAnalytics>>;
  generateSocialContent: (brief: SocialContentBrief) => Promise<ApiResponse<GeneratedContent>>;
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

  createSocialPost: async (postData: Record<string, unknown>) => {
    throw new Error('createSocialPost not implemented - use Supabase client directly');
  },

  getSocialAnalytics: async () => {
    throw new Error('getSocialAnalytics not implemented - use Supabase client directly');
  },

  generateSocialContent: async (brief: SocialContentBrief) => {
    throw new Error('generateSocialContent not implemented - use Supabase client directly');
  }
});
