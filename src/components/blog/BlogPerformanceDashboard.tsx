
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Target, 
  Calendar,
  Edit,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface BlogStats {
  totalBlogs: number;
  blogsThisMonth: number;
  blogsLastMonth: number;
  averageSeoScore: number;
  topPerformer: {
    title: string;
    views: number;
    engagement: number;
  };
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface ContentHealth {
  needsUpdate: Array<{
    id: string;
    title: string;
    reason: string;
    lastUpdated: string;
  }>;
  contentGaps: Array<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
  }>;
  keywordOpportunities: Array<{
    keyword: string;
    competition: 'low' | 'medium' | 'high';
    potential: number;
  }>;
  seasonalSuggestions: Array<{
    topic: string;
    timing: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface QuickActions {
  drafts: Array<{
    id: string;
    title: string;
    lastModified: string;
    progress: number;
  }>;
  bestPerformers: Array<{
    id: string;
    title: string;
    score: number;
  }>;
  updateSuggestions: Array<{
    id: string;
    title: string;
    reason: string;
    priority: number;
  }>;
  seriesOpportunities: Array<{
    id: string;
    title: string;
    suggestedSeries: string;
  }>;
}

export interface BlogPerformanceDashboardProps {
  onCreateNew: () => void;
  onContinueDraft: (draftId: string) => void;
  onDuplicatePost: (postId: string) => void;
  onUpdatePost: (postId: string) => void;
  onCreateSeries: (postId: string) => void;
}

export const BlogPerformanceDashboard: React.FC<BlogPerformanceDashboardProps> = ({
  onCreateNew,
  onContinueDraft,
  onDuplicatePost,
  onUpdatePost,
  onCreateSeries
}) => {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [contentHealth, setContentHealth] = useState<ContentHealth | null>(null);
  const [quickActions, setQuickActions] = useState<QuickActions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real data from content calendar and campaigns
      const response = await apiClient.getContentCalendar();
      if (response.success) {
        const contentItems = response.data || [];
        
        // Calculate real stats from actual content
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const thisMonthContent = contentItems.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
        
        const lastMonthContent = contentItems.filter(item => {
          const itemDate = new Date(item.created_at);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
        });

        const realStats: BlogStats = {
          totalBlogs: contentItems.length,
          blogsThisMonth: thisMonthContent.length,
          blogsLastMonth: lastMonthContent.length,
          averageSeoScore: 0, // Would need SEO analysis integration
          topPerformer: {
            title: contentItems.length > 0 ? contentItems[0].title : "No content yet",
            views: 0, // Would need analytics integration
            engagement: 0
          },
          streak: 0, // Would need to calculate writing streak
          weeklyGoal: 3,
          weeklyProgress: 0 // Would need weekly tracking
        };

        const realContentHealth: ContentHealth = {
          needsUpdate: [], // Would need content analysis
          contentGaps: [], // Would need topic analysis
          keywordOpportunities: [], // Would need SEO tool integration
          seasonalSuggestions: [] // Would need trending topic analysis
        };

        const realQuickActions: QuickActions = {
          drafts: contentItems.filter(item => item.status === 'draft').map(item => ({
            id: item.id,
            title: item.title,
            lastModified: item.updated_at,
            progress: 50 // Would need progress tracking
          })),
          bestPerformers: [], // Would need performance metrics
          updateSuggestions: [], // Would need content analysis
          seriesOpportunities: [] // Would need content relationship analysis
        };

        setStats(realStats);
        setContentHealth(realContentHealth);
        setQuickActions(realQuickActions);
      } else {
        // Fallback to empty state
        setStats({
          totalBlogs: 0,
          blogsThisMonth: 0,
          blogsLastMonth: 0,
          averageSeoScore: 0,
          topPerformer: { title: "No content yet", views: 0, engagement: 0 },
          streak: 0,
          weeklyGoal: 3,
          weeklyProgress: 0
        });
        setContentHealth({
          needsUpdate: [],
          contentGaps: [],
          keywordOpportunities: [],
          seasonalSuggestions: []
        });
        setQuickActions({
          drafts: [],
          bestPerformers: [],
          updateSuggestions: [],
          seriesOpportunities: []
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthComparison = () => {
    if (!stats) return { change: 0, isPositive: false };
    const change = ((stats.blogsThisMonth - stats.blogsLastMonth) / stats.blogsLastMonth) * 100;
    return { change: Math.abs(change), isPositive: change > 0 };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || !contentHealth || !quickActions) return null;

  const monthComparison = getMonthComparison();

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blogs This Month</p>
                <p className="text-2xl font-bold">{stats.blogsThisMonth}</p>
                <div className="flex items-center mt-1">
                  {monthComparison.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${monthComparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {monthComparison.change.toFixed(1)}% vs last month
                  </span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average SEO Score</p>
                <p className="text-2xl font-bold">{stats.averageSeoScore}%</p>
                <Badge className="mt-1 bg-green-100 text-green-800">Excellent</Badge>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Performer</p>
              <p className="text-lg font-semibold">{stats.topPerformer.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{stats.topPerformer.views} views</span>
                <span className="text-sm text-gray-600">{stats.topPerformer.engagement} engagement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Writing Streak</p>
                <p className="text-2xl font-bold">{stats.streak} days</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Weekly Goal</span>
                    <span>{stats.weeklyProgress}/{stats.weeklyGoal}</span>
                  </div>
                  <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="h-2" />
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Continue Drafts */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Continue Drafts
              </h4>
              {quickActions.drafts.map((draft) => (
                <div key={draft.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{draft.title}</h5>
                    <Badge variant="outline">{draft.progress}%</Badge>
                  </div>
                  <Progress value={draft.progress} className="h-2 mb-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Modified {draft.lastModified}</span>
                    <Button size="sm" onClick={() => onContinueDraft(draft.id)}>
                      Continue
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Best Performers */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Duplicate Best Performers
              </h4>
              {quickActions.bestPerformers.map((post) => (
                <div key={post.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-sm">{post.title}</h5>
                    <Badge className="bg-green-100 text-green-800">{post.score}</Badge>
                  </div>
                  <Button size="sm" onClick={() => onDuplicatePost(post.id)} className="w-full">
                    Duplicate Structure
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Update Suggestions
              </h4>
              {quickActions.updateSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{suggestion.title}</h5>
                    <Badge variant="outline">Priority {suggestion.priority}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{suggestion.reason}</p>
                  <Button size="sm" onClick={() => onUpdatePost(suggestion.id)}>
                    Update Post
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Series Opportunities
              </h4>
              {quickActions.seriesOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-3">
                  <h5 className="font-medium text-sm">{opportunity.title}</h5>
                  <p className="text-xs text-gray-600 mb-2">Suggested: {opportunity.suggestedSeries}</p>
                  <Button size="sm" onClick={() => onCreateSeries(opportunity.id)}>
                    Create Series
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Health Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Content Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Needs Updates</h4>
              <div className="space-y-2">
                {contentHealth.needsUpdate.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm">{item.title}</h5>
                      <Badge variant="outline" className="text-orange-600">
                        {item.reason}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">Last updated: {item.lastUpdated}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Seasonal Suggestions</h4>
              <div className="space-y-2">
                {contentHealth.seasonalSuggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="font-medium text-sm">{suggestion.topic}</h5>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{suggestion.timing}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              Content Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Content Gaps</h4>
              <div className="space-y-2">
                {contentHealth.contentGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="font-medium text-sm">{gap.topic}</h5>
                      <Badge className={getDifficultyColor(gap.difficulty)}>
                        {gap.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{gap.searchVolume.toLocaleString()} monthly searches</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Keyword Opportunities</h4>
              <div className="space-y-2">
                {contentHealth.keywordOpportunities.map((keyword, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm">{keyword.keyword}</h5>
                      <div className="flex gap-1">
                        <Badge className={getCompetitionColor(keyword.competition)}>
                          {keyword.competition}
                        </Badge>
                        <Badge variant="outline">{keyword.potential}% potential</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
