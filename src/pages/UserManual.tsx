
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  LayoutDashboard, 
  Zap, 
  Users, 
  FileText, 
  Share2, 
  Mail, 
  BarChart3, 
  Workflow,
  Settings,
  Target,
  TrendingUp,
  MessageSquare,
  PlusCircle
} from 'lucide-react';
import LogoMarkIcon from '@/components/LogoMarkIcon';

const UserManual: React.FC = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">AI Marketing Hub</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Complete User Manual - Your comprehensive guide to mastering the AI-powered marketing automation platform
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>Version:</strong> 2.0 | <strong>Last Updated:</strong> December 2024
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Platform Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6" />
                <span>Platform Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3>Welcome to AI Marketing Hub</h3>
                <p>
                  AI Marketing Hub is an intelligent marketing automation platform that combines AI-powered insights 
                  with comprehensive campaign management tools. The platform offers both conversational AI interfaces 
                  and traditional dashboard views to accommodate different user preferences.
                </p>

                <h4>Key Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <LogoMarkIcon className="h-6 w-6 mb-2" />
                    <h5 className="font-semibold">AI-Powered Dashboard</h5>
                    <p className="text-sm">Conversational interface for natural language queries and insights</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600 mb-2" />
                    <h5 className="font-semibold">Campaign Management</h5>
                    <p className="text-sm">Advanced tools for creating and managing marketing campaigns</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 mb-2" />
                    <h5 className="font-semibold">Lead Management</h5>
                    <p className="text-sm">Comprehensive lead tracking, scoring, and conversion tools</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600 mb-2" />
                    <h5 className="font-semibold">Content Creation</h5>
                    <p className="text-sm">AI-assisted content generation and management</p>
                  </div>
                </div>

                <h4>Navigation Structure</h4>
                <ul>
                  <li><strong>AI Dashboard:</strong> Conversational interface with natural language processing</li>
                  <li><strong>Traditional Dashboard:</strong> Classic metrics and overview interface</li>
                  <li><strong>Campaign Management:</strong> Create, manage, and optimize marketing campaigns</li>
                  <li><strong>Lead Management:</strong> Track and nurture leads through the sales funnel</li>
                  <li><strong>Content Hub:</strong> Generate and manage marketing content</li>
                  <li><strong>Social Media:</strong> Manage social media presence and scheduling</li>
                  <li><strong>Email Marketing:</strong> Email campaign creation and analytics</li>
                  <li><strong>Analytics:</strong> Comprehensive performance metrics and reporting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Guide */}
        <TabsContent value="dashboard">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LogoMarkIcon className="h-6 w-6" />
                  <span>AI Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>The AI Dashboard provides a conversational interface where you can ask questions in natural language and receive intelligent insights about your marketing performance.</p>
                  
                  <h4 className="font-semibold">How to Use the AI Dashboard:</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Type your question in the chat input at the bottom</li>
                    <li>Ask about campaigns, performance, leads, or general marketing insights</li>
                    <li>Use suggested questions for quick access to common queries</li>
                    <li>Review AI-generated insights and recommendations</li>
                  </ol>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Example Questions:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>"What should I focus on today?"</li>
                      <li>"How are my campaigns performing?"</li>
                      <li>"Show me my lead conversion rates"</li>
                      <li>"What content is performing best?"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LayoutDashboard className="h-6 w-6" />
                  <span>Traditional Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>The Traditional Dashboard provides a classic overview with key metrics, charts, and performance indicators.</p>
                  
                  <h4 className="font-semibold">Dashboard Components:</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Key Metrics Cards:</strong> Total campaigns, leads, conversion rates</li>
                    <li><strong>Performance Charts:</strong> Visual representation of campaign performance</li>
                    <li><strong>Recent Activities:</strong> Latest actions and system updates</li>
                    <li><strong>Quick Actions:</strong> Fast access to common tasks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaign Management */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <span>Campaign Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p>Comprehensive campaign management tools for creating, launching, and optimizing marketing campaigns across multiple channels.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Creating Campaigns</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Click "Create New Campaign" button</li>
                      <li>Choose campaign type (Email, Social, Multi-channel)</li>
                      <li>Set campaign objectives and target audience</li>
                      <li>Configure campaign settings and schedule</li>
                      <li>Review and launch campaign</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Campaign Types</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>Email Campaigns:</strong> Targeted email marketing</li>
                      <li><strong>Social Campaigns:</strong> Multi-platform social media</li>
                      <li><strong>Content Campaigns:</strong> Content marketing initiatives</li>
                      <li><strong>Lead Generation:</strong> Focused lead capture campaigns</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Campaign Performance Tracking</h5>
                  <p className="text-sm">Monitor key metrics including:</p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>Reach and impressions</li>
                    <li>Engagement rates</li>
                    <li>Conversion tracking</li>
                    <li>ROI calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Management */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Lead Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p>Advanced lead management system with automated scoring, tracking, and nurturing capabilities.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Target className="h-6 w-6 text-green-600 mb-2" />
                    <h5 className="font-semibold">Lead Capture</h5>
                    <p className="text-sm">Automated lead capture from multiple sources including forms, social media, and campaigns.</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                    <h5 className="font-semibold">Lead Scoring</h5>
                    <p className="text-sm">AI-powered lead scoring based on engagement, demographics, and behavior patterns.</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
                    <h5 className="font-semibold">Lead Nurturing</h5>
                    <p className="text-sm">Automated nurturing sequences and personalized communication workflows.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Lead Management Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Lead Actions</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Score leads automatically</li>
                        <li>Enrich lead data</li>
                        <li>Convert leads to customers</li>
                        <li>Export lead data</li>
                        <li>Sync with CRM systems</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Lead Analytics</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Conversion rate tracking</li>
                        <li>Lead source analysis</li>
                        <li>Engagement metrics</li>
                        <li>Pipeline velocity</li>
                        <li>ROI calculations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Creation */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>Content Creation & Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p>AI-powered content creation tools for generating high-quality marketing materials across multiple formats and platforms.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Content Generation Process</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Select content type (Blog, Social, Email, etc.)</li>
                      <li>Provide content brief and requirements</li>
                      <li>Specify target audience and tone</li>
                      <li>Review AI-generated content</li>
                      <li>Edit and optimize as needed</li>
                      <li>Publish or schedule content</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Supported Content Types</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Blog posts and articles</li>
                      <li>Social media posts</li>
                      <li>Email newsletters</li>
                      <li>Ad copy and headlines</li>
                      <li>Product descriptions</li>
                      <li>Landing page content</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">AI Content Features</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>SEO Optimization:</strong>
                      <p>Automatic keyword integration and SEO scoring</p>
                    </div>
                    <div>
                      <strong>Readability Analysis:</strong>
                      <p>Content readability scoring and suggestions</p>
                    </div>
                    <div>
                      <strong>Engagement Prediction:</strong>
                      <p>AI-powered engagement likelihood scoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-6 w-6" />
                <span>Social Media Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p>Comprehensive social media management platform supporting multiple social networks with scheduling, analytics, and engagement tools.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Supported Platforms</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <strong>Facebook</strong>
                        <p className="text-sm">Posts, Stories, Ads</p>
                      </div>
                      <div className="bg-sky-50 p-3 rounded text-center">
                        <strong>Twitter/X</strong>
                        <p className="text-sm">Tweets, Threads</p>
                      </div>
                      <div className="bg-pink-50 p-3 rounded text-center">
                        <strong>Instagram</strong>
                        <p className="text-sm">Posts, Stories, Reels</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded text-center">
                        <strong>LinkedIn</strong>
                        <p className="text-sm">Posts, Articles</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Multi-platform posting and scheduling</li>
                      <li>Real-time engagement monitoring</li>
                      <li>Social media calendar management</li>
                      <li>Hashtag optimization and suggestions</li>
                      <li>Performance analytics and reporting</li>
                      <li>Social listening and monitoring</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Social Media Workflow</h5>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-white px-3 py-1 rounded-full">1. Connect Platforms</span>
                    <span className="bg-white px-3 py-1 rounded-full">2. Create Content</span>
                    <span className="bg-white px-3 py-1 rounded-full">3. Schedule Posts</span>
                    <span className="bg-white px-3 py-1 rounded-full">4. Monitor Engagement</span>
                    <span className="bg-white px-3 py-1 rounded-full">5. Analyze Performance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Marketing */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-6 w-6" />
                <span>Email Marketing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p>Advanced email marketing platform with automation, segmentation, and comprehensive analytics for maximizing email campaign effectiveness.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-semibold">Campaign Creation</h5>
                    <p className="text-sm">Drag-and-drop email builder with templates</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h5 className="font-semibold">List Management</h5>
                    <p className="text-sm">Advanced segmentation and list management</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h5 className="font-semibold">Analytics</h5>
                    <p className="text-sm">Real-time metrics and performance tracking</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Email Marketing Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2">Campaign Tools</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Visual email editor</li>
                        <li>A/B testing capabilities</li>
                        <li>Automated sequences</li>
                        <li>Drip campaigns</li>
                        <li>Triggered emails</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Analytics & Metrics</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Open and click rates</li>
                        <li>Delivery and bounce rates</li>
                        <li>Unsubscribe tracking</li>
                        <li>Revenue attribution</li>
                        <li>Real-time reporting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics & Reporting</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p>Comprehensive analytics dashboard providing deep insights into marketing performance across all channels and campaigns.</p>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-sm">Performance Metrics</h5>
                    <p className="text-xs">Campaign ROI, conversion rates, engagement</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-sm">Audience Insights</h5>
                    <p className="text-xs">Demographics, behavior, preferences</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-sm">Channel Performance</h5>
                    <p className="text-xs">Email, social, content effectiveness</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-sm">Goal Tracking</h5>
                    <p className="text-xs">Conversion goals, revenue tracking</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Analytics Capabilities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2">Real-time Reporting</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Live campaign performance</li>
                        <li>Real-time engagement metrics</li>
                        <li>Instant ROI calculations</li>
                        <li>Dynamic dashboard updates</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Advanced Analytics</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Predictive analytics</li>
                        <li>Customer lifetime value</li>
                        <li>Attribution modeling</li>
                        <li>Cohort analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Custom Reporting</h5>
                  <p className="text-sm mb-2">Create custom reports and dashboards tailored to your specific needs:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Automated report scheduling</li>
                    <li>White-label reporting</li>
                    <li>Data export capabilities</li>
                    <li>API access for custom integrations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Workflow className="h-5 w-5" />
              <span>Workflow Automation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">Create automated workflows to streamline your marketing processes:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Lead nurturing sequences</li>
              <li>Social media scheduling</li>
              <li>Email automation</li>
              <li>Campaign triggers</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Settings & Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">Configure your platform settings and integrations:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>API key management</li>
              <li>Platform integrations</li>
              <li>User preferences</li>
              <li>Security settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-6 text-center space-y-4">
        <h3 className="text-lg font-semibold">Need Additional Help?</h3>
        <p className="text-sm text-gray-600">
          This user manual covers the core functionality of AI Marketing Hub. For technical support, 
          additional features, or custom integrations, please contact our support team.
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <span className="text-blue-600">📧 support@aimarketinghub.com</span>
          <span className="text-green-600">💬 Live Chat Available</span>
          <span className="text-purple-600">📚 Video Tutorials</span>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
