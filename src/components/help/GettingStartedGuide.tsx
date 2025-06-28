import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  PlayCircle, 
  Target, 
  Users, 
  BarChart3, 
  Zap,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface WorkflowGuide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: string[];
  path: string;
  color: string;
}

const workflowGuides: WorkflowGuide[] = [
  {
    id: 'campaign-creation',
    title: 'Create Your First Campaign',
    description: 'Learn how to set up effective marketing campaigns from start to finish.',
    icon: <Target className="h-6 w-6" />,
    duration: '10 min',
    difficulty: 'Beginner',
    steps: [
      'Choose campaign type and goals',
      'Set budget and timeline',
      'Create compelling content',
      'Launch and monitor performance'
    ],
    path: '/campaigns',
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: 'lead-management',
    title: 'Manage Leads Effectively',
    description: 'Track, score, and nurture leads to maximize conversion opportunities.',
    icon: <Users className="h-6 w-6" />,
    duration: '8 min',
    difficulty: 'Beginner',
    steps: [
      'Import or add new leads',
      'Understand lead scoring',
      'Track lead activities',
      'Convert leads to customers'
    ],
    path: '/leads',
    color: 'text-green-600 bg-green-100'
  },
  {
    id: 'analytics-insights',
    title: 'Understand Your Analytics',
    description: 'Read reports, track KPIs, and make data-driven decisions.',
    icon: <BarChart3 className="h-6 w-6" />,
    duration: '12 min',
    difficulty: 'Intermediate',
    steps: [
      'Navigate the analytics dashboard',
      'Interpret key metrics',
      'Create custom reports',
      'Export and share insights'
    ],
    path: '/analytics',
    color: 'text-purple-600 bg-purple-100'
  },
  {
    id: 'automation-setup',
    title: 'Set Up Automation',
    description: 'Automate repetitive tasks and create smart workflows.',
    icon: <Zap className="h-6 w-6" />,
    duration: '15 min',
    difficulty: 'Advanced',
    steps: [
      'Identify automation opportunities',
      'Configure trigger conditions',
      'Design workflow actions',
      'Test and optimize'
    ],
    path: '/automation',
    color: 'text-orange-600 bg-orange-100'
  }
];

export const GettingStartedGuide: React.FC = () => {
  const navigate = useNavigate();
  const { startOnboarding } = useOnboarding();

  const handleStartWorkflow = (guide: WorkflowGuide) => {
    // Create custom onboarding steps for each workflow
    const steps = guide.steps.map((step, index) => ({
      id: `${guide.id}-${index}`,
      title: `Step ${index + 1}: ${guide.title}`,
      content: step,
      target: `[data-onboarding="${guide.id}"]`,
      placement: 'right' as const
    }));

    startOnboarding(steps);
    navigate(guide.path);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Getting Started</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to Marketing Hub! Follow these guides to master the core workflows and boost your marketing success.
        </p>
      </div>

      {/* Quick Start Section */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            Quick Start Tour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            New to marketing platforms? Take our interactive tour to familiarize yourself with the interface and key features.
          </p>
          <Button onClick={() => window.location.reload()}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Interactive Tour
          </Button>
        </CardContent>
      </Card>

      {/* Workflow Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {workflowGuides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${guide.color}`}>
                  {guide.icon}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {guide.duration}
                  </Badge>
                  <Badge className={getDifficultyColor(guide.difficulty)}>
                    {guide.difficulty}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {guide.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm">What you'll learn:</h4>
                <ul className="space-y-1">
                  {guide.steps.map((step, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                onClick={() => handleStartWorkflow(guide)}
                className="w-full"
              >
                Start Guide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive guides and API references
              </p>
              <Button variant="outline" size="sm">
                Read Docs
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <PlayCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Step-by-step video walkthroughs
              </p>
              <Button variant="outline" size="sm">
                Watch Videos
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">Community</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with other users and experts
              </p>
              <Button variant="outline" size="sm">
                Join Community
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};