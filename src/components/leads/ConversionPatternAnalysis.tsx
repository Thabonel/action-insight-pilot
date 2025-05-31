
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MapPin, Building, Clock, Users } from 'lucide-react';

const ConversionPatternAnalysis: React.FC = () => {
  const sourcePerformance = [
    { source: 'LinkedIn', conversions: 87, rate: 34 },
    { source: 'Email Campaign', conversions: 65, rate: 28 },
    { source: 'Webinar', conversions: 43, rate: 31 },
    { source: 'Cold Outreach', conversions: 29, rate: 19 },
    { source: 'Referral', conversions: 52, rate: 67 }
  ];

  const industryData = [
    { name: 'SaaS', value: 35, color: '#3b82f6' },
    { name: 'E-commerce', value: 28, color: '#10b981' },
    { name: 'Fintech', value: 22, color: '#f59e0b' },
    { name: 'Healthcare', value: 15, color: '#ef4444' }
  ];

  const companySizeData = [
    { size: '1-50', conversions: 45, avgDays: 3.2 },
    { size: '51-200', conversions: 78, avgDays: 4.1 },
    { size: '201-1000', conversions: 62, avgDays: 5.8 },
    { size: '1000+', conversions: 34, avgDays: 8.3 }
  ];

  const timingData = [
    { time: '9-11 AM', conversions: 89, rate: 42 },
    { time: '11 AM-1 PM', conversions: 76, rate: 38 },
    { time: '1-3 PM', conversions: 54, rate: 29 },
    { time: '3-5 PM', conversions: 67, rate: 35 },
    { time: 'After 5 PM', conversions: 23, rate: 18 }
  ];

  const geographicData = [
    { region: 'West Coast', conversions: 123, rate: 36 },
    { region: 'East Coast', conversions: 98, rate: 31 },
    { region: 'Midwest', conversions: 67, rate: 28 },
    { region: 'South', conversions: 54, rate: 25 },
    { region: 'International', conversions: 45, rate: 22 }
  ];

  return (
    <div className="space-y-6">
      {/* Source Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Lead Source Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              rate: {
                label: "Conversion Rate %",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcePerformance}>
                <XAxis dataKey="source" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            {sourcePerformance.map((source) => (
              <div key={source.source} className="text-center">
                <p className="text-sm font-medium">{source.source}</p>
                <p className="text-lg font-bold text-blue-600">{source.rate}%</p>
                <p className="text-xs text-gray-500">{source.conversions} conversions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry and Company Size Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Industry Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Percentage",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {industryData.map((industry) => (
                <div key={industry.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: industry.color }}
                    />
                    <span className="text-sm">{industry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{industry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Company Size Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companySizeData.map((item) => (
                <div key={item.size} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.size} employees</span>
                    <Badge variant="outline">{item.conversions} conversions</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Average time to convert: <span className="font-medium">{item.avgDays} days</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timing and Geographic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Optimal Contact Timing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timingData.map((time) => (
                <div key={time.time} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{time.time}</p>
                    <p className="text-sm text-gray-600">{time.conversions} contacts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{time.rate}%</p>
                    <p className="text-xs text-gray-500">conversion rate</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Best Time:</strong> 9-11 AM shows highest conversion rates (42%)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <span>Geographic Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geographicData.map((region) => (
                <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{region.region}</p>
                    <p className="text-sm text-gray-600">{region.conversions} conversions</p>
                  </div>
                  <Badge 
                    variant={region.rate >= 30 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {region.rate}%
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Top Region:</strong> West Coast leads convert 36% higher than average
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionPatternAnalysis;
