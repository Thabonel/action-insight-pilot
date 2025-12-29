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
        <p>Use the AI chat feature powered by Claude Opus 4.5 to get instant help with campaign strategy, content ideas, and marketing advice.</p>

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
        <p>Let Claude Opus 4.5 automate your marketing campaigns 24/7 with intelligent optimization and video generation.</p>

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
          <li>Claude Opus 4.5 analyzes your campaign performance and makes strategic decisions</li>
          <li>Automatically optimizes budgets and targeting based on ROI</li>
          <li>Creates professional video ads using Gemini 3 and Veo 3 for low-performing campaigns</li>
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
        <p>Create professional marketing videos using Google Gemini 3 and Veo 3 - no video editing skills required!</p>

        <h3 className="font-semibold text-lg mt-4">Creating Videos</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enter your video concept or product description</li>
          <li>Gemini 3 Flash generates scene-by-scene storyboard with advanced multimodal reasoning</li>
          <li>Review and edit scenes as needed</li>
          <li>AI creates high-quality images for each scene using Nano Banana</li>
          <li>Generate final video with Google Veo 3 (industry-leading video generation)</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Video Types</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Product demonstrations</li>
          <li>Social media ads (optimized for TikTok, Reels, YouTube Shorts)</li>
          <li>Explainer videos</li>
          <li>Brand storytelling</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Requirements</h3>
        <p>Make sure you have added your Google Gemini API key in Settings - Integrations. This is required for AI video generation with Gemini 3 and Veo 3.</p>

        <h3 className="font-semibold text-lg mt-4">Pricing</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Veo 3 Fast: $0.40/second (recommended for social media)</li>
          <li>Veo 3 Standard: $0.75/second (premium quality)</li>
          <li>Nano Banana: $0.039/image</li>
        </ul>
      </div>
    ),
  },

  content: {
    title: 'Content Generation',
    content: (
      <div className="space-y-4">
        <p>Generate high-quality marketing content using Claude Opus 4.5 - the world's most advanced AI for creative writing and marketing copy.</p>

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
          <li>Claude Opus 4.5 generates multiple high-quality variations</li>
          <li>Edit and customize as needed</li>
          <li>Publish directly or save for later</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Best Practices</h3>
        <p>Be specific in your prompts. Include target audience, tone of voice, and key messages for better results. Claude excels at understanding context and creating persuasive, authentic content.</p>
      </div>
    ),
  },

  analytics: {
    title: 'Analytics & Insights',
    content: (
      <div className="space-y-4">
        <p>Track and analyze your marketing performance with AI-powered insights from Claude Opus 4.5.</p>

        <h3 className="font-semibold text-lg mt-4">Key Metrics</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Campaign performance and ROI</li>
          <li>Lead generation and conversion rates</li>
          <li>Audience engagement metrics</li>
          <li>Budget utilization and spending</li>
          <li>Channel performance comparison</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">AI Insights (Powered by Claude Opus 4.5)</h3>
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
          <li><strong>Anthropic Claude API Key</strong>: Required for all AI features including content generation, analytics, and chat. Get yours at https://console.anthropic.com/. Uses Claude Opus 4.5, Sonnet 4.5, and Haiku 4.5 models.</li>
          <li><strong>Google Gemini API Key</strong>: Required for video generation (Veo 3), visual AI tasks, and image generation. Get yours at https://aistudio.google.com/apikey. Uses Gemini 3 Flash, Gemini 3 Pro, and Veo 3 models.</li>
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
        <p>Manage all your social media campaigns from one dashboard with Claude Opus 4.5 content generation.</p>

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
          <li>AI-generated platform-specific content with Claude Opus 4.5</li>
          <li>Optimal posting time recommendations based on audience engagement</li>
          <li>Engagement tracking and analytics across all channels</li>
          <li>Bulk post scheduling for efficiency</li>
          <li>Hashtag recommendations and trend analysis</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Best Practices</h3>
        <p>Use platform-specific content. What works on LinkedIn may not work on TikTok. Claude Opus 4.5 automatically adapts tone, length, and style for each platform to maximize engagement.</p>
      </div>
    ),
  },

  email: {
    title: 'Email Campaigns',
    content: (
      <div className="space-y-4">
        <p>Create and send automated email campaigns with Claude Opus 4.5 copywriting.</p>

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
          <li>AI-generated subject lines and content with Claude Opus 4.5</li>
          <li>A/B testing for subject lines, content, and send times</li>
          <li>Mobile-responsive designs that look great on all devices</li>
          <li>Personalization tokens for dynamic content</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Automation</h3>
        <p>Set up triggers based on user behavior. Send targeted emails automatically based on actions, time delays, or conditions. Claude helps optimize send times and personalization for maximum engagement.</p>
      </div>
    ),
  },

  proposals: {
    title: 'Proposal Generator',
    content: (
      <div className="space-y-4">
        <p>Create professional marketing proposals with Claude Opus 4.5 assistance - persuasive, detailed, and tailored to your client.</p>

        <h3 className="font-semibold text-lg mt-4">How to Create Proposals</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enter client information and project details</li>
          <li>Claude Opus 4.5 generates comprehensive proposal outline with persuasive copy</li>
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
        <p>Track and analyze competitor marketing strategies with Claude Opus 4.5 competitive analysis.</p>

        <h3 className="font-semibold text-lg mt-4">What You Can Track</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Competitor social media activity and engagement patterns</li>
          <li>Content strategies, themes, and messaging frameworks</li>
          <li>Ad campaigns and creative approaches</li>
          <li>SEO rankings and keyword strategies</li>
          <li>Pricing and positioning changes</li>
          <li>Product launches and feature updates</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">AI Insights (Claude Opus 4.5)</h3>
        <p>Claude analyzes competitor data to identify strategic gaps, messaging opportunities, and differentiation strategies. Get actionable recommendations on how to position against competitors and capture market share.</p>
      </div>
    ),
  },

  keywordResearch: {
    title: 'Keyword Research',
    content: (
      <div className="space-y-4">
        <p>Find high-value keywords for SEO and PPC campaigns with Claude Opus 4.5 semantic analysis.</p>

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
        <p>Enter your main topic or seed keywords. Claude Opus 4.5 will generate related keywords grouped by search intent (informational, commercial, transactional) and buyer journey stage. Get content recommendations for each keyword cluster.</p>
      </div>
    ),
  },

  landingPageBuilder: {
    title: 'Landing Page Builder',
    content: (
      <div className="space-y-4">
        <p>Create high-converting landing pages without coding, powered by Claude Opus 4.5 copywriting.</p>

        <h3 className="font-semibold text-lg mt-4">Building Pages</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Choose from conversion-optimized templates</li>
          <li>Drag-and-drop page elements (no coding required)</li>
          <li>AI-generated headlines and copy with Claude Opus 4.5</li>
          <li>Add forms, CTAs, and media (images, videos)</li>
          <li>Mobile responsive by default</li>
          <li>SEO-optimized structure and meta tags</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Optimization</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>A/B testing built-in for headlines, CTAs, and layouts</li>
          <li>Conversion tracking and funnel analysis</li>
          <li>Heat maps and user behavior analytics</li>
          <li>AI-powered SEO optimization suggestions from Claude</li>
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
        <p>Your AI assistant powered by Claude Opus 4.5 for campaign strategy and execution.</p>

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
        <p>Describe your campaign goals and constraints. Claude Opus 4.5 will generate a comprehensive strategy with actionable steps, including content ideas, timing recommendations, and success metrics.</p>
      </div>
    ),
  },

  gtmPlanner: {
    title: 'Go-to-Market Planner',
    content: (
      <div className="space-y-4">
        <p>Plan and execute product launches and market entry strategies with Claude Opus 4.5 strategic planning.</p>

        <h3 className="font-semibold text-lg mt-4">Planning Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Market analysis and sizing with TAM/SAM/SOM calculations</li>
          <li>Competitive positioning and differentiation strategy</li>
          <li>Launch timeline and milestones with dependencies</li>
          <li>Multi-channel strategy and prioritization</li>
          <li>Budget planning with ROI projections</li>
          <li>Risk analysis and mitigation strategies</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">AI Assistance (Claude Opus 4.5)</h3>
        <p>Claude analyzes your market, identifies opportunities, suggests positioning strategies, and creates comprehensive launch plans based on industry best practices and competitive analysis.</p>
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
        <p>Create and optimize videos for maximum social engagement using Claude Opus 4.5 and Gemini 3.</p>

        <h3 className="font-semibold text-lg mt-4">Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>AI-powered script generation with Claude Opus 4.5 (hooks, storytelling, CTAs)</li>
          <li>Video generation with Google Veo 3 (industry-leading quality)</li>
          <li>Viral hooks and storytelling frameworks proven to drive engagement</li>
          <li>Platform-specific optimization (TikTok, Reels, YouTube Shorts)</li>
          <li>Trend analysis and recommendations based on current viral patterns</li>
          <li>Engagement prediction using historical performance data</li>
        </ul>

        <h3 className="font-semibold text-lg mt-4">Best Practices</h3>
        <p>Hook viewers in first 3 seconds, keep it short (15-60s), include captions for accessibility, and end with clear CTA. Use Gemini 3's multimodal capabilities to create visually compelling narratives.</p>
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
};
