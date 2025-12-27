import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  PlayCircle, 
  MessageSquare, 
  ArrowRight,
  Target,
  Users,
  BarChart3,
  Zap,
  Settings,
  FileText,
  HelpCircle,
  Lightbulb,
  Star
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: string;
  tags: string[];
  icon: React.ReactNode;
  content?: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'campaign-basics',
    title: 'Creating Your First Campaign',
    description: 'Step-by-step guide to setting up effective marketing campaigns',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '5 min',
    tags: ['campaigns', 'basics', 'setup'],
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'autopilot-setup',
    title: 'Marketing Autopilot Setup',
    description: 'Configure AI-powered autonomous marketing that runs 24/7',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '7 min',
    tags: ['autopilot', 'ai', 'automation'],
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 'ai-api-keys',
    title: 'Setting Up AI API Keys',
    description: 'Configure Claude and Gemini API keys for AI features (Required)',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '4 min',
    tags: ['setup', 'api-keys', 'claude', 'gemini'],
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: 'ai-video-studio',
    title: 'AI Video Generation with Gemini 3',
    description: 'Create professional marketing videos using AI - no editing skills required',
    category: 'AI Features',
    difficulty: 'Intermediate',
    readTime: '10 min',
    tags: ['video', 'ai', 'gemini', 'veo-3'],
    icon: <PlayCircle className="h-5 w-5" />
  },
  {
    id: 'conversational-dashboard',
    title: 'Using the AI Chat Dashboard',
    description: 'Get instant marketing insights and recommendations using Claude Opus 4.5',
    category: 'AI Features',
    difficulty: 'Beginner',
    readTime: '5 min',
    tags: ['ai', 'chat', 'claude', 'dashboard'],
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    id: 'lead-management',
    title: 'Understanding Lead Scoring',
    description: 'Learn how AI lead scoring works and how to use it effectively',
    category: 'Lead Management',
    difficulty: 'Beginner',
    readTime: '3 min',
    tags: ['leads', 'scoring', 'conversion'],
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'analytics-guide',
    title: 'Reading Your Analytics Dashboard',
    description: 'Understand key metrics and AI-powered insights for campaign performance',
    category: 'Analytics',
    difficulty: 'Intermediate',
    readTime: '8 min',
    tags: ['analytics', 'metrics', 'performance', 'ai'],
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: 'automation-workflows',
    title: 'Creating Marketing Workflows',
    description: 'Automate repetitive tasks and nurture leads on autopilot',
    category: 'Automation',
    difficulty: 'Advanced',
    readTime: '12 min',
    tags: ['automation', 'workflows', 'efficiency'],
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 'budget-optimization',
    title: 'Autopilot Budget Optimization',
    description: 'How AI automatically adjusts budgets based on campaign performance',
    category: 'Strategy',
    difficulty: 'Intermediate',
    readTime: '6 min',
    tags: ['budget', 'roi', 'optimization', 'autopilot'],
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'integration-setup',
    title: 'Connecting Social Media Platforms',
    description: 'Integrate Facebook, Instagram, Twitter, LinkedIn, TikTok, and more',
    category: 'Integrations',
    difficulty: 'Intermediate',
    readTime: '8 min',
    tags: ['integrations', 'social-media', 'platforms'],
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: 'simple-vs-advanced',
    title: 'Simple Mode vs Advanced Mode',
    description: 'Choose between simplified autopilot-focused UI or full feature access',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '3 min',
    tags: ['interface', 'modes', 'settings'],
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: 'ai-content-generation',
    title: 'AI Content Generation with Claude',
    description: 'Generate social media posts, emails, and marketing copy using Claude Opus 4.5',
    category: 'AI Features',
    difficulty: 'Beginner',
    readTime: '6 min',
    tags: ['ai', 'content', 'claude', 'copywriting'],
    icon: <FileText className="h-5 w-5" />
  }
];

const quickTips = [
  {
    title: 'Use descriptive campaign names',
    description: 'Include date, channel, and goal for easy identification',
    icon: <Lightbulb className="h-4 w-4 text-yellow-600" />
  },
  {
    title: 'Review lead scores weekly',
    description: 'High-scoring leads need immediate attention',
    icon: <Star className="h-4 w-4 text-blue-600" />
  },
  {
    title: 'Set realistic budgets',
    description: 'Start small and scale successful campaigns',
    icon: <Target className="h-4 w-4 text-green-600" />
  }
];

export const HelpDocumentation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(helpArticles.map(article => article.category))];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Help & Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Find guides, tutorials, and answers to common questions
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help articles, guides, or specific topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="text-xs"
            >
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Quick Tips */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Lightbulb className="h-5 w-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    {tip.icon}
                    <div>
                      <h4 className="font-medium text-sm text-blue-900">{tip.title}</h4>
                      <p className="text-xs text-blue-700">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {article.icon}
                      <Badge className={getDifficultyColor(article.difficulty)}>
                        {article.difficulty}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{article.readTime}</span>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {article.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full group">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse a different category
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-2">Full Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete API references and detailed guides
            </p>
            <Button variant="outline" size="sm">
              Browse Docs
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <PlayCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-2">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Watch step-by-step video guides
            </p>
            <Button variant="outline" size="sm">
              Watch Videos
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalized help from our team
            </p>
            <Button variant="outline" size="sm">
              Get Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};