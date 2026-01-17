import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, AlertCircle, Calendar, MessageSquare, Share2, Users } from 'lucide-react';

interface OptimalTime {
  dayOfWeek: number;
  dayName: string;
  hour: number;
  formattedHour: string;
  avgEngagement: number | null;
  sampleCount: number;
  source: 'learned' | 'default';
}

interface ChecklistItem {
  task: string;
  timing: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed?: boolean;
}

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'blog', label: 'Blog' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'facebook', label: 'Facebook' }
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const GoldenHourView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platform, setPlatform] = useState('linkedin');
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGoldenHour, setActiveGoldenHour] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadOptimalTimes();
    loadChecklist();
  }, [platform, user]);

  useEffect(() => {
    checkActiveGoldenHour();
    const interval = setInterval(checkActiveGoldenHour, 60000);
    return () => clearInterval(interval);
  }, [optimalTimes]);

  const loadOptimalTimes = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('golden-hour-scheduler', {
        body: {
          userId: user.id,
          action: 'get_optimal_times',
          platform
        }
      });

      if (error) throw error;
      setOptimalTimes(data.optimalTimes || []);
    } catch (error) {
      console.error('Error loading optimal times:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChecklist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('golden-hour-scheduler', {
        body: {
          userId: user.id,
          action: 'get_checklist',
          platform
        }
      });

      if (error) throw error;
      setChecklist(data.checklist || []);
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const checkActiveGoldenHour = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    const isGolden = optimalTimes.some(
      t => t.dayOfWeek === currentDay && t.hour === currentHour
    );
    setActiveGoldenHour(isGolden);
  };

  const toggleChecklistItem = (task: string) => {
    setChecklistState(prev => ({
      ...prev,
      [task]: !prev[task]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-950/30';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  const getTimeHeatmap = () => {
    const heatmap: Record<number, Record<number, { engagement: number; isOptimal: boolean }>> = {};

    for (let day = 0; day < 7; day++) {
      heatmap[day] = {};
      for (let hour = 6; hour < 22; hour++) {
        const match = optimalTimes.find(t => t.dayOfWeek === day && t.hour === hour);
        heatmap[day][hour] = {
          engagement: match?.avgEngagement || 0,
          isOptimal: !!match
        };
      }
    }

    return heatmap;
  };

  const heatmap = getTimeHeatmap();

  return (
    <div className="space-y-6">
      {activeGoldenHour && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-200 dark:bg-yellow-800 rounded-full">
                <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-200" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                  Golden Hour Active
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  This is the optimal time to post and engage on {platform}. Be ready to respond to every comment!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Golden Hour Schedule</h2>
          <p className="text-muted-foreground">Optimal posting times and engagement checklist</p>
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Best Times to Post
            </CardTitle>
            <CardDescription>
              {optimalTimes[0]?.source === 'learned'
                ? 'Based on your engagement data'
                : 'Default recommendations - will improve as you post'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2"></th>
                    {Array.from({ length: 16 }, (_, i) => i + 6).map(hour => (
                      <th key={hour} className="text-center px-1 py-2 text-xs">
                        {hour}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAY_NAMES.map((day, dayIndex) => (
                    <tr key={day}>
                      <td className="py-1 pr-2 text-xs font-medium">{day.slice(0, 3)}</td>
                      {Array.from({ length: 16 }, (_, i) => i + 6).map(hour => {
                        const cell = heatmap[dayIndex]?.[hour];
                        const isOptimal = cell?.isOptimal;
                        return (
                          <td key={hour} className="p-0.5">
                            <div
                              className={`w-4 h-4 rounded ${
                                isOptimal
                                  ? 'bg-green-500'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                              title={`${day} ${hour}:00 ${isOptimal ? '(Optimal)' : ''}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span>Golden Hour</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
                <span>Regular</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Golden Hour Checklist
            </CardTitle>
            <CardDescription>
              Complete these tasks during the first 60 minutes after posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${getPriorityColor(item.priority)}`}
                >
                  <Checkbox
                    checked={checklistState[item.task] || false}
                    onCheckedChange={() => toggleChecklistItem(item.task)}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${checklistState[item.task] ? 'line-through opacity-60' : ''}`}>
                      {item.task}
                    </p>
                    <p className="text-xs mt-1 opacity-80">{item.timing}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Posting Times for {platform}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {optimalTimes.slice(0, 5).map((time, index) => (
              <div
                key={index}
                className="text-center p-4 bg-muted rounded-lg"
              >
                <div className="font-bold text-lg">{time.dayName}</div>
                <div className="text-2xl font-bold text-primary">{time.formattedHour}</div>
                {time.avgEngagement !== null && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Avg: {Math.round(time.avgEngagement)}
                  </div>
                )}
                {time.source === 'learned' && (
                  <Badge variant="outline" className="mt-2 text-xs">Learned</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Golden Hour Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Reply to Every Comment</p>
                <p className="text-sm text-muted-foreground">
                  In the first 60 minutes, respond within 15 minutes. Ask follow-up questions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Share2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Cross-Share Early</p>
                <p className="text-sm text-muted-foreground">
                  Share to relevant groups and communities in the first 30 minutes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Engage with Others</p>
                <p className="text-sm text-muted-foreground">
                  Comment on similar content. The algorithm rewards active users.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoldenHourView;
