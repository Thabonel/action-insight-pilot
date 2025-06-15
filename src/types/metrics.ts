
import { LucideIcon } from 'lucide-react';

export interface SystemMetric {
  title: string;
  value: string;
  change: string;
  trend: 'loading' | 'up' | 'down';
  icon: LucideIcon;
  color: string;
  performance: number;
}

export interface MetricApiData {
  campaigns?: any[];
  leads?: any[];
  emailStats?: { totalSent?: number; openRate?: number };
  socialStats?: { posts?: number; engagement?: number };
  analyticsStats?: { engagement?: number };
  systemHealth?: { uptime_percentage?: number; status?: string };
}
