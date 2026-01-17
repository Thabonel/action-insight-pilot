/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable no-explicit-any for this file until Supabase types are regenerated after migration
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Clock, Eye, Trash2, Send } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: string;
  quality_score: number | null;
  quality_feedback: {
    overallScore: number;
    passed: boolean;
    scores: Record<string, { score: number; feedback: string }>;
    priorityImprovements?: string[];
  } | null;
  passed_quality_gate: boolean;
  scheduled_for: string | null;
  created_at: string;
}

const QualityGateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Using 'as any' until types are regenerated after migration
      const { data, error } = await (supabase as any)
        .from('content_pieces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: 'Failed to load content',
        description: 'Please try refreshing the page',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Using 'as any' until types are regenerated after migration
      const { error } = await (supabase as any)
        .from('content_pieces')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setContentItems(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null);
      toast({ title: 'Content deleted' });
    } catch (error) {
      toast({
        title: 'Delete failed',
        variant: 'destructive'
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // Using 'as any' until types are regenerated after migration
      const { error } = await (supabase as any)
        .from('content_pieces')
        .update({ status: 'approved', passed_quality_gate: true })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setContentItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'approved', passed_quality_gate: true } : item
      ));
      toast({ title: 'Content approved' });
    } catch (error) {
      toast({
        title: 'Approval failed',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string, passed: boolean) => {
    if (status === 'approved' || passed) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (status === 'scheduled') {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      pending_review: 'secondary',
      approved: 'default',
      scheduled: 'default',
      published: 'default',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') return contentItems;
    if (status === 'passed') return contentItems.filter(i => i.passed_quality_gate);
    if (status === 'needs_work') return contentItems.filter(i => !i.passed_quality_gate && i.quality_score !== null);
    return contentItems.filter(i => i.status === status);
  };

  const stats = {
    total: contentItems.length,
    passed: contentItems.filter(i => i.passed_quality_gate).length,
    needsWork: contentItems.filter(i => !i.passed_quality_gate && i.quality_score !== null).length,
    avgScore: contentItems.filter(i => i.quality_score !== null).length > 0
      ? Math.round(
          contentItems.filter(i => i.quality_score !== null)
            .reduce((sum, i) => sum + (i.quality_score || 0), 0) /
          contentItems.filter(i => i.quality_score !== null).length
        )
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <p className="text-sm text-muted-foreground">Passed Quality Gate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.needsWork}</div>
            <p className="text-sm text-muted-foreground">Needs Work</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Queue</CardTitle>
              <CardDescription>Review and manage your content</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="passed">Passed ({stats.passed})</TabsTrigger>
                  <TabsTrigger value="needs_work">Needs Work ({stats.needsWork})</TabsTrigger>
                </TabsList>

                {['all', 'passed', 'needs_work'].map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-2">
                    {filterByStatus(tab).map(item => (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedItem?.id === item.id ? 'border-primary bg-muted/30' : ''
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status, item.passed_quality_gate)}
                            <div>
                              <p className="font-medium line-clamp-1">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.platform} - {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.quality_score !== null && (
                              <Badge variant={item.passed_quality_gate ? 'default' : 'secondary'}>
                                {item.quality_score}/100
                              </Badge>
                            )}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {filterByStatus(tab).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No content in this category
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedItem.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedItem.status)}
                  <Badge variant="outline">{selectedItem.platform}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>
                </div>

                {selectedItem.quality_feedback && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Quality Score</span>
                      <span className={selectedItem.passed_quality_gate ? 'text-green-600' : 'text-yellow-600'}>
                        {selectedItem.quality_score}/100
                      </span>
                    </div>
                    <Progress
                      value={selectedItem.quality_score || 0}
                      className="h-2"
                    />

                    {selectedItem.quality_feedback.priorityImprovements && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3">
                        <p className="font-medium text-sm mb-2">Improvements Needed</p>
                        <ul className="text-sm space-y-1">
                          {selectedItem.quality_feedback.priorityImprovements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedItem.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  {!selectedItem.passed_quality_gate && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(selectedItem.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {selectedItem.passed_quality_gate && selectedItem.status !== 'scheduled' && (
                    <Button size="sm" className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select content to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityGateDashboard;
