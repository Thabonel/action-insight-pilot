
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';

const BehavioralAutomation: React.FC = () => {
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Welcome Series',
      trigger: 'New signup',
      status: true,
      performance: 'High',
      conversionRate: 4.2,
      description: 'Sends 5-part educational sequence over 2 weeks'
    },
    {
      id: 2,
      name: 'Re-engagement',
      trigger: 'No activity 30 days',
      status: true,
      performance: 'Medium',
      conversionRate: 2.1,
      description: 'Wins back inactive subscribers'
    },
    {
      id: 3,
      name: 'Cart Abandonment',
      trigger: 'Abandoned cart',
      status: false,
      performance: 'Very High',
      conversionRate: 12.5,
      description: 'Recovers abandoned purchases'
    },
    {
      id: 4,
      name: 'Lead Nurture',
      trigger: 'Downloaded resource',
      status: true,
      performance: 'High',
      conversionRate: 6.8,
      description: 'Nurtures leads to conversion'
    }
  ]);

  const [triggers] = useState([
    {
      type: 'engagement',
      name: 'Email Opened',
      count: 145,
      description: 'User opened any email in last 7 days'
    },
    {
      type: 'behavior',
      name: 'Website Visit',
      count: 89,
      description: 'Visited specific product pages'
    },
    {
      type: 'time',
      name: 'Optimal Send Time',
      count: 234,
      description: 'User\'s peak engagement hours'
    },
    {
      type: 'scoring',
      name: 'Lead Score Increase',
      count: 67,
      description: 'Lead score increased by 20+ points'
    }
  ]);

  const [smartSequences] = useState([
    {
      name: 'Educational Drip',
      emails: 5,
      duration: '2 weeks',
      openRate: 42.3,
      conversionRate: 8.1
    },
    {
      name: 'Product Demo',
      emails: 3,
      duration: '1 week',
      openRate: 38.7,
      conversionRate: 15.2
    },
    {
      name: 'Customer Onboarding',
      emails: 7,
      duration: '1 month',
      openRate: 55.4,
      conversionRate: 12.8
    }
  ]);

  const handleToggleAutomation = (id: number) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, status: !auto.status } : auto
      )
    );
    behaviorTracker.trackAction('feature_use', 'email_automation_toggle', { automationId: id });
  };

  const handleCreateSequence = (sequenceName: string) => {
    behaviorTracker.trackAction('feature_use', 'email_sequence_create', { sequenceName });
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'Very High': return { variant: 'default' as const, color: 'text-green-600' };
      case 'High': return { variant: 'secondary' as const, color: 'text-blue-600' };
      case 'Medium': return { variant: 'outline' as const, color: 'text-yellow-600' };
      default: return { variant: 'destructive' as const, color: 'text-red-600' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Behavioral Automation</CardTitle>
          <DemoDataBadge />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Automations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Active Automations</h4>
          <div className="space-y-3">
            {automations.map((automation) => (
              <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={automation.status}
                      onCheckedChange={() => handleToggleAutomation(automation.id)}
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">{automation.name}</h5>
                      <p className="text-sm text-gray-600">{automation.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {automation.trigger}
                        </Badge>
                        <Badge {...getPerformanceBadge(automation.performance)} className="text-xs">
                          {automation.performance}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{automation.conversionRate}%</div>
                  <div className="text-xs text-gray-500">Conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Triggers */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smart Triggers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {triggers.map((trigger, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{trigger.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {trigger.count} today
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{trigger.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Sequences */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Optimized Sequences</h4>
          <div className="space-y-2">
            {smartSequences.map((sequence, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <span className="font-medium text-blue-900">{sequence.name}</span>
                  <div className="text-sm text-blue-700">
                    {sequence.emails} emails • {sequence.duration}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-900">{sequence.openRate}%</div>
                    <div className="text-xs text-blue-700">Opens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-900">{sequence.conversionRate}%</div>
                    <div className="text-xs text-blue-700">Converts</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCreateSequence(sequence.name)}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3">
          <Button className="flex-1">
            Create Automation
          </Button>
          <Button variant="outline">
            Optimize Timing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BehavioralAutomation;
