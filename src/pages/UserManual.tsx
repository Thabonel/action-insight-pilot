import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  LogIn, 
  BarChart3, 
  PlusCircle, 
  Share2, 
  Users, 
  Mail, 
  TrendingUp, 
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  FileText,
  Database,
  MessageSquare,
  Shield,
  Zap,
  Target,
  Brain
} from 'lucide-react';

const UserManual: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: LogIn },
    { id: 'dashboard', title: 'Dashboard Navigation', icon: BarChart3 },
    { id: 'campaigns', title: 'Campaign Management', icon: PlusCircle },
    { id: 'knowledge', title: 'Knowledge Management', icon: Database },
    { id: 'ai-assistant', title: 'AI Assistant & Chat', icon: Brain },
    { id: 'content', title: 'Content Creation', icon: Share2 },
    { id: 'leads', title: 'Lead Management', icon: Users },
    { id: 'email', title: 'Email Automation', icon: Mail },
    { id: 'social', title: 'Social Media', icon: Calendar },
    { id: 'proposals', title: 'Proposal Generator', icon: FileText },
    { id: 'analytics', title: 'Analytics & Reports', icon: TrendingUp },
    { id: 'settings', title: 'Settings & Admin', icon: Settings },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: HelpCircle }
  ];

  const ProTip = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
      <div className="flex items-start">
        <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">Pro Tip</p>
          <p className="text-sm text-blue-700">{children}</p>
        </div>
      </div>
    </div>
  );

  const Warning = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Important</p>
          <p className="text-sm text-yellow-700">{children}</p>
        </div>
      </div>
    </div>
  );

  const Success = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">Success Indicator</p>
          <p className="text-sm text-green-700">{children}</p>
        </div>
      </div>
    </div>
  );

  const StepList = ({ steps }: { steps: string[] }) => (
    <ol className="list-decimal list-inside space-y-2 ml-4">
      {steps.map((step, index) => (
        <li key={index} className="text-gray-700">{step}</li>
      ))}
    </ol>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Complete User Manual</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Complete guide to using your Agentic AI Marketing Platform - Every feature explained
        </p>
        <Badge variant="secondary" className="mt-2">Version 2.0 - Complete Edition</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeSection === section.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-8">
              {/* Getting Started */}
              {activeSection === 'getting-started' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Welcome to Your AI Marketing Platform</h3>
                      <p className="text-gray-700 mb-4">
                        This platform combines the power of AI with comprehensive marketing tools to help you create, manage, and optimize your marketing campaigns across multiple channels.
                      </p>
                      
                      <h4 className="font-semibold mb-2">First Steps:</h4>
                      <StepList steps={[
                        "Complete your account setup and profile information",
                        "Navigate to Settings > API Keys to configure your OpenAI API key for AI features",
                        "Explore the Dashboard to understand your marketing overview",
                        "Set up your first Knowledge Bucket in Settings > Knowledge Management",
                        "Create your first campaign using the Campaign Management section",
                        "Connect your social media and email platforms in Settings > Integrations"
                      ]} />

                      <Success>
                        Your platform is ready when you see your Dashboard populated with data and your AI Assistant responding to queries.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Platform Overview</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Brain className="h-4 w-4 mr-2 text-blue-500" />
                            AI-Powered Core
                          </h5>
                          <p className="text-sm text-gray-600">Conversational AI assistant, automated content generation, smart recommendations</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Database className="h-4 w-4 mr-2 text-green-500" />
                            Knowledge Management
                          </h5>
                          <p className="text-sm text-gray-600">Organize marketing knowledge, best practices, and campaign data for AI access</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-purple-500" />
                            Campaign Intelligence
                          </h5>
                          <p className="text-sm text-gray-600">Create, optimize, and automate marketing campaigns with AI insights</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-orange-500" />
                            Automation Hub
                          </h5>
                          <p className="text-sm text-gray-600">Workflow automation, email sequences, social posting, and lead nurturing</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Navigation Guide</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Dashboard</p>
                            <p className="text-sm text-gray-600">Main overview, performance metrics, recent activity</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                          <MessageSquare className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Conversational AI</p>
                            <p className="text-sm text-gray-600">Chat with AI assistant, get recommendations, ask questions</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                          <PlusCircle className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium">Campaign Management</p>
                            <p className="text-sm text-gray-600">Create, edit, and monitor marketing campaigns</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                          <Settings className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Settings</p>
                            <p className="text-sm text-gray-600">API keys, integrations, knowledge management, user preferences</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Navigation */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Navigation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Dashboard Overview</h3>
                      <p className="text-gray-700 mb-4">
                        The Dashboard is your command center, providing real-time insights into your marketing performance and quick access to key features.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Dashboard Sections:</h4>
                      <div className="space-y-3">
                        <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                          <h5 className="font-semibold text-blue-800">Performance Overview</h5>
                          <p className="text-sm text-blue-600">Key metrics, campaign performance, ROI tracking, conversion rates</p>
                        </div>
                        <div className="p-4 border-l-4 border-green-400 bg-green-50">
                          <h5 className="font-semibold text-green-800">Recent Activity</h5>
                          <p className="text-sm text-green-600">Latest campaigns, content published, leads generated, AI interactions</p>
                        </div>
                        <div className="p-4 border-l-4 border-purple-400 bg-purple-50">
                          <h5 className="font-semibold text-purple-800">Quick Actions</h5>
                          <p className="text-sm text-purple-600">Create campaign, generate content, analyze performance, schedule posts</p>
                        </div>
                        <div className="p-4 border-l-4 border-orange-400 bg-orange-50">
                          <h5 className="font-semibold text-orange-800">AI Insights</h5>
                          <p className="text-sm text-orange-600">Recommendations, optimization suggestions, trend analysis, next actions</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Understanding Dashboard Widgets</h3>
                      <StepList steps={[
                        "Campaign Performance: Shows active campaigns, success rates, and budget efficiency",
                        "Content Pipeline: Track content creation, publishing schedule, and engagement rates",
                        "Lead Flow: Monitor lead generation, qualification status, and conversion funnel",
                        "AI Activity: Review AI-generated content, recommendations, and automated tasks",
                        "Revenue Attribution: See which campaigns and channels drive the most revenue",
                        "Upcoming Tasks: AI-suggested priorities and scheduled activities"
                      ]} />

                      <ProTip>
                        Click on any metric or chart to drill down into detailed analytics and historical data.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Customizing Your Dashboard</h3>
                      <StepList steps={[
                        "Click the 'Customize' button in the top right of the dashboard",
                        "Drag and drop widgets to rearrange their position",
                        "Click the 'X' on widgets you don't need to hide them",
                        "Use the '+ Add Widget' button to include additional metrics",
                        "Set date ranges for performance comparisons",
                        "Save your layout as the default view"
                      ]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign Management */}
              {activeSection === 'campaigns' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Campaign Intelligence Hub</h3>
                      <p className="text-gray-700 mb-4">
                        Create, monitor, and optimize your marketing campaigns with AI-powered insights and automation.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Creating a New Campaign:</h4>
                      <StepList steps={[
                        "Navigate to Campaign Management from the main menu",
                        "Click 'Create' button in the top navigation",
                        "Choose from campaign templates or start from scratch:",
                        "• Email Marketing Campaign",
                        "• Social Media Campaign", 
                        "• Multi-Channel Campaign",
                        "• Product Launch Campaign",
                        "• Lead Generation Campaign",
                        "Fill in campaign details: name, description, objectives",
                        "Set target audience and demographics",
                        "Define budget and timeline parameters",
                        "Select channels and platforms",
                        "Review AI suggestions for optimization",
                        "Launch or schedule your campaign"
                      ]} />

                      <Success>
                        Well-configured campaigns with clear objectives see 40% better performance than generic campaigns.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Campaign Templates</h3>
                      <p className="text-gray-700 mb-4">
                        Use proven templates to quick-start your campaigns with industry best practices built-in.
                      </p>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 text-blue-700">Email Marketing Template</h5>
                          <p className="text-sm text-gray-600 mb-2">Perfect for newsletters, product announcements, nurture sequences</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Pre-built email sequences</li>
                            <li>• A/B testing configurations</li>
                            <li>• Automation triggers</li>
                            <li>• Performance tracking</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 text-green-700">Social Media Template</h5>
                          <p className="text-sm text-gray-600 mb-2">Multi-platform social campaigns with scheduling</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Platform-specific content</li>
                            <li>• Optimal posting times</li>
                            <li>• Hashtag strategies</li>
                            <li>• Engagement tracking</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 text-purple-700">Lead Generation Template</h5>
                          <p className="text-sm text-gray-600 mb-2">Capture and nurture leads through the sales funnel</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Lead magnets and forms</li>
                            <li>• Scoring algorithms</li>
                            <li>• Nurture sequences</li>
                            <li>• Sales handoff process</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-semibold mb-2 text-orange-700">Product Launch Template</h5>
                          <p className="text-sm text-gray-600 mb-2">Comprehensive launch campaigns across channels</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Pre-launch buzz building</li>
                            <li>• Launch day coordination</li>
                            <li>• Post-launch optimization</li>
                            <li>• Cross-channel messaging</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Powered Campaign Features</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-semibold text-blue-700 mb-2">Intelligent Campaign Creator</h5>
                          <p className="text-sm text-blue-600">AI analyzes your goals and automatically suggests campaign structure, content, and optimization strategies.</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-semibold text-green-700 mb-2">Performance Dashboard</h5>
                          <p className="text-sm text-green-600">Real-time campaign analytics with AI-powered insights and recommendations for improvement.</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h5 className="font-semibold text-purple-700 mb-2">Timing Intelligence</h5>
                          <p className="text-sm text-purple-600">AI determines optimal send times, posting schedules, and campaign timing based on your audience behavior.</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h5 className="font-semibold text-orange-700 mb-2">Workflow Automation</h5>
                          <p className="text-sm text-orange-600">Automated campaign management with smart triggers for scaling, pausing, or optimizing based on performance.</p>
                        </div>
                      </div>

                      <ProTip>
                        Let the AI analyze your past campaign performance to suggest improvements for new campaigns. Historical data makes AI recommendations more accurate.
                      </ProTip>
                    </div>
                  </div>
                </div>
              )}

              {/* Knowledge Management */}
              {activeSection === 'knowledge' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Knowledge Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Organizing Marketing Knowledge</h3>
                      <p className="text-gray-700 mb-4">
                        The Knowledge Management system allows you to organize, store, and make your marketing knowledge accessible to AI agents for better recommendations and assistance.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Accessing Knowledge Management:</h4>
                      <StepList steps={[
                        "Go to Settings in the main navigation",
                        "Click on 'Knowledge Management' section",
                        "Or navigate directly via the Settings page"
                      ]} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Knowledge Buckets</h3>
                      <p className="text-gray-700 mb-4">
                        Knowledge is organized into "buckets" - containers that group related information for easy access and AI processing.
                      </p>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                          <h5 className="font-semibold text-blue-800 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Campaign Buckets
                          </h5>
                          <p className="text-sm text-blue-600 mt-2">Campaign-specific knowledge tied to individual marketing campaigns</p>
                          <ul className="text-xs text-blue-500 mt-2 space-y-1">
                            <li>• Campaign briefs and strategies</li>
                            <li>• Target audience research</li>
                            <li>• Brand guidelines for specific campaigns</li>
                            <li>• Performance data and learnings</li>
                          </ul>
                        </div>
                        <div className="p-4 border-l-4 border-green-400 bg-green-50">
                          <h5 className="font-semibold text-green-800 flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            General Buckets
                          </h5>
                          <p className="text-sm text-green-600 mt-2">Industry knowledge and best practices for all campaigns</p>
                          <ul className="text-xs text-green-500 mt-2 space-y-1">
                            <li>• Marketing industry trends</li>
                            <li>• Best practices and methodologies</li>
                            <li>• Company brand guidelines</li>
                            <li>• Competitive analysis</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Creating Knowledge Buckets</h3>
                      <StepList steps={[
                        "In Knowledge Management, click 'New Bucket'",
                        "Choose bucket type:",
                        "• Campaign-specific: Link to a specific campaign",
                        "• General: Available across all campaigns and AI interactions",
                        "Enter bucket name and description",
                        "For campaign buckets, select the associated campaign",
                        "Click 'Create Bucket' to save"
                      ]} />

                      <Success>
                        Well-organized knowledge buckets improve AI response accuracy by up to 60% and reduce response time significantly.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Uploading Documents</h3>
                      <StepList steps={[
                        "Click 'Upload Document' button in Knowledge Management",
                        "Select the target knowledge bucket",
                        "Choose your document or paste content directly:",
                        "• Text files (.txt, .md)",
                        "• PDF documents", 
                        "• Word documents",
                        "• JSON data files",
                        "• Direct text input",
                        "Enter document title and description",
                        "Click 'Upload' to process the document",
                        "Wait for AI processing to complete (status: Ready)"
                      ]} />

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Document Processing Status</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span><strong>Processing:</strong> Document is being analyzed and indexed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span><strong>Ready:</strong> Document is available for AI search and retrieval</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span><strong>Failed:</strong> Processing error - try re-uploading or contact support</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Searching Your Knowledge Base</h3>
                      <StepList steps={[
                        "Click 'Search Knowledge' in Knowledge Management",
                        "Enter your search query (use natural language)",
                        "Optionally filter by:",
                        "• Bucket type (Campaign or General)",
                        "• Specific campaign (for campaign buckets)",
                        "Click 'Search' to find relevant content",
                        "Review results with similarity scores",
                        "Click on results to see full content"
                      ]} />

                      <ProTip>
                        Use specific, natural language queries like "social media best practices for B2B" rather than single keywords for better search results.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Best Practices for Knowledge Management</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800">Organization Strategy</h5>
                          <ul className="text-sm text-blue-600 mt-1 space-y-1">
                            <li>• Create separate buckets for different topics or campaigns</li>
                            <li>• Use descriptive names and detailed descriptions</li>
                            <li>• Regularly update and maintain your knowledge base</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-400">
                          <h5 className="font-semibold text-green-800">Content Quality</h5>
                          <ul className="text-sm text-green-600 mt-1 space-y-1">
                            <li>• Upload high-quality, relevant documents</li>
                            <li>• Include context and background information</li>
                            <li>• Keep documents focused and well-structured</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-purple-50 border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-800">AI Integration</h5>
                          <ul className="text-sm text-purple-600 mt-1 space-y-1">
                            <li>• AI automatically uses this knowledge in conversations</li>
                            <li>• More relevant knowledge = better AI responses</li>
                            <li>• Knowledge is searchable via semantic similarity</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Assistant & Chat */}
              {activeSection === 'ai-assistant' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">AI Assistant & Chat</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Conversational AI Dashboard</h3>
                      <p className="text-gray-700 mb-4">
                        Your AI assistant provides personalized marketing insights, recommendations, and help based on your campaigns and knowledge base.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Accessing the AI Assistant:</h4>
                      <StepList steps={[
                        "Navigate to 'Conversational AI' from the main menu",
                        "Ensure your OpenAI API key is configured in Settings > API Keys",
                        "Start typing your question or request in the chat interface",
                        "Press Enter or click Send to get AI-powered responses"
                      ]} />

                      <Warning>
                        You must configure your OpenAI API key in Settings before the AI assistant can respond to your queries.
                      </Warning>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Types of AI Assistance</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-semibold text-blue-700 mb-2">Daily Focus Recommendations</h5>
                          <p className="text-sm text-blue-600 mb-2">Get personalized daily priorities based on your campaigns and goals.</p>
                          <p className="text-xs text-blue-500 font-mono">Example: "What should I focus on today?" or "Give me my daily marketing priorities"</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-semibold text-green-700 mb-2">Campaign Analysis</h5>
                          <p className="text-sm text-green-600 mb-2">Get insights and optimization suggestions for your campaigns.</p>
                          <p className="text-xs text-green-500 font-mono">Example: "How are my campaigns performing?" or "What can I improve in my email campaign?"</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h5 className="font-semibold text-purple-700 mb-2">Strategy Questions</h5>
                          <p className="text-sm text-purple-600 mb-2">Ask about marketing strategies, best practices, and industry insights.</p>
                          <p className="text-xs text-purple-500 font-mono">Example: "What's the best way to increase email open rates?" or "How do I improve my social media engagement?"</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h5 className="font-semibold text-orange-700 mb-2">Platform Help</h5>
                          <p className="text-sm text-orange-600 mb-2">Get help with using platform features and navigating the interface.</p>
                          <p className="text-xs text-orange-500 font-mono">Example: "How do I create a knowledge bucket?" or "Where do I find my campaign analytics?"</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Enhanced Responses</h3>
                      <p className="text-gray-700 mb-4">
                        The AI assistant leverages your knowledge base to provide personalized, contextual responses.
                      </p>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">Knowledge-Enhanced AI</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• AI searches your knowledge base for relevant information</li>
                          <li>• Responses incorporate your specific documents and data</li>
                          <li>• Recommendations are tailored to your business context</li>
                          <li>• References specific knowledge sources in responses</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Server Status & Wake-Up</h3>
                      <p className="text-gray-700 mb-4">
                        The AI backend may sleep during periods of inactivity to save resources. Here's how to handle this:
                      </p>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border-l-4 border-gray-400">
                          <h5 className="font-semibold text-gray-800">Server Status Indicators</h5>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            <li>• <span className="font-mono bg-green-100 px-1">Active</span> - AI is ready to respond immediately</li>
                            <li>• <span className="font-mono bg-yellow-100 px-1">Sleeping</span> - Server needs to wake up (may take 30-60 seconds)</li>
                            <li>• <span className="font-mono bg-red-100 px-1">Error</span> - Connection issues or configuration problems</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800">Wake-Up Process</h5>
                          <StepList steps={[
                            "If server is sleeping, you'll see a notification",
                            "Click 'Wake Up Server' or submit your question anyway",
                            "Wait 30-60 seconds for the server to become active",
                            "Your question will be processed once the server is ready",
                            "Subsequent questions will be answered immediately"
                          ]} />
                        </div>
                      </div>

                      <ProTip>
                        Keep the AI assistant active by asking questions regularly. Active servers provide faster response times.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Best Practices for AI Conversations</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <h5 className="font-semibold text-green-700">✅ Effective Questions</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Be specific about your goals</li>
                            <li>• Provide context about your business</li>
                            <li>• Ask for actionable recommendations</li>
                            <li>• Reference specific campaigns or data</li>
                            <li>• Ask follow-up questions for clarity</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h5 className="font-semibold text-red-700">❌ Less Effective Approaches</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Vague or overly broad questions</li>
                            <li>• Questions without business context</li>
                            <li>• Expecting AI to know undocumented details</li>
                            <li>• Not building on previous conversation</li>
                            <li>• Ignoring AI recommendations without feedback</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Creation */}
              {activeSection === 'content' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Content Creation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Powered Content Generation</h3>
                      <p className="text-gray-700 mb-4">
                        Create engaging marketing content across multiple channels using AI assistance tailored to your brand and audience.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Content Types Available:</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-blue-700">Email Content</h5>
                          <p className="text-xs text-gray-600">Subject lines, email copy, newsletters, sequences</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-green-700">Social Media Posts</h5>
                          <p className="text-xs text-gray-600">Platform-specific posts, captions, hashtags</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-purple-700">Blog Articles</h5>
                          <p className="text-xs text-gray-600">SEO-optimized articles, thought leadership pieces</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-orange-700">Ad Copy</h5>
                          <p className="text-xs text-gray-600">PPC ads, social media ads, display copy</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Using AI for Content Creation</h3>
                      <StepList steps={[
                        "Ask the AI assistant for content: 'Create a social media post about [topic]'",
                        "Provide context: target audience, brand voice, key messages",
                        "Specify platform requirements (character limits, hashtags, etc.)",
                        "Review AI-generated content suggestions",
                        "Request revisions or variations: 'Make it more professional' or 'Add more urgency'",
                        "Copy the final content to your clipboard or campaign",
                        "Track performance and provide feedback to improve future content"
                      ]} />

                      <ProTip>
                        The more context you provide about your brand voice and audience, the better the AI-generated content will match your style.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Content Optimization Tips</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800">Brand Consistency</h5>
                          <ul className="text-sm text-blue-600 mt-2 space-y-1">
                            <li>• Upload brand guidelines to your knowledge base</li>
                            <li>• Maintain consistent voice and tone across content</li>
                            <li>• Include brand-specific terminology and messaging</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-green-50 border-l-4 border-green-400">
                          <h5 className="font-semibold text-green-800">Platform Optimization</h5>
                          <ul className="text-sm text-green-600 mt-2 space-y-1">
                            <li>• Adapt content length for platform requirements</li>
                            <li>• Use platform-specific features (hashtags, mentions, etc.)</li>
                            <li>• Consider visual elements and formatting</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-800">Performance Tracking</h5>
                          <ul className="text-sm text-purple-600 mt-2 space-y-1">
                            <li>• A/B test different content variations</li>
                            <li>• Track engagement metrics and conversion rates</li>
                            <li>• Use successful content as templates for future creation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Management */}
              {activeSection === 'leads' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Enhanced Lead Processing</h3>
                      <p className="text-gray-700 mb-4">
                        Track, score, and nurture leads through your sales funnel with AI-powered insights and automation.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Lead Management Features:</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800">Lead Scoring</h5>
                          <p className="text-sm text-blue-600">AI automatically scores leads based on engagement, demographics, and behavior patterns</p>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-400">
                          <h5 className="font-semibold text-green-800">Lead Enrichment</h5>
                          <p className="text-sm text-green-600">Enhance lead profiles with additional data and insights from multiple sources</p>
                        </div>
                        <div className="p-3 bg-purple-50 border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-800">Nurture Sequences</h5>
                          <p className="text-sm text-purple-600">Automated email sequences based on lead behavior and scoring</p>
                        </div>
                        <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                          <h5 className="font-semibold text-orange-800">Sales Handoff</h5>
                          <p className="text-sm text-orange-600">Seamless transfer of qualified leads to sales team with full context</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Lead Lifecycle Management</h3>
                      <StepList steps={[
                        "Lead Capture: Forms, landing pages, social media, referrals",
                        "Initial Scoring: AI assigns preliminary score based on source and data",
                        "Enrichment: Additional data gathering and profile completion",
                        "Qualification: Behavior tracking and engagement scoring",
                        "Nurturing: Automated sequences based on lead score and interests",
                        "Sales Ready: High-score leads automatically flagged for sales",
                        "Handoff: Complete lead profile and history transferred to sales team"
                      ]} />

                      <Success>
                        Properly nurtured leads convert 50% more often than leads without nurturing sequences.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Using AI for Lead Insights</h3>
                      <p className="text-gray-700 mb-4">
                        Ask your AI assistant for lead-related insights and recommendations:
                      </p>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-blue-600">"Show me my highest-scoring leads this week"</p>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-green-600">"What's the best way to nurture leads in the technology sector?"</p>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-purple-600">"How can I improve my lead conversion rates?"</p>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-orange-600">"Create a nurture sequence for B2B software leads"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Automation */}
              {activeSection === 'email' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Email Automation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Automated Email Campaigns</h3>
                      <p className="text-gray-700 mb-4">
                        Create, schedule, and optimize email campaigns with AI-powered personalization and performance tracking.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Email Campaign Types:</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-blue-700">Newsletter Campaigns</h5>
                          <p className="text-xs text-gray-600">Regular updates, company news, industry insights</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-green-700">Drip Sequences</h5>
                          <p className="text-xs text-gray-600">Automated nurture series, onboarding flows</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-purple-700">Promotional Emails</h5>
                          <p className="text-xs text-gray-600">Product launches, sales, special offers</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-orange-700">Transactional Emails</h5>
                          <p className="text-xs text-gray-600">Order confirmations, receipts, notifications</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Powered Email Features</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-semibold text-blue-700 mb-2">Subject Line Optimization</h5>
                          <p className="text-sm text-blue-600">AI generates and tests multiple subject line variations to maximize open rates</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-semibold text-green-700 mb-2">Content Personalization</h5>
                          <p className="text-sm text-green-600">Dynamic content based on recipient behavior, preferences, and demographics</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h5 className="font-semibold text-purple-700 mb-2">Send Time Optimization</h5>
                          <p className="text-sm text-purple-600">AI determines optimal send times for each recipient based on engagement patterns</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h5 className="font-semibold text-orange-700 mb-2">Performance Insights</h5>
                          <p className="text-sm text-orange-600">AI analyzes performance data and provides recommendations for improvement</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Creating Email Sequences</h3>
                      <StepList steps={[
                        "Ask AI assistant: 'Create an email welcome sequence for new subscribers'",
                        "Specify your audience and goals",
                        "Review AI-generated email sequence structure",
                        "Customize content for your brand voice",
                        "Set timing intervals between emails",
                        "Configure triggers and conditions",
                        "Test the sequence with a small audience",
                        "Launch and monitor performance metrics"
                      ]} />

                      <ProTip>
                        Start with a simple 3-email welcome sequence before building more complex nurture campaigns.
                      </ProTip>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {activeSection === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Multi-Platform Social Strategy</h3>
                      <p className="text-gray-700 mb-4">
                        Manage your social media presence across multiple platforms with AI-powered content creation and scheduling.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Supported Platforms:</h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 text-center border rounded-lg">
                          <h5 className="font-semibold text-blue-700">LinkedIn</h5>
                          <p className="text-xs text-gray-600">Professional networking, B2B content</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg">
                          <h5 className="font-semibold text-blue-500">Twitter/X</h5>
                          <p className="text-xs text-gray-600">Real-time updates, engagement</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg">
                          <h5 className="font-semibold text-blue-600">Facebook</h5>
                          <p className="text-xs text-gray-600">Community building, advertising</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg">
                          <h5 className="font-semibold text-pink-600">Instagram</h5>
                          <p className="text-xs text-gray-600">Visual content, stories</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Generated Social Content</h3>
                      <p className="text-gray-700 mb-4">
                        Use AI to create platform-specific content that engages your audience and drives results.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-blue-600">"Create a LinkedIn post about AI in marketing"</p>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-green-600">"Write 5 Twitter posts for our product launch"</p>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-purple-600">"Generate Instagram captions with relevant hashtags"</p>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded">
                          <p className="font-mono text-sm text-orange-600">"Create a content calendar for this month"</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Social Media Best Practices</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <h5 className="font-semibold text-green-700">✅ Engagement Strategies</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Post consistently with AI-generated content</li>
                            <li>• Use platform-specific hashtags and features</li>
                            <li>• Engage with comments and messages promptly</li>
                            <li>• Share valuable, not just promotional content</li>
                            <li>• Track performance and optimize timing</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h5 className="font-semibold text-blue-700">📈 Growth Tactics</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Use AI to identify trending topics</li>
                            <li>• Create content series and themes</li>
                            <li>• Collaborate with influencers and partners</li>
                            <li>• Run targeted social media campaigns</li>
                            <li>• Analyze competitor strategies</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Proposals section - keeping existing comprehensive content */}
              {activeSection === 'proposals' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Proposal Generator</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Creating Professional Proposals</h3>
                      
                      <p className="text-gray-700 mb-4">
                        The AI Proposal Generator creates professional, customized sales proposals based on your client conversations and requirements.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Step-by-Step Proposal Creation:</h4>
                      <StepList steps={[
                        "Navigate to 'Proposals' in the left sidebar",
                        "Click the 'Generate New Proposal' button",
                        "Fill in the Client Information:",
                        "• Company name and contact details",
                        "• Industry and business type",
                        "• Contact person's name and role",
                        "Select your proposal template:",
                        "• Marketing Services (for digital marketing proposals)",
                        "• Web Development (for website/app projects)", 
                        "• Consulting Services (for advisory/strategy work)",
                        "• Trade Services (for contractors, plumbers, electricians, HVAC, landscaping)",
                        "• Custom (for other service types)",
                        "Add project details and requirements",
                        "Paste any call transcripts or notes from client meetings",
                        "Set the budget range (min and max values)",
                        "Click 'Generate Proposal' and wait for AI processing"
                      ]} />

                      <ProTip>
                        Include detailed call transcripts when available - the AI uses this information to personalize the proposal and address specific client needs mentioned during conversations.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Proposal Templates Explained</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-700">Marketing Services Template</h5>
                          <p className="text-sm text-blue-600">Best for: SEO, content marketing, social media management, PPC advertising</p>
                          <p className="text-sm text-blue-600">Includes: Campaign strategies, content calendars, performance metrics, reporting schedules</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-700">Web Development Template</h5>
                          <p className="text-sm text-green-600">Best for: Website builds, web applications, e-commerce platforms</p>
                          <p className="text-sm text-green-600">Includes: Technical requirements, development phases, testing protocols, launch procedures</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-purple-700">Consulting Services Template</h5>
                          <p className="text-sm text-purple-600">Best for: Strategy consulting, process optimization, business advisory</p>
                          <p className="text-sm text-purple-600">Includes: Problem analysis, methodology, deliverables, implementation support</p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-orange-700">Trade Services Template</h5>
                          <p className="text-sm text-orange-600">Best for: Plumbing, electrical, HVAC, landscaping, handyman services, general contractors</p>
                          <p className="text-sm text-orange-600">Includes: Site assessment, materials & labor breakdown, warranty terms, permits & licensing</p>
                          
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-orange-700">Trade-Specific Examples:</p>
                            <ul className="text-xs text-orange-600 space-y-1 ml-4">
                              <li><strong>Plumber:</strong> Bathroom renovation, pipe repair, fixture installation</li>
                              <li><strong>Electrician:</strong> Panel upgrades, outlet installation, lighting projects</li>
                              <li><strong>HVAC:</strong> System installation, maintenance, repairs</li>
                              <li><strong>Landscaper:</strong> Garden design, lawn care, hardscaping</li>
                              <li><strong>General Contractor:</strong> Home renovations, repairs, additions</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Warning>
                        Choose the template that best matches your service type. The Trade Services Template can be customized for any type of contractor or service business with flexible pricing for hourly rates or project-based work.
                      </Warning>
                    </div>

                    {/* Keep existing comprehensive proposal content */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Customizing and Editing Proposals</h3>
                      
                      <h4 className="font-semibold mb-2">Using the Proposal Editor:</h4>
                      <StepList steps={[
                        "After generation, review the proposal in the preview panel",
                        "Click 'Edit Proposal' to access the editor",
                        "Modify sections as needed:",
                        "• Executive Summary - Overview and value proposition",
                        "• Project Scope - Detailed service descriptions",
                        "• Timeline - Project phases and milestones",
                        "• Pricing - Itemized costs and payment terms",
                        "• Terms & Conditions - Contract terms and policies",
                        "Add your company branding and contact information",
                        "Include case studies or portfolio examples if relevant",
                        "Preview changes in real-time",
                        "Save draft versions for future reference"
                      ]} />

                      <h4 className="font-semibold mb-2 mt-6">Pricing Table Customization:</h4>
                      <ul className="space-y-2 ml-4">
                        <li><strong>Line Items:</strong> Add/remove services with descriptions</li>
                        <li><strong>Quantities:</strong> Specify hours, deliverables, or units</li>
                        <li><strong>Rates:</strong> Set hourly rates or fixed project costs</li>
                        <li><strong>Trade Services:</strong> Separate materials and labor costs automatically</li>
                        <li><strong>Subtotals:</strong> Automatic calculation of totals and taxes</li>
                        <li><strong>Payment Terms:</strong> Define payment schedule and methods</li>
                      </ul>

                      <Success>
                        Well-structured pricing tables with clear descriptions increase proposal acceptance rates by up to 35%. For trade services, separating materials and labor helps clients understand value better.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">4. Managing Your Proposal Library</h3>
                      
                      <h4 className="font-semibold mb-2">Viewing Saved Proposals:</h4>
                      <StepList steps={[
                        "Navigate to the 'My Proposals' tab",
                        "View all proposals with status indicators:",
                        "• Draft - Still being edited",
                        "• Sent - Delivered to client",
                        "• Accepted - Approved by client", 
                        "• Rejected - Declined by client",
                        "• Expired - Past deadline",
                        "Use filters to find specific proposals:",
                        "• Filter by client name",
                        "• Filter by status",
                        "• Filter by date range",
                        "• Filter by proposal value",
                        "Click any proposal to view details or continue editing"
                      ]} />

                      <h4 className="font-semibold mb-2 mt-6">Proposal Status Tracking:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-400 rounded"></div>
                          <span><strong>Draft:</strong> Proposal is being created or edited</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span><strong>Sent:</strong> Proposal has been delivered to client</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span><strong>Accepted:</strong> Client has approved the proposal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span><strong>Rejected:</strong> Client has declined the proposal</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">5. Exporting and Sharing Proposals</h3>
                      
                      <h4 className="font-semibold mb-2">Export Options:</h4>
                      <StepList steps={[
                        "Open the proposal you want to export",
                        "Click the 'Export' button in the top right",
                        "Choose your preferred format:",
                        "• PDF - Best for email delivery and printing",
                        "• Word Document - Allows client to add comments/edits",
                        "Wait for the file to generate (usually 10-30 seconds)",
                        "Download the file or get a shareable link",
                        "Send directly via email or upload to your preferred platform"
                      ]} />

                      <h4 className="font-semibold mb-2 mt-6">Email Integration:</h4>
                      <ul className="space-y-2 ml-4">
                        <li><strong>Direct Email:</strong> Send proposals directly from the platform</li>
                        <li><strong>Email Templates:</strong> Use pre-written email templates for proposal delivery</li>
                        <li><strong>Follow-up Automation:</strong> Set automatic follow-up reminders</li>
                        <li><strong>Open Tracking:</strong> See when clients view your proposals</li>
                      </ul>

                      <ProTip>
                        PDF format is recommended for final proposals as it preserves formatting across all devices. Use Word format when you want clients to provide feedback or make edits.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">6. Advanced Features & Best Practices</h3>
                      
                      <h4 className="font-semibold mb-2">AI-Powered Enhancements:</h4>
                      <ul className="space-y-2 ml-4">
                        <li><strong>Smart Content:</strong> AI analyzes client needs and suggests relevant services</li>
                        <li><strong>Dynamic Pricing:</strong> Pricing recommendations based on project scope and market rates</li>
                        <li><strong>Competitive Analysis:</strong> Insights on industry-standard pricing and terms</li>
                        <li><strong>Success Predictions:</strong> AI estimates proposal acceptance probability</li>
                        <li><strong>Trade-Specific Intelligence:</strong> Automatic permit requirements and material suggestions for contractors</li>
                      </ul>

                      <h4 className="font-semibold mb-2 mt-6">Best Practices for Higher Acceptance Rates:</h4>
                      <StepList steps={[
                        "Personalize each proposal with specific client details and pain points",
                        "Include case studies or examples of similar successful projects",
                        "Break down complex projects into clear, manageable phases",
                        "Provide multiple pricing options (good, better, best)",
                        "Set clear expectations for timeline, deliverables, and communication",
                        "Include testimonials or references from satisfied clients",
                        "Use professional formatting with your company branding",
                        "For trade services: Include licensing info, insurance details, and warranty terms",
                        "Follow up within 3-5 business days if no response"
                      ]} />

                      <Warning>
                        Always review AI-generated content before sending. While the AI is sophisticated, human oversight ensures accuracy and maintains your professional standards.
                      </Warning>

                      <Success>
                        Proposals that include specific ROI projections and clear next steps have 60% higher acceptance rates than generic proposals. Trade service proposals with detailed material breakdowns and permit information show 45% better conversion rates.
                      </Success>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics & Reports */}
              {activeSection === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Performance Tracking & Insights</h3>
                      <p className="text-gray-700 mb-4">
                        Access comprehensive analytics across all your marketing channels with AI-powered insights and recommendations.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Available Analytics:</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-blue-700">Campaign Performance</h5>
                          <p className="text-xs text-gray-600">ROI, conversion rates, channel attribution</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-green-700">Content Analytics</h5>
                          <p className="text-xs text-gray-600">Engagement rates, top-performing content</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-purple-700">Lead Analytics</h5>
                          <p className="text-xs text-gray-600">Lead quality scores, conversion funnels</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-orange-700">AI Performance</h5>
                          <p className="text-xs text-gray-600">AI-generated content success rates</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">AI-Powered Analytics</h3>
                      <StepList steps={[
                        "Ask AI assistant: 'Analyze my campaign performance this month'",
                        "Request specific insights: 'What's driving my best conversion rates?'",
                        "Get recommendations: 'How can I improve my email open rates?'",
                        "Compare periods: 'Compare this quarter to last quarter'",
                        "Identify trends: 'What content performs best on social media?'",
                        "Export reports: 'Create a performance report for stakeholders'"
                      ]} />

                      <ProTip>
                        Ask the AI to explain metrics in business terms rather than just technical numbers for better stakeholder communication.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Custom Reports</h3>
                      <p className="text-gray-700 mb-4">
                        Generate custom reports tailored to your specific needs and stakeholder requirements.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800">Executive Dashboards</h5>
                          <p className="text-sm text-blue-600">High-level metrics, ROI summaries, strategic insights</p>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-400">
                          <h5 className="font-semibold text-green-800">Operational Reports</h5>
                          <p className="text-sm text-green-600">Detailed performance data, optimization opportunities</p>
                        </div>
                        <div className="p-3 bg-purple-50 border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-800">Campaign-Specific Analysis</h5>
                          <p className="text-sm text-purple-600">Individual campaign deep-dives, A/B test results</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings & Admin */}
              {activeSection === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Settings & Administration</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Account Configuration</h3>
                      <p className="text-gray-700 mb-4">
                        Configure your platform settings, API integrations, and user preferences from the Settings page.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Settings Sections:</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800 flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            API Keys & Security
                          </h5>
                          <p className="text-sm text-blue-600 mt-1">Configure OpenAI API key, authentication settings, security preferences</p>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-400">
                          <h5 className="font-semibold text-green-800 flex items-center">
                            <Database className="h-4 w-4 mr-2" />
                            Knowledge Management
                          </h5>
                          <p className="text-sm text-green-600 mt-1">Manage knowledge buckets, upload documents, search knowledge base</p>
                        </div>
                        <div className="p-3 bg-purple-50 border-l-4 border-purple-400">
                          <h5 className="font-semibold text-purple-800 flex items-center">
                            <Share2 className="h-4 w-4 mr-2" />
                            Platform Integrations
                          </h5>
                          <p className="text-sm text-purple-600 mt-1">Connect social media platforms, email services, third-party tools</p>
                        </div>
                        <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                          <h5 className="font-semibold text-orange-800 flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            Automation Settings
                          </h5>
                          <p className="text-sm text-orange-600 mt-1">Configure webhooks, data sync, automated workflows</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Essential Setup Steps</h3>
                      <StepList steps={[
                        "Navigate to Settings from the main menu",
                        "Configure your OpenAI API key in 'API Keys' section",
                        "Set up Knowledge Management buckets for your business",
                        "Connect your social media platforms in 'Integrations'",
                        "Configure email automation settings",
                        "Set up webhooks for external system integration",
                        "Review and adjust security and privacy settings",
                        "Test all integrations to ensure proper functionality"
                      ]} />

                      <Warning>
                        Your OpenAI API key is required for AI features to work. Keep this key secure and never share it with unauthorized users.
                      </Warning>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Platform Integrations</h3>
                      <p className="text-gray-700 mb-4">
                        Connect your existing marketing tools and platforms for seamless data flow and automation.
                      </p>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-blue-700">Social Platforms</h5>
                          <p className="text-xs text-gray-600">Facebook, Twitter, LinkedIn, Instagram</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-green-700">Email Services</h5>
                          <p className="text-xs text-gray-600">Mailchimp, SendGrid, ConvertKit</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-purple-700">CRM Systems</h5>
                          <p className="text-xs text-gray-600">Salesforce, HubSpot, Pipedrive</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-semibold text-orange-700">Analytics</h5>
                          <p className="text-xs text-gray-600">Google Analytics, Facebook Insights</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Troubleshooting */}
              {activeSection === 'troubleshooting' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Troubleshooting</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Common Issues & Solutions</h3>
                      <p className="text-gray-700 mb-4">
                        Quick solutions to the most common platform issues and questions.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 border-l-4 border-red-400">
                          <h5 className="font-semibold text-red-800 mb-2">AI Assistant Not Responding</h5>
                          <ul className="text-sm text-red-600 space-y-1">
                            <li>• Check that your OpenAI API key is configured in Settings</li>
                            <li>• Verify your API key has sufficient credits</li>
                            <li>• Wait for server wake-up if showing "sleeping" status</li>
                            <li>• Try refreshing the page and asking again</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                          <h5 className="font-semibold text-yellow-800 mb-2">Knowledge Search Not Working</h5>
                          <ul className="text-sm text-yellow-600 space-y-1">
                            <li>• Ensure documents have "Ready" status (not "Processing")</li>
                            <li>• Try more specific search queries</li>
                            <li>• Check that you have content in your knowledge buckets</li>
                            <li>• Verify document upload was successful</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-semibold text-blue-800 mb-2">Campaign Creation Issues</h5>
                          <ul className="text-sm text-blue-600 space-y-1">
                            <li>• Ensure all required fields are completed</li>
                            <li>• Check internet connection for template loading</li>
                            <li>• Try refreshing and starting with a different template</li>
                            <li>• Clear browser cache if experiencing loading issues</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-green-50 border-l-4 border-green-400">
                          <h5 className="font-semibold text-green-800 mb-2">Integration Connection Problems</h5>
                          <ul className="text-sm text-green-600 space-y-1">
                            <li>• Verify API credentials are correct and active</li>
                            <li>• Check platform-specific permission settings</li>
                            <li>• Try disconnecting and reconnecting the integration</li>
                            <li>• Ensure third-party platforms allow API access</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Server Status & Performance</h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 border rounded">
                          <h5 className="font-semibold mb-2">Understanding Server States</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span><strong>Active:</strong> AI backend is ready and responsive</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                              <span><strong>Sleeping:</strong> Server needs 30-60 seconds to wake up</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded"></div>
                              <span><strong>Error:</strong> Connection issues or configuration problems</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ProTip>
                        If you frequently encounter sleeping server issues, try keeping the AI assistant active by asking periodic questions during your work session.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Getting Additional Help</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border rounded">
                          <h5 className="font-semibold text-blue-700">AI Assistant Help</h5>
                          <p className="text-sm text-blue-600">Ask the AI assistant: "How do I [specific task]?" for step-by-step guidance</p>
                        </div>
                        <div className="p-3 bg-green-50 border rounded">
                          <h5 className="font-semibold text-green-700">Knowledge Base Search</h5>
                          <p className="text-sm text-green-600">Use the knowledge search feature to find relevant help documents</p>
                        </div>
                        <div className="p-3 bg-purple-50 border rounded">
                          <h5 className="font-semibold text-purple-700">Platform Support</h5>
                          <p className="text-sm text-purple-600">Contact support for technical issues or feature requests</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Performance Optimization</h3>
                      <StepList steps={[
                        "Keep your knowledge base organized and up-to-date",
                        "Regularly review and clean up old campaigns and documents",
                        "Monitor your API usage and credit limits",
                        "Use specific, well-structured queries for better AI responses",
                        "Keep browser cache clear if experiencing slow loading",
                        "Ensure stable internet connection for real-time features",
                        "Log out and back in if experiencing session-related issues"
                      ]} />

                      <Success>
                        Most performance issues can be resolved by refreshing the page, checking your internet connection, and verifying your API key configuration.
                      </Success>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
