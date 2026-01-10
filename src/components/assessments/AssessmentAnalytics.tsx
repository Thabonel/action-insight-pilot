import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentAnalytics as AnalyticsData } from '@/types/assessment';

interface AssessmentAnalyticsProps {
  assessmentId: string;
  assessmentName?: string;
}

export default function AssessmentAnalytics({ assessmentId, assessmentName }: AssessmentAnalyticsProps) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadAnalytics();
  }, [assessmentId, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/analytics?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load analytics');
      }

      setAnalytics(data.analytics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to load performance data.";
      console.error('Error loading analytics:', error);
      toast({
        title: "Failed to Load Analytics",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const csv = generateCSV(analytics);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-analytics-${assessmentId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analytics data downloaded as CSV"
    });
  };

  const generateCSV = (data: AnalyticsData): string => {
    const headers = ['Date', 'Views', 'Starts', 'Completions', 'Emails', 'Start Rate', 'Completion Rate', 'Email Capture Rate', 'Overall Conversion'];
    const rows = data.daily_analytics.map(day => [
      day.date,
      day.views,
      day.starts,
      day.completions,
      day.emails_captured,
      `${day.start_rate}%`,
      `${day.completion_rate}%`,
      `${day.email_capture_rate}%`,
      `${day.overall_conversion_rate}%`
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getScoreColor = (category: string) => {
    switch (category) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">No analytics data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, daily_analytics, score_distribution, recent_responses } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assessment Performance</h2>
          {assessmentName && (
            <p className="text-sm text-gray-600 mt-1">{assessmentName}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRange(7)}
            className={dateRange === 7 ? 'bg-blue-50' : ''}
          >
            7 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRange(30)}
            className={dateRange === 30 ? 'bg-blue-50' : ''}
          >
            30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRange(90)}
            className={dateRange === 90 ? 'bg-blue-50' : ''}
          >
            90 Days
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_views}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_completions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emails Captured</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_emails_captured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.overall_conversion_rate >= 20 ? 'border-green-300 bg-green-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.overall_conversion_rate.toFixed(1)}%</p>
                {summary.overall_conversion_rate >= 20 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    Industry Target
                  </p>
                )}
                {summary.overall_conversion_rate < 20 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Target: 20-40%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FunnelStep
              label="Views"
              count={summary.total_views}
              percentage={100}
              color="blue"
            />
            <FunnelStep
              label="Completions"
              count={summary.total_completions}
              percentage={(summary.total_completions / summary.total_views) * 100}
              color="green"
            />
            <FunnelStep
              label="Emails Captured"
              count={summary.total_emails_captured}
              percentage={(summary.total_emails_captured / summary.total_views) * 100}
              color="purple"
            />
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Quality Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={getScoreColor('high')}>High Score (75+)</Badge>
                <span className="text-sm text-gray-600">Ready to buy</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{score_distribution.high}</span>
                <span className="text-sm text-gray-500">
                  ({((score_distribution.high / summary.total_completions) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={getScoreColor('medium')}>Medium Score (50-74)</Badge>
                <span className="text-sm text-gray-600">Need nurturing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{score_distribution.medium}</span>
                <span className="text-sm text-gray-500">
                  ({((score_distribution.medium / summary.total_completions) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={getScoreColor('low')}>Low Score (&lt;50)</Badge>
                <span className="text-sm text-gray-600">Long-term prospects</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{score_distribution.low}</span>
                <span className="text-sm text-gray-500">
                  ({((score_distribution.low / summary.total_completions) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          {summary.avg_score && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{summary.avg_score.toFixed(1)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-right py-2 px-2">Views</th>
                  <th className="text-right py-2 px-2">Starts</th>
                  <th className="text-right py-2 px-2">Completions</th>
                  <th className="text-right py-2 px-2">Emails</th>
                  <th className="text-right py-2 px-2">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {daily_analytics.slice(0, 10).map((day) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="text-right py-2 px-2">{day.views}</td>
                    <td className="text-right py-2 px-2">{day.starts}</td>
                    <td className="text-right py-2 px-2">{day.completions}</td>
                    <td className="text-right py-2 px-2">{day.emails_captured}</td>
                    <td className="text-right py-2 px-2">
                      <span className={day.overall_conversion_rate >= 20 ? 'text-green-600 font-semibold' : ''}>
                        {day.overall_conversion_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Responses */}
      {recent_responses && recent_responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_responses.slice(0, 5).map((response: { response_id: string; lead_email: string | null; submitted_at: string; result_category: string; result_label: string; score: number }) => (
                <div key={response.response_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{response.lead_email || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(response.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getScoreColor(response.result_category)}>
                      {response.result_label}
                    </Badge>
                    <span className="text-lg font-bold text-gray-900">{response.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FunnelStepProps {
  label: string;
  count: number;
  percentage: number;
  color: 'blue' | 'green' | 'purple';
}

function FunnelStep({ label, count, percentage, color }: FunnelStepProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
