
export interface RealInsights {
  totalActions: number;
  recentActivities: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
  suggestions: string[];
  trends: {
    positive: number;
    negative: number;
    neutral: number;
  };
}
