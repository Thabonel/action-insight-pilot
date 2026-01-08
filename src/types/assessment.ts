/**
 * TypeScript types for Assessment-Based Lead Generation System
 */

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'single_select' | 'scale' | 'text';
  category: 'best_practice' | 'qualification';
  options?: AssessmentOption[];
  placeholder?: string; // For text questions
  required?: boolean;
}

export interface AssessmentOption {
  label: string;
  value: string;
  points?: number;
}

export interface AssessmentLandingPage {
  headline: string;
  subheadline: string;
  benefits: string[];
  credibility: string;
  cta_text: string;
}

export interface AssessmentResultCategory {
  name: string;
  label: string;
  min_score: number;
  max_score: number;
  message: string;
  insights: string[];
  cta_text: string;
  cta_action: string; // 'calendar_booking' | 'resource_download' | 'training_access'
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description?: string;
  headline: string;
  subheadline: string;
  questions: AssessmentQuestion[];
  scoring_logic: Record<string, Record<string, number>>;
  result_categories: AssessmentResultCategory[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AssessmentResult {
  category: string;
  label: string;
  score: number;
  message: string;
  insights: string[];
  cta: {
    text: string;
    action: string;
  };
}

export interface AssessmentResponse {
  response_id: string;
  lead_id: string;
  score: number;
  result: AssessmentResult;
}

export interface AssessmentAnswer {
  value: string | string[] | number;
  points?: number;
}

export interface AssessmentSubmission {
  email: string;
  name?: string;
  phone?: string;
  answers: Record<string, AssessmentAnswer>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  device_type?: string;
  started_at?: string;
}

export interface RecentResponse {
  id: string;
  email: string;
  score: number;
  completed_at: string;
  [key: string]: unknown;
}

export interface AssessmentAnalytics {
  assessment_name: string;
  summary: {
    total_views: number;
    total_completions: number;
    total_emails_captured: number;
    overall_conversion_rate: number;
    avg_score?: number;
  };
  daily_analytics: DailyAnalytics[];
  score_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  recent_responses: RecentResponse[];
}

export interface DailyAnalytics {
  date: string;
  views: number;
  starts: number;
  completions: number;
  emails_captured: number;
  start_rate: number;
  completion_rate: number;
  email_capture_rate: number;
  overall_conversion_rate: number;
}

export interface AssessmentGenerationRequest {
  business_type: string;
  target_audience: string;
  product_offer: string;
  assessment_goal: string;
  campaign_id?: string;
}
