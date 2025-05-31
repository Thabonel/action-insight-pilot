
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Star, TrendingUp, Users, Target, Clock } from 'lucide-react';

const LeadScoringDashboard: React.FC = () => {
  const [leads] = useState([
    {
      id: 1,
      name: 'Emily Chen',
      company: 'TechFlow Solutions',
      title: 'VP Marketing',
      score: 94,
      grade: 'A+',
      conversionProbability: 89,
      timeToConvert: '3-5 days',
      source: 'LinkedIn',
      industry: 'SaaS',
      companySize: '150 employees',
      engagement: 'High',
      factors: ['Industry match', 'Company size', 'High engagement', 'Previous interactions']
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      company: 'StartupBoost',
      title: 'Marketing Director',
      score: 87,
      grade: 'A',
      conversionProbability: 76,
      timeToConvert: '5-7 days',
      source: 'Email Campaign',
      industry: 'Fintech',
      companySize: '75 employees',
      engagement: 'Medium',
      factors: ['Job title match', 'Company growth', 'Email engagement']
    },
    {
      id: 3,
      name: 'Sarah Kim',
      company: 'Enterprise Corp',
      title: 'CMO',
      score: 82,
      grade: 'B+',
      conversionProbability: 68,
      timeToConvert: '7-10 days',
      source: 'Webinar',
      industry: 'Enterprise',
      companySize: '500+ employees',
      engagement: 'High',
      factors: ['Senior position', 'Large budget', 'Content engagement']
    }
  ]);

  const scoreDistribution = [
    { range: '90-100', count: 47, color: '#10b981' },
    { range: '80-89', count: 123, color: '#3b82f6' },
    { range: '70-79', count: 234, color: '#f59e0b' },
    { range: '60-69', count: 189, color: '#ef4444' },
    { range: '<60', count: 95, color: '#6b7280' }
  ];

  const conversionTrend = [
    { week: 'Week 1', predicted: 23, actual: 21 },
    { week: 'Week 2', predicted: 28, actual: 26 },
    { week: 'Week 3', predicted: 31, actual: 29 },
    { week: 'Week 4', predicted: 34, actual: 32 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleLeadClick = (lead: any) => {
    behaviorTracker.trackAction('feature_use', 'lead_scoring_view', {
      leadId: lead.id,
      score: lead.score,
      conversionProbability: lead.conversionProbability
    });
  };

  return (
    <div className="space-y-6">
      {/* Score Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Lead Score Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Leads",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Conversion Prediction Accuracy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                predicted: {
                  label: "Predicted",
                  color: "hsl(var(--chart-1))",
                },
                actual: {
                  label: "Actual",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionTrend}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Scored Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>High-Score Leads</span>
            </div>
            <Badge variant="outline">Updated 5 min ago</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleLeadClick(lead)}
                className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getGradeColor(lead.grade)}`}>
                      {lead.grade}
                    </div>
                    <div>
                      <h4 className="font-semibold">{lead.name}</h4>
                      <p className="text-sm text-gray-600">{lead.title} at {lead.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(lead.score)}`}>
                      Score: {lead.score}
                    </div>
                    <Badge variant="outline">
                      {lead.conversionProbability}% conversion
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Industry:</span>
                    <span className="ml-1 font-medium">{lead.industry}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Size:</span>
                    <span className="ml-1 font-medium">{lead.companySize}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Source:</span>
                    <span className="ml-1 font-medium">{lead.source}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Est. Time:</span>
                    <span className="ml-1 font-medium">{lead.timeToConvert}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Key Scoring Factors:</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.factors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">Conversion Probability:</div>
                    <Progress value={lead.conversionProbability} className="w-24" />
                    <span className="text-sm font-medium">{lead.conversionProbability}%</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm">
                      Start Outreach
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadScoringDashboard;
