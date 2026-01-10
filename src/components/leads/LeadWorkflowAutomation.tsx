
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface Workflow {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused';
  lastRun: string;
  results: number;
  successRate: number;
  trigger: string;
  action: string;
}

interface QuickAction {
  label: string;
  description: string;
  confidence: number;
  estimatedResults: number;
  action: string;
}

interface SearchCriteria {
  minScore: string;
  industry: string;
  companySize: string;
  source: string;
}

const LeadWorkflowAutomation: React.FC = () => {
  const [activeWorkflows] = useState<Workflow[]>([
    {
      id: 1,
      name: 'Find Similar High Converters',
      description: 'Automatically find leads matching your top converting profiles',
      status: 'active',
      lastRun: '2 hours ago',
      results: 47,
      successRate: 89,
      trigger: 'Daily at 9 AM',
      action: 'search_similar_leads'
    },
    {
      id: 2,
      name: 'Score New Leads',
      description: 'Apply updated scoring algorithm to all new leads',
      status: 'active',
      lastRun: '15 minutes ago',
      results: 156,
      successRate: 92,
      trigger: 'Every hour',
      action: 'score_leads'
    },
    {
      id: 3,
      name: 'Export Hot Leads',
      description: 'Automatically export leads with score >85 for immediate outreach',
      status: 'paused',
      lastRun: '1 day ago',
      results: 23,
      successRate: 76,
      trigger: 'Twice daily',
      action: 'export_hot_leads'
    },
    {
      id: 4,
      name: 'Nurture Sequence Assignment',
      description: 'Add medium-score leads to automated nurture sequences',
      status: 'active',
      lastRun: '4 hours ago',
      results: 89,
      successRate: 67,
      trigger: 'Daily at 2 PM',
      action: 'assign_nurture'
    }
  ]);

  const [quickActions] = useState<QuickAction[]>([
    {
      label: 'Find 50 more leads like best converters',
      description: 'Search for leads matching your top 10 converting profiles',
      confidence: 94,
      estimatedResults: 50,
      action: 'find_similar_leads'
    },
    {
      label: 'Score all leads with new pattern data',
      description: 'Apply latest conversion patterns to rescore all leads',
      confidence: 88,
      estimatedResults: 2847,
      action: 'rescore_all_leads'
    },
    {
      label: 'Export hot leads for immediate outreach',
      description: 'Get CSV of all leads with 85+ score for direct contact',
      confidence: 92,
      estimatedResults: 87,
      action: 'export_hot_leads'
    },
    {
      label: 'Create email sequence for nurture leads',
      description: 'Set up automated email series for medium-score prospects',
      confidence: 85,
      estimatedResults: 234,
      action: 'create_nurture_sequence'
    },
    {
      label: 'Track conversion patterns by source',
      description: 'Analyze which lead sources are converting best',
      confidence: 91,
      estimatedResults: 5,
      action: 'analyze_source_patterns'
    }
  ]);

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    minScore: '85',
    industry: '',
    companySize: '',
    source: ''
  });

  const handleWorkflowToggle = (workflowId: number, currentStatus: Workflow['status']) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    behaviorTracker.trackAction('feature_use', 'workflow_toggle', {
      workflowId,
      newStatus,
      timestamp: new Date().toISOString()
    });
  };

  const handleQuickAction = (action: QuickAction) => {
    behaviorTracker.trackAction('feature_use', 'lead_automation_quick_action', {
      action: action.action,
      confidence: action.confidence,
      estimatedResults: action.estimatedResults
    });
  };

  const handleCustomSearch = () => {
    behaviorTracker.trackAction('feature_use', 'lead_custom_automation', {
      criteria: searchCriteria,
      timestamp: new Date().toISOString()
    });
  };

  const getStatusColor = (status: Workflow['status']) => {
    return status === 'active' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const getStatusText = (status: Workflow['status']) => {
    return status === 'active' ? 'Active' : 'Paused';
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={() => handleQuickAction(action)}
                className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{action.label}</h4>
                    <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {action.confidence}% confidence
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ~{action.estimatedResults} results
                        </span>
                      </div>
                      <Button size="sm">Run Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Automation Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Custom Lead Automation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Score</label>
                <Input
                  type="number"
                  placeholder="85"
                  value={searchCriteria.minScore}
                  onChange={(e) => setSearchCriteria({...searchCriteria, minScore: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="fintech">Fintech</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">1-50</SelectItem>
                    <SelectItem value="small">51-200</SelectItem>
                    <SelectItem value="medium">201-1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleCustomSearch} className="flex items-center space-x-2">
                <span>Find Matching Leads</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Schedule Automation</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Active Workflows</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {getStatusText(workflow.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWorkflowToggle(workflow.id, workflow.status)}
                    >
                      {workflow.status === 'active' ? 'Pause' : 'Play'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Last Run:</span>
                    <span className="ml-1 font-medium">{workflow.lastRun}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Results:</span>
                    <span className="ml-1 font-medium">{workflow.results}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="ml-1 font-medium text-green-600">{workflow.successRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trigger:</span>
                    <span className="ml-1 font-medium">{workflow.trigger}</span>
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

export default LeadWorkflowAutomation;
