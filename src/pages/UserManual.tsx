
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
  Lightbulb
} from 'lucide-react';

const UserManual: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: LogIn },
    { id: 'dashboard', title: 'Dashboard Navigation', icon: BarChart3 },
    { id: 'campaigns', title: 'Campaign Management', icon: PlusCircle },
    { id: 'content', title: 'Content Creation', icon: Share2 },
    { id: 'leads', title: 'Lead Management', icon: Users },
    { id: 'email', title: 'Email Automation', icon: Mail },
    { id: 'social', title: 'Social Media', icon: Calendar },
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
          <h1 className="text-3xl font-bold text-gray-900">User Manual</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Complete guide to using your Agentic AI Marketing Platform
        </p>
        <Badge variant="secondary" className="mt-2">Version 1.0</Badge>
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
              {activeSection === 'getting-started' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Account Setup & Login</h3>
                      <p className="text-gray-700 mb-4">
                        Your Agentic AI Marketing Platform uses secure authentication to protect your marketing data.
                      </p>
                      
                      <h4 className="font-semibold mb-2">First-Time Registration:</h4>
                      <StepList steps={[
                        "Navigate to the login page (you'll be redirected automatically if not logged in)",
                        "Click 'Don't have an account? Sign up' at the bottom",
                        "Enter your business email address",
                        "Create a strong password (minimum 8 characters)",
                        "Click 'Sign up' to create your account",
                        "Check your email for verification (if required)"
                      ]} />

                      <Warning>
                        Use your business email address for account creation to ensure proper team collaboration features.
                      </Warning>

                      <h4 className="font-semibold mb-2 mt-6">Logging In:</h4>
                      <StepList steps={[
                        "Enter your registered email address",
                        "Enter your password",
                        "Click 'Sign in'",
                        "You'll be redirected to the main dashboard"
                      ]} />

                      <Success>
                        You'll see the AI-powered conversational dashboard with personalized greetings and insights.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Platform Overview</h3>
                      <p className="text-gray-700 mb-4">
                        The platform consists of several key sections accessible via the left sidebar:
                      </p>
                      
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span><strong>Dashboard:</strong> AI conversational interface and overview</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <PlusCircle className="h-4 w-4 text-green-600" />
                          <span><strong>Campaigns:</strong> Create and manage marketing campaigns</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span><strong>Leads:</strong> Lead generation and scoring</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Share2 className="h-4 w-4 text-orange-600" />
                          <span><strong>Content:</strong> AI-powered content creation</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-pink-600" />
                          <span><strong>Social:</strong> Social media management</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-indigo-600" />
                          <span><strong>Email:</strong> Email automation sequences</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-red-600" />
                          <span><strong>Analytics:</strong> Performance insights and reports</span>
                        </li>
                      </ul>

                      <ProTip>
                        Start with the Dashboard to get familiar with the AI assistant - it can guide you through any task!
                      </ProTip>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Navigation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. AI Conversational Interface</h3>
                      <p className="text-gray-700 mb-4">
                        The heart of your platform is the AI assistant that learns from your marketing patterns.
                      </p>
                      
                      <h4 className="font-semibold mb-2">How to Interact with the AI:</h4>
                      <StepList steps={[
                        "Type your question or request in the chat box at the bottom",
                        "Use natural language - ask things like 'Show me my best performing campaigns'",
                        "Press Enter or click the Send button",
                        "Wait for the AI to analyze your data and respond",
                        "Review the insights, charts, and recommendations provided"
                      ]} />

                      <ProTip>
                        Try these sample questions: "What content should I create next?", "How are my leads converting?", or "Why is my budget running out so fast?"
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Performance Cards</h3>
                      <p className="text-gray-700 mb-4">
                        The top section displays key metrics updated in real-time:
                      </p>
                      
                      <ul className="space-y-2 ml-4">
                        <li><strong>Session Duration:</strong> How long you've been actively using the platform</li>
                        <li><strong>Actions Taken:</strong> Number of marketing actions completed</li>
                        <li><strong>Productivity Score:</strong> AI-calculated efficiency rating</li>
                        <li><strong>Top Feature:</strong> Your most-used platform feature</li>
                      </ul>

                      <Success>
                        Green arrows indicate positive trends, helping you track your marketing momentum.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Quick Actions</h3>
                      <p className="text-gray-700 mb-4">
                        Use the quick action buttons in the sidebar to jump to common tasks:
                      </p>
                      
                      <StepList steps={[
                        "Look for the 'Quick Actions' panel on the right sidebar",
                        "Click any action button (e.g., 'Create Campaign', 'Generate Content')",
                        "You'll be taken directly to the relevant section with pre-filled forms",
                        "The AI will provide contextual suggestions based on your history"
                      ]} />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'campaigns' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Creating a New Campaign</h3>
                      
                      <h4 className="font-semibold mb-2">Step-by-Step Campaign Creation:</h4>
                      <StepList steps={[
                        "Navigate to 'Campaigns' in the left sidebar",
                        "Click the blue 'Create Campaign' button in the top right",
                        "Fill in the campaign form with the following details:",
                        "• Campaign Name: Choose a descriptive name",
                        "• Type: Select from Email, Social, or Multi-channel",
                        "• Description: Briefly describe your campaign goals",
                        "• Status: Start with 'Draft' for testing",
                        "Click 'Create Campaign' to save"
                      ]} />

                      <ProTip>
                        Use descriptive names like "Q1 Product Launch Email Series" instead of generic names like "Campaign 1".
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Campaign Types Explained</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-700">Email Campaigns</h5>
                          <p className="text-sm text-gray-600">Best for: Product announcements, newsletters, nurture sequences</p>
                          <p className="text-sm text-gray-600">Features: A/B testing, automation triggers, personalization</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-700">Social Media Campaigns</h5>
                          <p className="text-sm text-gray-600">Best for: Brand awareness, engagement, community building</p>
                          <p className="text-sm text-gray-600">Features: Multi-platform posting, optimal timing, hashtag suggestions</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-purple-700">Multi-channel Campaigns</h5>
                          <p className="text-sm text-gray-600">Best for: Product launches, comprehensive marketing pushes</p>
                          <p className="text-sm text-gray-600">Features: Coordinated messaging, cross-channel analytics</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Monitoring Campaign Performance</h3>
                      
                      <StepList steps={[
                        "Click on any campaign card to view detailed metrics",
                        "Review key performance indicators (KPIs):",
                        "• Opens: How many people opened your emails",
                        "• Clicks: Engagement with your content",
                        "• Conversions: Actions taken (purchases, sign-ups, etc.)",
                        "Use the performance charts to identify trends",
                        "Check the AI recommendations for optimization suggestions"
                      ]} />

                      <Warning>
                        If your open rates are below 20% for email campaigns, consider improving your subject lines or sender reputation.
                      </Warning>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Content Creation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. AI Content Generator</h3>
                      
                      <h4 className="font-semibold mb-2">Creating Content with AI:</h4>
                      <StepList steps={[
                        "Go to the 'Content' section from the sidebar",
                        "Click 'Create Content' in the top right",
                        "Select your content type (Blog Post, Social Media, Email, etc.)",
                        "Choose your target platform (LinkedIn, Facebook, Email, etc.)",
                        "Enter a brief description of what you want to create",
                        "Specify your target audience (e.g., 'small business owners')",
                        "Click 'Generate Content' and wait for AI processing",
                        "Review, edit, and customize the generated content",
                        "Save to your content library or publish directly"
                      ]} />

                      <ProTip>
                        The more specific your brief, the better the AI-generated content. Include tone, key points, and call-to-action preferences.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Content Performance Tracking</h3>
                      
                      <p className="text-gray-700 mb-4">Monitor how your content performs across different channels:</p>
                      
                      <ul className="space-y-2 ml-4">
                        <li><strong>Total Views:</strong> How many people saw your content</li>
                        <li><strong>Engagement Rate:</strong> Likes, comments, shares relative to views</li>
                        <li><strong>Top Performers:</strong> Your most successful content pieces</li>
                        <li><strong>Conversion Tracking:</strong> How content drives business results</li>
                      </ul>

                      <Success>
                        Content with engagement rates above 6% is performing well. Use these as templates for future content.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Content Templates & Optimization</h3>
                      
                      <StepList steps={[
                        "Access the 'Templates' tab in the Content section",
                        "Browse pre-built templates for different industries and goals",
                        "Customize templates with your brand voice and messaging",
                        "Use the AI optimization suggestions to improve performance",
                        "A/B test different versions to find what works best",
                        "Save successful variations as new templates"
                      ]} />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'leads' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Understanding Lead Scores</h3>
                      
                      <p className="text-gray-700 mb-4">
                        The AI automatically scores leads based on engagement, demographics, and behavior patterns.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span><strong>0-30:</strong> Cold leads - require nurturing</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span><strong>31-70:</strong> Warm leads - show interest</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span><strong>71-100:</strong> Hot leads - ready to buy</span>
                        </div>
                      </div>

                      <ProTip>
                        Focus your immediate attention on leads with scores above 85% - they're most likely to convert.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Lead Search & Filtering</h3>
                      
                      <h4 className="font-semibold mb-2">Using Adaptive Search:</h4>
                      <StepList steps={[
                        "Go to the 'Leads' section and click the 'Search' tab",
                        "Enter search criteria (company name, industry, location, etc.)",
                        "Use the AI-powered filters to narrow down results",
                        "Review the suggested leads based on your ideal customer profile",
                        "Add promising leads to your CRM or contact lists",
                        "Set up automated follow-up sequences"
                      ]} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Conversion Pattern Analysis</h3>
                      
                      <p className="text-gray-700 mb-4">
                        Track which lead sources and characteristics result in the highest conversion rates:
                      </p>
                      
                      <StepList steps={[
                        "Navigate to the 'Patterns' tab in the Leads section",
                        "Review conversion rates by source (organic search, social media, etc.)",
                        "Identify the best-performing lead characteristics",
                        "Note the average time to conversion for different lead types",
                        "Use these insights to refine your targeting and messaging"
                      ]} />

                      <Success>
                        Email campaigns typically show the highest conversion rates (14.1% average). Focus budget on proven channels.
                      </Success>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'email' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Email Automation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Setting Up Email Sequences</h3>
                      
                      <h4 className="font-semibold mb-2">Creating Automated Email Workflows:</h4>
                      <StepList steps={[
                        "Navigate to the 'Email' section from the sidebar",
                        "Click 'Create New Campaign' in the campaign builder",
                        "Choose your email sequence type:",
                        "• Welcome Series (for new subscribers)",
                        "• Nurture Campaign (for leads)",
                        "• Re-engagement (for inactive subscribers)",
                        "• Product Launch (for announcements)",
                        "Set up your trigger conditions (sign-up, purchase, inactivity, etc.)",
                        "Design your email templates using the drag-and-drop builder",
                        "Configure timing between emails (hours, days, weeks)",
                        "Set up personalization tokens (name, company, etc.)",
                        "Test your sequence with a small audience first",
                        "Activate the automation when ready"
                      ]} />

                      <Warning>
                        Always test your email sequences with internal team members before activating to catch any errors.
                      </Warning>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Behavioral Triggers</h3>
                      
                      <p className="text-gray-700 mb-4">
                        Set up emails that automatically send based on user behavior:
                      </p>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold">Website Behavior Triggers</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Page visits (pricing, product pages)</li>
                            <li>• Time spent on site</li>
                            <li>• Download actions</li>
                            <li>• Cart abandonment</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold">Email Behavior Triggers</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Email opens/clicks</li>
                            <li>• Link clicks to specific content</li>
                            <li>• Non-engagement for X days</li>
                            <li>• Reply to emails</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Email Performance Optimization</h3>
                      
                      <StepList steps={[
                        "Monitor key email metrics in the Performance Dashboard:",
                        "• Open Rate: Industry average is 20-25%",
                        "• Click-through Rate: Aim for 2-5%",
                        "• Conversion Rate: Track based on your goals",
                        "• Unsubscribe Rate: Keep below 0.5%",
                        "Use A/B testing for subject lines, send times, and content",
                        "Segment your audience for more targeted messaging",
                        "Clean your email list regularly to maintain deliverability"
                      ]} />

                      <ProTip>
                        Send emails Tuesday-Thursday between 10 AM - 2 PM for highest open rates. The AI will suggest optimal timing based on your audience.
                      </ProTip>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Scheduling Social Media Posts</h3>
                      
                      <h4 className="font-semibold mb-2">Using the Intelligent Post Scheduler:</h4>
                      <StepList steps={[
                        "Go to the 'Social' section and click the 'Scheduler' tab",
                        "Click 'Create Post' or 'Schedule Posts' button",
                        "Select your target platforms (LinkedIn, Facebook, Twitter, Instagram)",
                        "Write your post content or use AI generation:",
                        "• Click 'Generate Content' for AI suggestions",
                        "• Customize the generated content for your brand voice",
                        "• Add relevant hashtags (AI will suggest trending ones)",
                        "Upload images or videos if desired",
                        "Choose scheduling options:",
                        "• Post now",
                        "• Schedule for specific date/time",
                        "• Use AI-recommended optimal times",
                        "Review your post preview for each platform",
                        "Click 'Schedule' to add to your content calendar"
                      ]} />

                      <Success>
                        Posts scheduled for AI-recommended times typically get 40% higher engagement than random posting times.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Engagement Pattern Analysis</h3>
                      
                      <p className="text-gray-700 mb-4">
                        Understanding when and how your audience engages helps optimize your social strategy:
                      </p>
                      
                      <StepList steps={[
                        "Navigate to the 'Patterns' tab in the Social section",
                        "Review your audience's most active times and days",
                        "Analyze which content types get the most engagement:",
                        "• Videos vs. images vs. text posts",
                        "• Educational vs. promotional content",
                        "• Questions vs. statements",
                        "Check hashtag performance and trending topics",
                        "Identify your top-performing posts for content inspiration",
                        "Use these insights to plan future content"
                      ]} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Platform-Specific Optimization</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-700">LinkedIn</h5>
                          <p className="text-sm text-blue-600">Best for: B2B content, professional insights, industry news</p>
                          <p className="text-sm text-blue-600">Optimal posting: Tuesday-Thursday, 8-10 AM</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-700">Facebook</h5>
                          <p className="text-sm text-green-600">Best for: Community building, behind-the-scenes, customer stories</p>
                          <p className="text-sm text-green-600">Optimal posting: Wednesday-Friday, 1-3 PM</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-purple-700">Instagram</h5>
                          <p className="text-sm text-purple-600">Best for: Visual content, product showcases, lifestyle posts</p>
                          <p className="text-sm text-purple-600">Optimal posting: Monday-Wednesday, 11 AM-1 PM</p>
                        </div>
                      </div>

                      <ProTip>
                        Use the Platform Optimization feature to automatically adapt your content for each social media platform's best practices.
                      </ProTip>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Understanding Your Analytics Dashboard</h3>
                      
                      <p className="text-gray-700 mb-4">
                        The Analytics section provides comprehensive insights into all your marketing activities:
                      </p>
                      
                      <h4 className="font-semibold mb-2">Key Metrics Explained:</h4>
                      <ul className="space-y-2 ml-4">
                        <li><strong>ROI (Return on Investment):</strong> Revenue generated per dollar spent</li>
                        <li><strong>CAC (Customer Acquisition Cost):</strong> Cost to acquire each new customer</li>
                        <li><strong>LTV (Lifetime Value):</strong> Total revenue expected from a customer</li>
                        <li><strong>Conversion Rate:</strong> Percentage of visitors who take desired actions</li>
                        <li><strong>Attribution:</strong> Which channels drive the most valuable customers</li>
                      </ul>

                      <Success>
                        A healthy LTV:CAC ratio is 3:1 or higher. If yours is lower, focus on retention strategies or reduce acquisition costs.
                      </Success>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Creating Custom Reports</h3>
                      
                      <StepList steps={[
                        "Navigate to the 'Analytics' section",
                        "Click 'Create Custom Report' in the top right",
                        "Select your reporting period (last 7 days, month, quarter, custom range)",
                        "Choose metrics to include:",
                        "• Campaign performance",
                        "• Lead generation",
                        "• Content engagement",
                        "• Email statistics",
                        "• Social media reach",
                        "Select visualization type (charts, tables, dashboards)",
                        "Add filters for specific campaigns, channels, or audience segments",
                        "Save your report template for future use",
                        "Schedule automatic report generation and email delivery"
                      ]} />

                      <ProTip>
                        Create weekly reports for tactical decisions and monthly reports for strategic planning. Share with stakeholders automatically.
                      </ProTip>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Predictive Analytics</h3>
                      
                      <p className="text-gray-700 mb-4">
                        Use AI-powered predictions to forecast future performance and budget needs:
                      </p>
                      
                      <StepList steps={[
                        "Go to the 'Predictive Analytics' tab",
                        "Review revenue forecasts based on current trends",
                        "Check budget optimization recommendations",
                        "Analyze seasonal patterns in your data",
                        "Review lead conversion predictions",
                        "Use campaign success predictions before launching",
                        "Set up alerts for when metrics deviate from predictions"
                      ]} />

                      <Warning>
                        Predictive analytics become more accurate with more data. Wait at least 30 days of platform usage for reliable predictions.
                      </Warning>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Settings & Administration</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. User & Role Management</h3>
                      
                      <h4 className="font-semibold mb-2">Adding Team Members:</h4>
                      <StepList steps={[
                        "Navigate to 'Settings' from the sidebar",
                        "Click on 'User Management' tab",
                        "Click 'Invite User' button",
                        "Enter the team member's email address",
                        "Select their role:",
                        "• Admin: Full access to all features and settings",
                        "• Manager: Can create campaigns and view all data",
                        "• Editor: Can create content and manage campaigns",
                        "• Viewer: Read-only access to reports and dashboards",
                        "Set department/team assignment if applicable",
                        "Click 'Send Invitation'",
                        "The user will receive an email with setup instructions"
                      ]} />

                      <h4 className="font-semibold mb-2 mt-6">Managing Permissions:</h4>
                      <ul className="space-y-2 ml-4">
                        <li><strong>Campaign Access:</strong> Control who can create, edit, or delete campaigns</li>
                        <li><strong>Budget Controls:</strong> Set spending limits for different team members</li>
                        <li><strong>Data Access:</strong> Restrict sensitive analytics to management roles</li>
                        <li><strong>Integration Management:</strong> Limit who can connect external tools</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Integration Setup</h3>
                      
                      <h4 className="font-semibold mb-2">Connecting External Tools:</h4>
                      <StepList steps={[
                        "Go to Settings → 'Integrations' tab",
                        "Browse available integrations:",
                        "• CRM systems (Salesforce, HubSpot, Pipedrive)",
                        "• Email platforms (Mailchimp, ConvertKit, ActiveCampaign)",
                        "• Social media (Facebook Ads, Google Ads, LinkedIn)",
                        "• Analytics (Google Analytics, Facebook Pixel)",
                        "Click 'Connect' next to your desired integration",
                        "Follow the authentication flow (usually OAuth)",
                        "Configure data sync preferences",
                        "Test the connection to ensure data flows correctly"
                      ]} />

                      <Warning>
                        Only connect integrations you actively use. Too many connections can slow down data processing and create confusion.
                      </Warning>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. AI Behavior Customization</h3>
                      
                      <p className="text-gray-700 mb-4">
                        Customize how the AI assistant works for your specific business needs:
                      </p>
                      
                      <StepList steps={[
                        "Navigate to Settings → 'AI Behavior'",
                        "Set your business information:",
                        "• Industry and target market",
                        "• Company size and revenue goals",
                        "• Marketing objectives and KPIs",
                        "Configure AI suggestion preferences:",
                        "• Content tone and style",
                        "• Risk tolerance for recommendations",
                        "• Frequency of proactive suggestions",
                        "Set up custom triggers for AI alerts",
                        "Define your ideal customer profile for better lead scoring",
                        "Save your preferences and test with sample queries"
                      ]} />

                      <ProTip>
                        The more specific you are about your business goals, the better the AI can tailor its recommendations to your needs.
                      </ProTip>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'troubleshooting' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Troubleshooting Guide</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">1. Common Login Issues</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-800">Problem: "Invalid credentials" error</h4>
                          <p className="text-red-700 text-sm mt-1">Solutions:</p>
                          <ul className="text-red-700 text-sm mt-2 space-y-1 ml-4">
                            <li>• Double-check your email address for typos</li>
                            <li>• Ensure your password is correct (check caps lock)</li>
                            <li>• Try resetting your password if you're unsure</li>
                            <li>• Clear your browser cache and cookies</li>
                          </ul>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-800">Problem: Stuck on loading screen</h4>
                          <p className="text-red-700 text-sm mt-1">Solutions:</p>
                          <ul className="text-red-700 text-sm mt-2 space-y-1 ml-4">
                            <li>• Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
                            <li>• Try a different browser (Chrome, Firefox, Safari)</li>
                            <li>• Disable browser extensions temporarily</li>
                            <li>• Check your internet connection</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">2. Campaign & Content Issues</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-800">Problem: AI content generation is slow or fails</h4>
                          <p className="text-yellow-700 text-sm mt-1">Solutions:</p>
                          <ul className="text-yellow-700 text-sm mt-2 space-y-1 ml-4">
                            <li>• Wait a moment and try again (high demand periods)</li>
                            <li>• Make your content brief more specific</li>
                            <li>• Try generating shorter pieces of content</li>
                            <li>• Check your internet connection</li>
                          </ul>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-800">Problem: Campaigns not showing expected results</h4>
                          <p className="text-yellow-700 text-sm mt-1">Solutions:</p>
                          <ul className="text-yellow-700 text-sm mt-2 space-y-1 ml-4">
                            <li>• Allow 24-48 hours for initial data collection</li>
                            <li>• Check that tracking is properly set up</li>
                            <li>• Verify your target audience settings</li>
                            <li>• Review campaign status (should be "Active")</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">3. Data & Analytics Issues</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800">Problem: Missing or incomplete data</h4>
                          <p className="text-blue-700 text-sm mt-1">Solutions:</p>
                          <ul className="text-blue-700 text-sm mt-2 space-y-1 ml-4">
                            <li>• Check that integrations are properly connected</li>
                            <li>• Verify date ranges in your reports</li>
                            <li>• Allow time for data synchronization (up to 24 hours)</li>
                            <li>• Contact support if data is missing for more than 48 hours</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800">Problem: Inconsistent metrics across reports</h4>
                          <p className="text-blue-700 text-sm mt-1">Solutions:</p>
                          <ul className="text-blue-700 text-sm mt-2 space-y-1 ml-4">
                            <li>• Ensure you're comparing the same time periods</li>
                            <li>• Check that filters are applied consistently</li>
                            <li>• Verify metric definitions (clicks vs. unique clicks)</li>
                            <li>• Account for data processing delays</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">4. When to Contact Support</h3>
                      
                      <p className="text-gray-700 mb-4">Contact our support team if you experience:</p>
                      
                      <ul className="space-y-2 ml-4">
                        <li>• Persistent login issues after trying troubleshooting steps</li>
                        <li>• Data loss or corruption</li>
                        <li>• Integration failures that can't be resolved</li>
                        <li>• Billing or subscription questions</li>
                        <li>• Feature requests or technical limitations</li>
                      </ul>

                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h4 className="font-semibold">Support Contact Information:</h4>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>• Email: support@agenticai.com</li>
                          <li>• Live Chat: Available in-app (bottom right corner)</li>
                          <li>• Response Time: 24 hours for standard issues, 4 hours for critical</li>
                        </ul>
                      </div>

                      <ProTip>
                        Include screenshots, error messages, and steps to reproduce the issue when contacting support for faster resolution.
                      </ProTip>
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
