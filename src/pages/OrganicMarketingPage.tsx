/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable no-explicit-any for this file until Supabase types are regenerated after migration
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrganicSetupWizard from '@/components/organic/OrganicSetupWizard';
import ContentCreator from '@/components/organic/ContentCreator';
import QualityGateDashboard from '@/components/organic/QualityGateDashboard';
import GoldenHourView from '@/components/organic/GoldenHourView';
import { Settings, PenTool, CheckSquare, Clock, Sparkles, Target, Users } from 'lucide-react';

interface OrganicConfig {
  setup_completed: boolean;
  quality_threshold: number;
  golden_hour_enabled: boolean;
}

interface Stats {
  totalContent: number;
  passedGate: number;
  avgScore: number;
  platformsCovered: number;
}

const OrganicMarketingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<OrganicConfig | null>(null);
  const [stats, setStats] = useState<Stats>({ totalContent: 0, passedGate: 0, avgScore: 0, platformsCovered: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [user]);

  const loadConfig = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Load config - using any to bypass TypeScript until types are regenerated
      const { data: configData } = await (supabase as any)
        .from('organic_marketing_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (configData) {
        setConfig(configData);
      }

      // Load stats
      const { data: contentData } = await (supabase as any)
        .from('content_pieces')
        .select('quality_score, passed_quality_gate, platform')
        .eq('user_id', user.id);

      if (contentData && contentData.length > 0) {
        const passed = contentData.filter((c: any) => c.passed_quality_gate).length;
        const scored = contentData.filter((c: any) => c.quality_score !== null);
        const avgScore = scored.length > 0
          ? Math.round(scored.reduce((sum: number, c: any) => sum + c.quality_score, 0) / scored.length)
          : 0;
        const platforms = new Set(contentData.map((c: any) => c.platform)).size;

        setStats({
          totalContent: contentData.length,
          passedGate: passed,
          avgScore,
          platformsCovered: platforms
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    loadConfig();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!config?.setup_completed || showSetup) {
    return <OrganicSetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organic Marketing</h1>
          <p className="text-muted-foreground">
            Build authentic audience connections with AI-powered content that speaks their language
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowSetup(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <PenTool className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalContent}</div>
                <p className="text-sm text-muted-foreground">Total Content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.passedGate}</div>
                <p className="text-sm text-muted-foreground">Passed Quality Gate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgScore}</div>
                <p className="text-sm text-muted-foreground">Avg Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.platformsCovered}</div>
                <p className="text-sm text-muted-foreground">Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-sm">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">How It Works</h3>
                <p className="text-muted-foreground max-w-2xl">
                  AI learns your audience's exact language, creates content that resonates,
                  scores it for quality, and schedules posts at optimal times for maximum engagement.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Quality Threshold: {config?.quality_threshold || 70}</Badge>
              {config?.golden_hour_enabled && (
                <Badge className="bg-yellow-500">Golden Hour Enabled</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Create Content</span>
            <span className="sm:hidden">Create</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Review Queue</span>
            <span className="sm:hidden">Review</span>
          </TabsTrigger>
          <TabsTrigger value="golden" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Best Times</span>
            <span className="sm:hidden">Times</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <ContentCreator onContentCreated={() => loadConfig()} />
        </TabsContent>

        <TabsContent value="queue">
          <QualityGateDashboard />
        </TabsContent>

        <TabsContent value="golden">
          <GoldenHourView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganicMarketingPage;
