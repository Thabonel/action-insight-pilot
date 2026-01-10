
export interface SystemMetric {
  title: string;
  value: string;
  change: string;
  trend: 'loading' | 'up' | 'down';
  color: string;
  performance: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  budget?: number;
  [key: string]: unknown;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  score?: number;
  [key: string]: unknown;
}

export interface MetricApiData {
  campaigns?: Campaign[];
  leads?: Lead[];
  emailStats?: { totalSent?: number; openRate?: number };
  socialStats?: { posts?: number; engagement?: number };
  analyticsStats?: { engagement?: number };
  systemHealth?: { uptime_percentage?: number; status?: string };
}
