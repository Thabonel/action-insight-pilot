
export interface PlatformConnection {
  id: string;
  platform: SocialPlatform;
  isConnected: boolean;
  userId?: string;
  profiles: SocialProfile[];
  lastSync?: string;
  accessTokenExpires?: string;
}

export interface SocialProfile {
  id: string;
  name: string;
  platform: string;
  username: string;
  avatarUrl?: string;
  isActive: boolean;
}

export enum SocialPlatform {
  BUFFER = 'buffer',
  HOOTSUITE = 'hootsuite',
  LATER = 'later',
  SPROUT_SOCIAL = 'sprout_social',
  AI_VIDEO_PUBLISHER = 'ai_video_publisher'
}

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  supportedNetworks: string[];
  pricingInfo?: string;
}

export interface OAuthState {
  platform: SocialPlatform;
  userId: string;
  returnUrl: string;
  timestamp: number;
}
