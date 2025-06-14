
import { LucideIcon } from 'lucide-react';

export interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  icon: string;
  required: boolean;
  validation?: (value: string) => boolean;
}

export const aiServices: ApiKeyConfig[] = [
  {
    id: 'openai_api_key',
    name: 'OpenAI API Key',
    description: 'Required for AI content generation and video script creation',
    placeholder: 'sk-...',
    icon: '🧠',
    required: true,
    validation: (value) => value.startsWith('sk-') && value.length > 20
  },
  {
    id: 'anthropic_api_key',
    name: 'Anthropic Claude API Key',
    description: 'Alternative to OpenAI for advanced reasoning and analytics',
    placeholder: 'sk-ant-...',
    icon: '🤖',
    required: false,
    validation: (value) => value.startsWith('sk-ant-') && value.length > 20
  },
  {
    id: 'json2video_api_key',
    name: 'json2video API Key',
    description: 'For automated video creation and rendering',
    placeholder: 'j2v_...',
    icon: '🎬',
    required: true,
    validation: (value) => value.length > 10
  },
  {
    id: 'blotato_api_key',
    name: 'Blotato API Key',
    description: 'For video enhancement and processing',
    placeholder: 'blt_...',
    icon: '🎥',
    required: false,
    validation: (value) => value.length > 8
  }
];

export const socialPlatforms: ApiKeyConfig[] = [
  {
    id: 'twitter_bearer_token',
    name: 'Twitter (X) Bearer Token',
    description: 'For posting and managing Twitter content',
    placeholder: 'AAA...',
    icon: '𝕏',
    required: false,
    validation: (value) => value.length > 50
  },
  {
    id: 'facebook_access_token',
    name: 'Facebook Access Token',
    description: 'For Facebook page management and posting',
    placeholder: 'EAA...',
    icon: '📘',
    required: false,
    validation: (value) => value.startsWith('EAA') && value.length > 50
  },
  {
    id: 'instagram_access_token',
    name: 'Instagram Access Token',
    description: 'For Instagram content publishing',
    placeholder: 'IGQ...',
    icon: '📷',
    required: false,
    validation: (value) => value.length > 30
  },
  {
    id: 'linkedin_access_token',
    name: 'LinkedIn Access Token',
    description: 'For LinkedIn company page posting',
    placeholder: 'AQX...',
    icon: '💼',
    required: false,
    validation: (value) => value.length > 30
  },
  {
    id: 'youtube_api_key',
    name: 'YouTube API Key',
    description: 'For YouTube channel management and uploads',
    placeholder: 'AIza...',
    icon: '📺',
    required: false,
    validation: (value) => value.startsWith('AIza') && value.length > 30
  },
  {
    id: 'tiktok_access_token',
    name: 'TikTok Access Token',
    description: 'For TikTok content publishing and management',
    placeholder: 'ttk_...',
    icon: '🎵',
    required: false,
    validation: (value) => value.length > 20
  }
];
