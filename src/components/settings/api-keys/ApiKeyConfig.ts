
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
    id: 'anthropic_api_key',
    name: 'Anthropic Claude API Key',
    description: 'Required for AI content generation, analytics, and advanced reasoning. Primary AI provider using Claude Opus 4.5.',
    placeholder: 'sk-ant-...',
    icon: '🤖',
    required: true,
    validation: (value) => value.startsWith('sk-ant-') && value.length > 20
  },
  {
    id: 'gemini_api_key_encrypted',
    name: 'Google Gemini API Key',
    description: 'Required for visual AI tasks with Gemini 3 Pro/Flash, AI video generation with Veo 3, and image generation. Get your key from https://aistudio.google.com/apikey',
    placeholder: 'AIza...',
    icon: '🎬',
    required: true,
    validation: (value) => value.startsWith('AIza') && value.length > 30
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
    description: 'Optional paid service for instant TikTok publishing ($29/mo). Alternative: Use free Direct TikTok API (requires 2-8 week approval). Sign up at https://blotato.com',
    placeholder: 'blt_...',
    icon: '🎥',
    required: false,
    validation: (value) => value.startsWith('blt_') && value.length > 12
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
