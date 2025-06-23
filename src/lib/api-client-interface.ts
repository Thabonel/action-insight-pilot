
export interface UserPreferences {
  name?: string;
  domain?: string;
  industry?: string;
  teamSize?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    [key: string]: boolean;
  };
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  username?: string;
  lastSync?: string;
}
