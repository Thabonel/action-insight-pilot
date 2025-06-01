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
  FileText
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
              {/* Getting Started through Social sections */}
              {activeSection === 'getting-started' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
                  <p className="text-gray-700 mt-4">
                    Welcome to the Agentic AI Marketing Platform! This guide will help you navigate and utilize all features effectively.
                  </p>
                </div>
              )}
              {activeSection === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Navigation</h2>
                  <p className="text-gray-700 mt-4">
                    The dashboard provides an overview of your marketing performance, recent activities, and quick access to key features.
                  </p>
                </div>
              )}
              {activeSection === 'campaigns' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
                  <p className="text-gray-700 mt-4">
                    Create, monitor, and optimize your marketing campaigns with AI assistance.
                  </p>
                </div>
              )}
              {activeSection === 'content' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Content Creation</h2>
                  <p className="text-gray-700 mt-4">
                    Use AI tools to generate engaging marketing content tailored to your audience.
                  </p>
                </div>
              )}
              {activeSection === 'leads' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
                  <p className="text-gray-700 mt-4">
                    Track and nurture leads through the sales funnel with AI-powered scoring and automation.
                  </p>
                </div>
              )}
              {activeSection === 'email' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Email Automation</h2>
                  <p className="text-gray-700 mt-4">
                    Automate your email campaigns with personalized sequences and performance tracking.
                  </p>
                </div>
              )}
              {activeSection === 'social' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Social Media</h2>
                  <p className="text-gray-700 mt-4">
                    Manage your social media posts, schedules, and analytics across multiple platforms.
                  </p>
                </div>
              )}

              {/* Proposal Generator Section */}
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

              {/* Analytics through Troubleshooting sections */}
              {activeSection === 'analytics' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                  <p className="text-gray-700 mt-4">
                    Access detailed reports and insights to measure campaign performance and ROI.
                  </p>
                </div>
              )}
              {activeSection === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Settings & Admin</h2>
                  <p className="text-gray-700 mt-4">
                    Manage your account settings, integrations, and user permissions.
                  </p>
                </div>
              )}
              {activeSection === 'troubleshooting' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Troubleshooting</h2>
                  <p className="text-gray-700 mt-4">
                    Find solutions to common issues and get support for platform problems.
                  </p>
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
