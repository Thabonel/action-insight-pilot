
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { behaviorTracker } from '@/lib/behavior-tracker';

const SmartLeadLists: React.FC = () => {
  const [leadLists] = useState([
    {
      id: 'hot',
      name: 'Hot Leads',
      description: 'High-probability conversions matching successful patterns',
      count: 87,
      avgScore: 92,
      conversionRate: 34,
      color: 'text-yellow-600 bg-yellow-50',
      leads: [
        { name: 'Sarah Chen', company: 'TechFlow', score: 95, reason: 'Perfect profile match' },
        { name: 'Mike Johnson', company: 'StartupXYZ', score: 93, reason: 'High engagement score' },
        { name: 'Lisa Wang', company: 'GrowthCorp', score: 91, reason: 'Industry + size match' }
      ]
    },
    {
      id: 'nurture',
      name: 'Nurture Leads',
      description: 'Good potential, need more engagement and education',
      count: 234,
      avgScore: 76,
      conversionRate: 18,
      color: 'text-blue-600 bg-blue-50',
      leads: [
        { name: 'David Martinez', company: 'MidSize Inc', score: 78, reason: 'Needs more touchpoints' },
        { name: 'Anna Kim', company: 'Enterprise Co', score: 75, reason: 'Long sales cycle expected' },
        { name: 'Tom Brown', company: 'B2B Solutions', score: 74, reason: 'Budget timing unclear' }
      ]
    },
    {
      id: 'quick-wins',
      name: 'Quick Wins',
      description: 'Fast conversion potential with immediate buying signals',
      count: 56,
      avgScore: 89,
      conversionRate: 45,
      color: 'text-green-600 bg-green-50',
      leads: [
        { name: 'Jennifer Lee', company: 'FastGrow', score: 91, reason: 'Active solution research' },
        { name: 'Robert Taylor', company: 'QuickStart', score: 88, reason: 'Budget approved' },
        { name: 'Amy Wilson', company: 'RapidScale', score: 87, reason: 'Urgent need identified' }
      ]
    },
    {
      id: 'strategic',
      name: 'Strategic Accounts',
      description: 'High-value prospects with longer sales cycles but big potential',
      count: 43,
      avgScore: 85,
      conversionRate: 12,
      color: 'text-purple-600 bg-purple-50',
      leads: [
        { name: 'Mark Thompson', company: 'Enterprise Plus', score: 87, reason: 'Large account potential' },
        { name: 'Susan Davis', company: 'Global Corp', score: 84, reason: 'Multi-year deal possible' },
        { name: 'Chris Anderson', company: 'MegaCorp', score: 83, reason: 'Strategic partnership' }
      ]
    },
    {
      id: 'learning',
      name: 'Learning Opportunities',
      description: 'New profile types to test and learn from',
      count: 78,
      avgScore: 68,
      conversionRate: 8,
      color: 'text-gray-600 bg-gray-50',
      leads: [
        { name: 'Kevin Park', company: 'NewVertical', score: 72, reason: 'Different industry test' },
        { name: 'Maria Rodriguez', company: 'Startup Alpha', score: 69, reason: 'New company size range' },
        { name: 'John Smith', company: 'Different Model', score: 66, reason: 'New business model' }
      ]
    }
  ]);

  const [selectedList, setSelectedList] = useState<string | null>(null);

  const handleListClick = (listId: string) => {
    setSelectedList(selectedList === listId ? null : listId);
    behaviorTracker.trackAction('feature_use', 'smart_lead_list_view', {
      listId,
      timestamp: new Date().toISOString()
    });
  };

  const handleLeadAction = (action: string, listId: string, leadName: string) => {
    behaviorTracker.trackAction('feature_use', 'smart_lead_action', {
      action,
      listId,
      leadName,
      timestamp: new Date().toISOString()
    });
  };

  const getActionButtons = (listId: string) => {
    switch (listId) {
      case 'hot':
        return [
          { label: 'Start Outreach', variant: 'default' as const },
          { label: 'Schedule Call', variant: 'outline' as const }
        ];
      case 'nurture':
        return [
          { label: 'Add to Sequence', variant: 'default' as const },
          { label: 'Schedule Follow-up', variant: 'outline' as const }
        ];
      case 'quick-wins':
        return [
          { label: 'Immediate Contact', variant: 'default' as const },
          { label: 'Send Proposal', variant: 'outline' as const }
        ];
      case 'strategic':
        return [
          { label: 'Research Account', variant: 'default' as const },
          { label: 'Plan Approach', variant: 'outline' as const }
        ];
      default:
        return [
          { label: 'Add to Campaign', variant: 'default' as const },
          { label: 'Mark for Review', variant: 'outline' as const }
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {leadLists.map((list) => {
          return (
            <Card
              key={list.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleListClick(list.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{list.name}</h3>
                <p className="text-2xl font-bold mb-1">{list.count}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg: {list.avgScore}</span>
                  <Badge variant="secondary" className="text-xs">
                    {list.conversionRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      {leadLists.map((list) => (
        <Card 
          key={`detail-${list.id}`} 
          className={selectedList === list.id ? 'ring-2 ring-blue-500' : ''}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{list.name}</h3>
                <p className="text-sm text-gray-600">{list.description}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold">{list.count}</p>
                  <p className="text-sm text-gray-600">leads</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">{list.conversionRate}%</p>
                  <p className="text-sm text-gray-600">conversion</p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          {selectedList === list.id && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={list.avgScore} className="flex-1" />
                      <span className="text-sm font-medium">{list.avgScore}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Expected Conversion</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={list.conversionRate} className="flex-1" />
                      <span className="text-sm font-medium">{list.conversionRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {list.leads.map((lead, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{lead.name}</h4>
                          <p className="text-sm text-gray-600">{lead.company}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Score: {lead.score}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{lead.reason}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {list.name}
                        </Badge>
                        <div className="flex space-x-2">
                          {getActionButtons(list.id).map((button, btnIndex) => (
                            <Button
                              key={btnIndex}
                              size="sm"
                              variant={button.variant}
                              onClick={() => handleLeadAction(button.label, list.id, lead.name)}
                            >
                              {button.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">
                    View All {list.count} Leads
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default SmartLeadLists;
