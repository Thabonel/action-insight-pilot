export interface CampaignPersona {
  name: string;
  description: string;
  age?: string;
  painPoints: string[];
  goals: string[];
  demographics?: Record<string, unknown>;
}

export interface ChannelAllocation {
  name: string;
  allocation: number;
}

export interface ChannelMix {
  totalBudget: number;
  channels: ChannelAllocation[];
}

export interface MessagingPillar {
  title: string;
  description: string;
  tone: string;
}

export interface ContentCalendarItem {
  date: string;
  platform: string;
  content: string;
  type: string;
}

export interface AIGeneration {
  personas: CampaignPersona[];
  channelMix: ChannelMix;
  messagingPillars: MessagingPillar[];
  contentCalendar: ContentCalendarItem[];
}

export interface BudgetBreakdown {
  [key: string]: string;
  media?: string;
  content?: string;
  technology?: string;
  personnel?: string;
  contingency?: string;
}

export interface KPITargets {
  revenue?: string;
  leads?: string;
  conversion?: string;
  roi?: string;
  impressions?: string;
  clicks?: string;
}

export interface CampaignContent {
  calendar?: ContentCalendarItem[];
  messagingPillars?: MessagingPillar[];
  personas?: CampaignPersona[];
  channelMix?: ChannelMix;
  [key: string]: unknown;
}

export interface CampaignSettings {
  [key: string]: unknown;
}

export interface CampaignMetrics {
  [key: string]: unknown;
}
