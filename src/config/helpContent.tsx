export const helpContent: Record<string, { title: string; content: React.ReactNode }> = {
  dashboard: {
    title: 'Dashboard Overview',
    content: (
      <div className="space-y-4">
        <p>Welcome to your Action Insight Marketing Dashboard!</p>

        <h3 className="font-semibold text-lg mt-4">Quick Stats</h3>
        <p>View your key performance metrics at a glance including total campaigns, active campaigns, leads generated, and conversion rates.</p>

        <h3 className="font-semibold text-lg mt-4">Recent Activity</h3>
        <p>Track your latest marketing activities, campaign updates, and system notifications.</p>

        <h3 className="font-semibold text-lg mt-4">AI Chat Assistant</h3>
        <p>Use the AI chat feature to get instant help with campaign strategy, content ideas, and marketing advice.</p>

        <h3 className="font-semibold text-lg mt-4">Getting Started</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Connect your social media platforms in Settings</li>
          <li>Create your first campaign using the Campaigns page</li>
          <li>Set up Marketing Autopilot for automated optimization</li>
          <li>Generate content using AI-powered tools</li>
        </ul>
      </div>
    ),
  },

  conversationalDashboard: {
    title: 'Conversational Dashboard',
    content: (
      <div className="space-y-4">
        <p>Your AI-powered conversational marketing assistant - chat naturally to get insights, ask questions, or create campaigns without any marketing knowledge.</p>

        <h3 className="font-semibold text-lg mt-4">Create Campaigns Through Conversation</h3>
        <p>Perfect for non-marketers! Simply tell the AI you want to create a campaign, and it will guide you through a friendly conversation:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>AI asks simple questions about your product, audience, budget, and goals</li>
          <li>You answer in plain language - no marketing jargon needed</li>
          <li>AI automatically creates and launches your campaign when you're ready</li>
          <li>Campaign appears in your Autopilot Dashboard with real-time results</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">How to Get Started</h3>
        <p>Just type natural requests like:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>"I want to create a campaign"</li>
          <li>"Help me market my product"</li>
          <li>"I need to advertise my service"</li>
          <li>"Create a new campaign for me"</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Other Things You Can Ask</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>"Show me my campaign performance this month"</li>
          <li>"What are my top performing campaigns?"</li>
          <li>"Give me content ideas for social media"</li>
          <li>"How can I improve my marketing results?"</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Requirements</h3>
        <p>Make sure you have added your Anthropic Claude or Google Gemini API key in Settings - Integrations. The AI uses the latest available models to provide the best assistance.</p>
      </div>
    ),
  },

  campaigns: {
    title: 'Campaign Management',
    content: (
      <div className="space-y-4">
        <p>Manage all your marketing campaigns in one place.</p>

        <h3 className="font-semibold text-lg mt-4">Creating Campaigns</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Click "Create Campaign" to start a new campaign</li>
          <li>Choose campaign type (Social Media, Email, PPC, etc.)</li>
          <li>Set budget, timeline, and target audience</li>
          <li>Use AI assistance for campaign strategy</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Tracking Performance</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>View real-time metrics for each campaign</li>
          <li>Monitor budget allocation and spending</li>
          <li>Track conversions and ROI</li>
          <li>Get AI-powered optimization suggestions</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Managing Campaigns</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Edit campaign details anytime</li>
          <li>Pause or resume campaigns</li>
          <li>Duplicate successful campaigns</li>
          <li>Archive completed campaigns</li>
        </ul>
      </div>
    ),
  },

  autopilot: {
    title: 'Marketing Autopilot',
    content: (
      <div className="space-y-4">
        <p>Let AI automate your marketing campaigns 24/7 with intelligent optimization and video generation.</p>

        <h3 className="font-semibold text-lg mt-4">Setup</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Describe your business and target audience</li>
          <li>Set your monthly marketing budget</li>
          <li>Define your marketing goals and objectives</li>
          <li>Choose your preferred marketing channels</li>
          <li>Ensure you have both Anthropic Claude and Google Gemini API keys configured</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">How Autopilot Works</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Runs automatically every day at 2 AM UTC</li>
          <li>AI analyzes your campaign performance and makes strategic decisions</li>
          <li>Automatically optimizes budgets and targeting based on ROI</li>
          <li>Creates professional video ads for low-performing campaigns</li>
          <li>Adjusts strategies based on real-time results</li>
          <li>Logs all actions to the Activity Feed for full transparency</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Monitoring</h3>
        <p>Check the Activity Feed to see what Autopilot has done. You maintain full control and can pause or adjust settings anytime. Weekly reports are automatically generated with performance summaries.</p>
      </div>
    ),
  },

  aiVideoStudio: {
    title: 'AI Video Studio',
    content: (
      <div className="space-y-4">
        <p>Create professional marketing videos using AI - no video editing skills required!</p>

        <h3 className="font-semibold text-lg mt-4">Creating Videos</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enter your video concept or product description</li>
          <li>AI generates scene-by-scene storyboard with advanced multimodal reasoning</li>
          <li>Review and edit scenes as needed</li>
          <li>AI creates high-quality images for each scene</li>
          <li>Generate final video with industry-leading AI video generation</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Video Types</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Product demonstrations</li>
          <li>Social media ads (optimized for TikTok, Reels, YouTube Shorts)</li>
          <li>Explainer videos</li>
          <li>Brand storytelling</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Requirements</h3>
        <p>Make sure you have added your Google Gemini API key in Settings - Integrations. This is required for AI video generation.</p>

        <h3 className="font-semibold text-lg mt-4">Pricing</h3>
        <p>Video generation costs vary by quality setting. Check your API provider's current pricing for the most up-to-date rates.</p>
      </div>
    ),
  },

  content: {
    title: 'Content Generation',
    content: (
      <div className="space-y-4">
        <p>Generate high-quality marketing content using advanced AI for creative writing and marketing copy.</p>

        <h3 className="font-semibold text-lg mt-4">Available Content Types</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Social media posts (all platforms - optimized for each)</li>
          <li>Blog articles and SEO content</li>
          <li>Email campaigns with compelling subject lines</li>
          <li>Ad copy and headlines that convert</li>
          <li>Video scripts for marketing videos</li>
          <li>Landing page copy and CTAs</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">How to Generate Content</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Select content type and platform</li>
          <li>Provide brief description or topic</li>
          <li>AI generates multiple high-quality variations</li>
          <li>Edit and customize as needed</li>
          <li>Publish directly or save for later</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Best Practices</h3>
        <p>Be specific in your prompts. Include target audience, tone of voice, and key messages for better results. The AI excels at understanding context and creating persuasive, authentic content.</p>
      </div>
    ),
  },

  analytics: {
    title: 'Analytics & Insights',
    content: (
      <div className="space-y-4">
        <p>Track and analyze your marketing performance with AI-powered insights.</p>

        <h3 className="font-semibold text-lg mt-4">Key Metrics</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Campaign performance and ROI</li>
          <li>Lead generation and conversion rates</li>
          <li>Audience engagement metrics</li>
          <li>Budget utilization and spending</li>
          <li>Channel performance comparison</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">AI Insights</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Automated performance analysis with actionable recommendations</li>
          <li>Trend identification and predictions based on historical data</li>
          <li>Optimization recommendations for budget allocation</li>
          <li>Competitor benchmarking and gap analysis</li>
          <li>Natural language explanations of complex data patterns</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Reports</h3>
        <p>Generate custom reports for any date range. Export data as PDF or CSV for presentations and record-keeping. Ask the AI chat for specific insights about your data.</p>
      </div>
    ),
  },

  leads: {
    title: 'Lead Management',
    content: (
      <div className="space-y-4">
        <p>Capture, qualify, and nurture leads automatically.</p>

        <h3 className="font-semibold text-lg mt-4">Lead Sources</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Landing page forms</li>
          <li>Social media campaigns</li>
          <li>Email captures</li>
          <li>Assessment tools</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Lead Scoring</h3>
        <p>AI automatically scores leads based on engagement, demographics, and behavior. Focus on high-quality leads first.</p>

        <h3 className="font-semibold text-lg mt-4">Actions</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>View lead details and activity history</li>
          <li>Send automated follow-up emails</li>
          <li>Add notes and tags</li>
          <li>Move leads through sales funnel</li>
          <li>Export leads for CRM integration</li>
        </ul>
      </div>
    ),
  },

  settings: {
    title: 'Settings',
    content: (
      <div className="space-y-4">
        <p>Configure your account and integrations.</p>

        <h3 className="font-semibold text-lg mt-4">Profile Settings</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Update personal information</li>
          <li>Change password</li>
          <li>Set notification preferences</li>
          <li>Manage subscription</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">API Keys (Required)</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Anthropic Claude API Key</strong>: Required for all AI features including content generation, analytics, and chat. Get yours at https://console.anthropic.com/.</li>
          <li><strong>Google Gemini API Key</strong>: Required for video generation, visual AI tasks, and image generation. Get yours at https://aistudio.google.com/apikey.</li>
          <li>All keys are encrypted with AES-GCM and stored securely in the database</li>
          <li>Zero markup - you pay API providers directly at their standard rates</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Platform Connections</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Connect social media accounts (Facebook, Twitter, LinkedIn, etc.)</li>
          <li>Link email marketing platforms</li>
          <li>Integrate with analytics tools</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Display Mode</h3>
        <p>Switch between Simple Mode (minimal features) and Advanced Mode (all features) based on your needs.</p>
      </div>
    ),
  },

  social: {
    title: 'Social Media Management',
    content: (
      <div className="space-y-4">
        <p>Manage all your social media campaigns from one dashboard with AI content generation.</p>

        <h3 className="font-semibold text-lg mt-4">Supported Platforms</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Facebook and Instagram (posts, stories, reels)</li>
          <li>Twitter/X (tweets, threads)</li>
          <li>LinkedIn (posts, articles)</li>
          <li>TikTok (videos, captions)</li>
          <li>Pinterest (pins, boards)</li>
          <li>YouTube (video descriptions, community posts)</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Schedule posts across all platforms from one calendar</li>
          <li>AI-generated platform-specific content</li>
          <li>Optimal posting time recommendations based on audience engagement</li>
          <li>Engagement tracking and analytics across all channels</li>
          <li>Bulk post scheduling for efficiency</li>
          <li>Hashtag recommendations and trend analysis</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Best Practices</h3>
        <p>Use platform-specific content. What works on LinkedIn may not work on TikTok. The AI automatically adapts tone, length, and style for each platform to maximize engagement.</p>
      </div>
    ),
  },

  email: {
    title: 'Email Campaigns',
    content: (
      <div className="space-y-4">
        <p>Create and send automated email campaigns with AI copywriting.</p>

        <h3 className="font-semibold text-lg mt-4">Campaign Types</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Welcome sequences (onboarding automation)</li>
          <li>Newsletter campaigns with curated content</li>
          <li>Promotional emails with compelling offers</li>
          <li>Abandoned cart recovery with personalized messaging</li>
          <li>Re-engagement campaigns for dormant subscribers</li>
          <li>Post-purchase follow-ups and reviews</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Email Builder</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Drag-and-drop email editor (no coding required)</li>
          <li>Pre-built conversion-optimized templates</li>
          <li>AI-generated subject lines and content</li>
          <li>A/B testing for subject lines, content, and send times</li>
          <li>Mobile-responsive designs that look great on all devices</li>
          <li>Personalization tokens for dynamic content</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Automation</h3>
        <p>Set up triggers based on user behavior. Send targeted emails automatically based on actions, time delays, or conditions. AI helps optimize send times and personalization for maximum engagement.</p>
      </div>
    ),
  },

  proposals: {
    title: 'Proposal Generator',
    content: (
      <div className="space-y-4">
        <p>Create professional marketing proposals with AI assistance - persuasive, detailed, and tailored to your client.</p>

        <h3 className="font-semibold text-lg mt-4">How to Create Proposals</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enter client information and project details</li>
          <li>AI generates comprehensive proposal outline with persuasive copy</li>
          <li>Customize sections and pricing</li>
          <li>Add your branding and styling</li>
          <li>Send directly to clients or download PDF</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Proposal Sections</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Executive summary with compelling value proposition</li>
          <li>Situation analysis and market insights</li>
          <li>Recommended strategy with rationale</li>
          <li>Timeline and deliverables</li>
          <li>Pricing and terms (flexible packages)</li>
          <li>Case studies and social proof</li>
        </ul>
      </div>
    ),
  },

  workflows: {
    title: 'Marketing Workflows',
    content: (
      <div className="space-y-4">
        <p>Automate repetitive marketing tasks with custom workflows.</p>

        <h3 className="font-semibold text-lg mt-4">Creating Workflows</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Choose a trigger (new lead, form submission, etc.)</li>
          <li>Add actions (send email, create task, update CRM)</li>
          <li>Set conditions and delays</li>
          <li>Test workflow before activating</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Common Workflows</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Lead nurturing sequences</li>
          <li>Onboarding automation</li>
          <li>Event registration follow-ups</li>
          <li>Customer feedback collection</li>
        </ul>
      </div>
    ),
  },

  competitiveIntelligence: {
    title: 'Competitive Intelligence',
    content: (
      <div className="space-y-4">
        <p>Track and analyze competitor marketing strategies with AI-powered competitive analysis.</p>

        <h3 className="font-semibold text-lg mt-4">What You Can Track</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Competitor social media activity and engagement patterns</li>
          <li>Content strategies, themes, and messaging frameworks</li>
          <li>Ad campaigns and creative approaches</li>
          <li>SEO rankings and keyword strategies</li>
          <li>Pricing and positioning changes</li>
          <li>Product launches and feature updates</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">AI Insights</h3>
        <p>AI analyzes competitor data to identify strategic gaps, messaging opportunities, and differentiation strategies. Get actionable recommendations on how to position against competitors and capture market share.</p>
      </div>
    ),
  },

  keywordResearch: {
    title: 'Keyword Research',
    content: (
      <div className="space-y-4">
        <p>Find high-value keywords for SEO and PPC campaigns with AI semantic analysis.</p>

        <h3 className="font-semibold text-lg mt-4">Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Keyword suggestions based on your industry and competitive landscape</li>
          <li>Search volume and competition data analysis</li>
          <li>Long-tail keyword opportunities with conversion potential</li>
          <li>Question-based keywords for content marketing</li>
          <li>Local SEO keywords for geographic targeting</li>
          <li>Semantic keyword clusters for topic authority</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">How to Use</h3>
        <p>Enter your main topic or seed keywords. AI will generate related keywords grouped by search intent (informational, commercial, transactional) and buyer journey stage. Get content recommendations for each keyword cluster.</p>
      </div>
    ),
  },

  landingPageBuilder: {
    title: 'Landing Page Builder',
    content: (
      <div className="space-y-4">
        <p>Create high-converting landing pages without coding, powered by AI copywriting.</p>

        <h3 className="font-semibold text-lg mt-4">Building Pages</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Choose from conversion-optimized templates</li>
          <li>Drag-and-drop page elements (no coding required)</li>
          <li>AI-generated headlines and copy</li>
          <li>Add forms, CTAs, and media (images, videos)</li>
          <li>Mobile responsive by default</li>
          <li>SEO-optimized structure and meta tags</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Optimization</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>A/B testing built-in for headlines, CTAs, and layouts</li>
          <li>Conversion tracking and funnel analysis</li>
          <li>Heat maps and user behavior analytics</li>
          <li>AI-powered SEO optimization suggestions</li>
          <li>Performance scoring and improvement recommendations</li>
        </ul>
      </div>
    ),
  },

  leadCaptureForms: {
    title: 'Lead Capture Forms',
    content: (
      <div className="space-y-4">
        <p>Create forms to capture and qualify leads.</p>

        <h3 className="font-semibold text-lg mt-4">Form Types</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Contact forms</li>
          <li>Newsletter signups</li>
          <li>Assessment quizzes</li>
          <li>Demo request forms</li>
          <li>Event registrations</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Conditional logic</li>
          <li>Multi-step forms</li>
          <li>Automatic lead scoring</li>
          <li>Email notifications</li>
          <li>CRM integration</li>
        </ul>
      </div>
    ),
  },

  aiCampaignCopilot: {
    title: 'AI Campaign Copilot',
    content: (
      <div className="space-y-4">
        <p>Your AI assistant for campaign strategy and execution.</p>

        <h3 className="font-semibold text-lg mt-4">How It Helps</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Generates comprehensive campaign strategies based on your goals</li>
          <li>Suggests target audiences with detailed personas</li>
          <li>Creates key messaging that resonates with your audience</li>
          <li>Recommends optimal channel mix for your budget</li>
          <li>Optimizes budget allocation across channels</li>
          <li>Provides competitive analysis and differentiation strategies</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Using the Copilot</h3>
        <p>Describe your campaign goals and constraints. AI will generate a comprehensive strategy with actionable steps, including content ideas, timing recommendations, and success metrics.</p>
      </div>
    ),
  },

  gtmPlanner: {
    title: 'Go-to-Market Planner',
    content: (
      <div className="space-y-4">
        <p>Plan and execute product launches and market entry strategies with AI strategic planning.</p>

        <h3 className="font-semibold text-lg mt-4">Planning Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Market analysis and sizing with TAM/SAM/SOM calculations</li>
          <li>Competitive positioning and differentiation strategy</li>
          <li>Launch timeline and milestones with dependencies</li>
          <li>Multi-channel strategy and prioritization</li>
          <li>Budget planning with ROI projections</li>
          <li>Risk analysis and mitigation strategies</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">AI Assistance</h3>
        <p>AI analyzes your market, identifies opportunities, suggests positioning strategies, and creates comprehensive launch plans based on industry best practices and competitive analysis.</p>
      </div>
    ),
  },

  customerSegmentation: {
    title: 'Customer Segmentation',
    content: (
      <div className="space-y-4">
        <p>Segment your audience for targeted marketing.</p>

        <h3 className="font-semibold text-lg mt-4">Segmentation Criteria</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Demographics (age, location, income)</li>
          <li>Behavior (purchase history, engagement)</li>
          <li>Psychographics (interests, values)</li>
          <li>Firmographics (for B2B)</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Using Segments</h3>
        <p>Create targeted campaigns, personalized content, and custom offers for each segment to improve conversion rates.</p>
      </div>
    ),
  },

  viralVideoMarketing: {
    title: 'Viral Video Marketing',
    content: (
      <div className="space-y-4">
        <p>Create and optimize videos for maximum social engagement using AI.</p>

        <h3 className="font-semibold text-lg mt-4">Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>AI-powered script generation (hooks, storytelling, CTAs)</li>
          <li>Industry-leading AI video generation</li>
          <li>Viral hooks and storytelling frameworks proven to drive engagement</li>
          <li>Platform-specific optimization (TikTok, Reels, YouTube Shorts)</li>
          <li>Trend analysis and recommendations based on current viral patterns</li>
          <li>Engagement prediction using historical performance data</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Best Practices</h3>
        <p>Hook viewers in first 3 seconds, keep it short (15-60s), include captions for accessibility, and end with clear CTA. Use AI's multimodal capabilities to create visually compelling narratives.</p>
      </div>
    ),
  },

  creativeWorkflow: {
    title: 'Creative Workflow',
    content: (
      <div className="space-y-4">
        <p>Streamline your creative production process.</p>

        <h3 className="font-semibold text-lg mt-4">Workflow Steps</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Brief creation and approval</li>
          <li>AI-assisted ideation</li>
          <li>Content creation and editing</li>
          <li>Review and feedback</li>
          <li>Final approval and publishing</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Collaboration</h3>
        <p>Assign tasks, leave comments, track versions, and manage approvals all in one place.</p>
      </div>
    ),
  },

  adminDashboard: {
    title: 'Admin Dashboard',
    content: (
      <div className="space-y-4">
        <p>System administration and configuration.</p>

        <h3 className="font-semibold text-lg mt-4">Admin Functions</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>User management</li>
          <li>System settings</li>
          <li>API configuration</li>
          <li>Usage monitoring</li>
          <li>Billing and subscriptions</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Security</h3>
        <p>Access admin features only if you have administrative privileges.</p>
      </div>
    ),
  },

  connectPlatforms: {
    title: 'Connect Platforms',
    content: (
      <div className="space-y-4">
        <p>Link your marketing platforms and tools.</p>

        <h3 className="font-semibold text-lg mt-4">Available Integrations</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Social media platforms</li>
          <li>Email service providers</li>
          <li>Analytics tools</li>
          <li>CRM systems</li>
          <li>Ad platforms</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">How to Connect</h3>
        <p>Click on each platform, authorize the connection, and grant required permissions. Data will sync automatically.</p>
      </div>
    ),
  },

  // Marketing Glossary for Non-Marketers
  marketingGlossary: {
    title: 'Marketing Terms Explained',
    content: (
      <div className="space-y-4">
        <p>New to marketing? Here are the key terms you'll see in this platform, explained in plain English.</p>

        <h3 className="font-semibold text-lg mt-4">Performance Metrics</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>ROI (Return on Investment)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">For every $1 you spend, how much do you get back? If your ROI is 200%, you get $2 back for every $1 spent. Higher is better.</p>
          </li>
          <li>
            <strong>Leads</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">People who showed interest in your business. They might fill out a form, sign up for something, or request more info. Each lead could become a customer.</p>
          </li>
          <li>
            <strong>Conversions</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">When someone does what you wanted - buys something, signs up, downloads a file, etc. A "conversion rate" of 5% means 5 out of 100 visitors took that action.</p>
          </li>
          <li>
            <strong>CTR (Click-Through Rate)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Out of everyone who saw your ad, what percentage clicked it? A 2% CTR is good for most ads. 5% is excellent.</p>
          </li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Audience Metrics</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Impressions</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">How many times your content was shown. One person might see it multiple times, so this can be higher than your reach.</p>
          </li>
          <li>
            <strong>Reach</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">How many different people saw your content. Unlike impressions, each person is only counted once.</p>
          </li>
          <li>
            <strong>Engagement</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Any interaction with your content - likes, comments, shares, clicks, saves. High engagement means people found it interesting.</p>
          </li>
          <li>
            <strong>Target Audience</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">The specific group of people most likely to buy from you. Defined by age, location, interests, job, etc.</p>
          </li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Campaign Terms</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Campaign</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">A coordinated set of marketing activities with one goal. Like a project with a budget, timeline, and objective.</p>
          </li>
          <li>
            <strong>Budget</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">How much you're willing to spend on marketing. Start small ($500-1000/month), increase what works.</p>
          </li>
          <li>
            <strong>CTA (Call to Action)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">What you want people to do next. "Buy Now", "Sign Up Free", "Learn More" are all CTAs.</p>
          </li>
          <li>
            <strong>A/B Testing</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing two versions of something to see which performs better. Like testing two headlines to see which gets more clicks.</p>
          </li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Lead Scoring</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Lead Score (90-100)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hot Lead - Very interested, contact immediately. These are your best potential customers.</p>
          </li>
          <li>
            <strong>Lead Score (70-89)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Warm Lead - Showing interest, follow up soon. They're considering you but may need more info.</p>
          </li>
          <li>
            <strong>Lead Score (50-69)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Interested - Send them helpful content. They're curious but not ready to buy yet.</p>
          </li>
          <li>
            <strong>Lead Score (0-49)</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cold Lead - May need more time or nurturing. Keep them in your email list for later.</p>
          </li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Channel Terms</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Organic</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Free marketing - like posting on social media or getting found on Google without paying for ads.</p>
          </li>
          <li>
            <strong>Paid/PPC</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Marketing you pay for. PPC (Pay-Per-Click) means you only pay when someone clicks your ad.</p>
          </li>
          <li>
            <strong>SEO</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">Search Engine Optimization - making your website show up higher on Google for relevant searches.</p>
          </li>
          <li>
            <strong>Funnel</strong>
            <p className="text-sm text-gray-600 dark:text-gray-400">The journey from stranger to customer. Top of funnel = awareness, bottom = purchase. People "drop off" at each stage, like a funnel.</p>
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mt-6">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Quick Tip</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Don't worry about memorizing these! Hover over any metric in the dashboard to see its explanation. The Glossary button in the top right gives you quick access to all definitions.
          </p>
        </div>
      </div>
    ),
  },

  // Quick Start Guide for Non-Marketers
  quickStartGuide: {
    title: 'Getting Started - No Marketing Experience Needed',
    content: (
      <div className="space-y-4">
        <p>New to marketing? This guide will get you started in under 10 minutes.</p>

        <h3 className="font-semibold text-lg mt-4">Step 1: Choose Your Path</h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <ul className="space-y-3">
            <li>
              <strong className="text-purple-600 dark:text-purple-400">AI Autopilot</strong> (Recommended for beginners)
              <p className="text-sm text-gray-600 dark:text-gray-400">Just describe your business and set a budget. AI handles everything else - creating campaigns, writing content, optimizing results.</p>
            </li>
            <li>
              <strong className="text-blue-600 dark:text-blue-400">Quick Start Campaign</strong>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chat with AI to plan your campaign step by step. More control, but AI still does the heavy lifting.</p>
            </li>
          </ul>
        </div>

        <h3 className="font-semibold text-lg mt-4">Step 2: Add Your API Keys</h3>
        <p>Go to Settings and add your API keys. You'll need:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Anthropic Claude</strong> - For AI content and strategy (required)</li>
          <li><strong>Google Gemini</strong> - For video generation (optional but recommended)</li>
        </ul>
        <p className="text-sm text-gray-500">You pay the AI providers directly - no markup from us.</p>

        <h3 className="font-semibold text-lg mt-4">Step 3: Describe Your Business</h3>
        <p>Tell the AI what you sell and who you want to reach. Be specific:</p>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm">
          <p className="text-gray-600 dark:text-gray-400 italic">"We sell handmade leather bags to professional women aged 30-50 who value quality and craftsmanship over fast fashion."</p>
        </div>

        <h3 className="font-semibold text-lg mt-4">Step 4: Set Your Budget</h3>
        <p>Start small and increase what works:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>$500/month</strong> - Good for testing, expect 5-10 leads</li>
          <li><strong>$1000/month</strong> - Recommended starter, expect 20-40 leads</li>
          <li><strong>$2000+/month</strong> - For scaling what works</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Step 5: Let AI Work</h3>
        <p>Once set up, the AI will:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Create and launch campaigns automatically</li>
          <li>Write content for your ads and posts</li>
          <li>Optimize your budget daily</li>
          <li>Generate leads and report results</li>
        </ul>
        <p className="mt-2">Check your dashboard daily to see leads and performance. First results typically appear within 24-48 hours.</p>

        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mt-6">
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">You're Ready!</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            That's all you need to get started. The platform will guide you through everything else. Don't worry about marketing jargon - hover over any term to see what it means.
          </p>
        </div>
      </div>
    ),
  },

  // Budget Guide for Non-Marketers
  budgetGuide: {
    title: 'How Much Should I Spend on Marketing?',
    content: (
      <div className="space-y-4">
        <p>One of the most common questions! Here's a practical guide to setting your marketing budget.</p>

        <h3 className="font-semibold text-lg mt-4">The General Rule</h3>
        <p>Most businesses spend 5-15% of their revenue on marketing. But when you're starting out or testing a new product, start smaller and increase what works.</p>

        <h3 className="font-semibold text-lg mt-4">Budget Levels Explained</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-lg">$500/month - Testing Phase</h4>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Best for: Trying out the platform, testing 1-2 channels</li>
              <li>Expect: 5-10 leads, basic data for learning</li>
              <li>Limitation: May not have enough data to optimize well</li>
            </ul>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-lg">$1,000/month - Starter</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Recommended</span>
            </div>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Best for: Small businesses, first real campaigns</li>
              <li>Expect: 20-40 leads, enough data to optimize</li>
              <li>Good balance of learning and results</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-lg">$2,000/month - Growth</h4>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Best for: Businesses ready to scale what works</li>
              <li>Expect: 50-100 leads, test multiple channels</li>
              <li>Enough to run serious A/B tests</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-lg">$5,000+/month - Aggressive</h4>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Best for: Proven products, rapid expansion</li>
              <li>Expect: 150-300+ leads, full multi-channel</li>
              <li>Only after you know what works</li>
            </ul>
          </div>
        </div>

        <h3 className="font-semibold text-lg mt-4">Our Recommendation</h3>
        <p>Start with $1,000/month for your first month. This gives you enough data to see what's working. After 30 days:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>If ROI is positive, consider increasing budget</li>
          <li>If results are mixed, let AI optimize for another month</li>
          <li>If no results, review your business description and targets</li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 mt-6">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Important</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Don't spend more than you can afford to lose while learning. Marketing takes time to optimize - expect to wait 30-60 days before judging results.
          </p>
        </div>
      </div>
    ),
  },
};
