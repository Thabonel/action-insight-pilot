
export const getColorClasses = (color: string) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
    pink: 'from-pink-500 to-pink-600 text-pink-600 bg-pink-50',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

interface Campaign {
  status: string;
  [key: string]: unknown;
}

interface Lead {
  [key: string]: unknown;
}

export const calculateMetrics = (data: {
  campaigns: Campaign[];
  leads: Lead[];
  emailStats: { totalSent?: number; openRate?: number };
  socialStats: { posts?: number; engagement?: number };
  analyticsStats: { engagement?: number };
  systemHealth: { uptime_percentage?: number; status?: string };
}) => {
  const activeCampaigns = Array.isArray(data.campaigns)
    ? data.campaigns.filter((c) => c.status === 'active').length
    : 0;
  const totalLeads = Array.isArray(data.leads) ? data.leads.length : 0;
  const emailOpenRate = data.emailStats.openRate || 0;
  const socialPosts = data.socialStats.posts || 0;
  const contentEngagement = data.analyticsStats.engagement || 0;
  const systemUptime = data.systemHealth.uptime_percentage || 99.8;

  return {
    activeCampaigns,
    totalLeads,
    emailOpenRate,
    socialPosts,
    contentEngagement,
    systemUptime
  };
};
