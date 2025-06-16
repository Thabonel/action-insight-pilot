
import { KnowledgeService } from './knowledge-service'

export class DocumentationKnowledgeService {
  private static readonly PLATFORM_DOCS_BUCKET = 'platform-documentation'
  
  static async initializePlatformDocumentation(): Promise<void> {
    try {
      // Check if platform documentation bucket exists
      const buckets = await KnowledgeService.getBuckets()
      const platformBucket = buckets.find(b => b.name === this.PLATFORM_DOCS_BUCKET)
      
      if (!platformBucket) {
        // Create platform documentation bucket
        await KnowledgeService.createBucket(
          this.PLATFORM_DOCS_BUCKET,
          'general',
          'Complete platform documentation and user guides for AI assistant integration'
        )
        
        // Upload documentation sections
        await this.uploadDocumentationSections(platformBucket?.id)
      }
    } catch (error) {
      console.error('Failed to initialize platform documentation:', error)
    }
  }
  
  private static async uploadDocumentationSections(bucketId?: string): Promise<void> {
    if (!bucketId) return
    
    const documentationSections = [
      {
        title: 'Getting Started Guide',
        content: `# Getting Started Guide

Welcome to Your AI Marketing Platform - complete setup guide including:
- Account setup and profile configuration
- OpenAI API key setup in Settings > API Keys
- Dashboard overview and navigation
- First campaign creation
- Knowledge bucket setup
- Social media and email platform connections

Platform Overview:
- AI-Powered Core: Conversational AI assistant, automated content generation, smart recommendations
- Knowledge Management: Organize marketing knowledge, best practices, and campaign data for AI access
- Campaign Intelligence: Create, optimize, and automate marketing campaigns with AI insights
- Automation Hub: Workflow automation, email sequences, social posting, and lead nurturing`
      },
      {
        title: 'Knowledge Management Complete Guide',
        content: `# Knowledge Management System

Complete guide to organizing and managing marketing knowledge:

## Accessing Knowledge Management
Navigate to Settings > Knowledge Management or directly via Settings page

## Knowledge Buckets
Two types of knowledge containers:
- Campaign Buckets: Campaign-specific knowledge tied to individual marketing campaigns
- General Buckets: Industry knowledge and best practices for all campaigns

## Creating Knowledge Buckets
1. Click 'New Bucket' in Knowledge Management
2. Choose bucket type (Campaign-specific or General)
3. Enter bucket name and description
4. For campaign buckets, select associated campaign
5. Click 'Create Bucket' to save

## Uploading Documents
1. Click 'Upload Document' button
2. Select target knowledge bucket
3. Choose document or paste content directly (.txt, .md, PDF, Word, JSON)
4. Enter document title and description
5. Click 'Upload' to process
6. Wait for processing to complete (status: Ready)

## Searching Knowledge Base
1. Click 'Search Knowledge' in Knowledge Management
2. Enter natural language search query
3. Filter by bucket type or specific campaign
4. Review results with similarity scores
5. Click results to see full content

Best Practices:
- Create separate buckets for different topics or campaigns
- Use descriptive names and detailed descriptions
- Upload high-quality, relevant documents
- AI automatically uses this knowledge in conversations`
      },
      {
        title: 'AI Assistant & Conversational Help',
        content: `# AI Assistant & Chat System

Complete guide to using your AI assistant:

## Accessing AI Assistant
Navigate to 'Conversational AI' from main menu
Ensure OpenAI API key is configured in Settings > API Keys

## Types of AI Assistance
1. Daily Focus Recommendations: "What should I focus on today?"
2. Campaign Analysis: "How are my campaigns performing?"
3. Strategy Questions: "What's the best way to increase email open rates?"
4. Platform Help: "How do I create a knowledge bucket?"

## AI-Enhanced Responses
- AI searches your knowledge base for relevant information
- Responses incorporate your specific documents and data
- Recommendations tailored to your business context
- References specific knowledge sources

## Server Status Management
- Active: AI ready to respond immediately
- Sleeping: Server needs 30-60 seconds to wake up
- Error: Connection issues or configuration problems

## Best Practices for AI Conversations
Effective Questions:
- Be specific about your goals
- Provide context about your business
- Ask for actionable recommendations
- Reference specific campaigns or data
- Ask follow-up questions for clarity

The AI assistant has access to your knowledge base and provides personalized, contextual responses based on your uploaded documentation and campaign data.`
      },
      {
        title: 'Campaign Management Complete Guide',
        content: `# Campaign Management System

Complete guide to creating and managing marketing campaigns:

## Campaign Intelligence Hub
Navigate to Campaign Management from main menu

## Creating New Campaigns
1. Click 'Create' button in top navigation
2. Choose from campaign templates:
   - Email Marketing Campaign
   - Social Media Campaign
   - Multi-Channel Campaign
   - Product Launch Campaign
   - Lead Generation Campaign
3. Fill in campaign details: name, description, objectives
4. Set target audience and demographics
5. Define budget and timeline parameters
6. Select channels and platforms
7. Review AI suggestions for optimization
8. Launch or schedule your campaign

## Campaign Templates
- Email Marketing: Pre-built sequences, A/B testing, automation triggers
- Social Media: Platform-specific content, optimal posting times, hashtag strategies
- Lead Generation: Lead magnets, scoring algorithms, nurture sequences
- Product Launch: Pre-launch buzz, launch coordination, post-launch optimization

## AI-Powered Features
- Intelligent Campaign Creator: AI suggests campaign structure and optimization
- Performance Dashboard: Real-time analytics with AI insights
- Timing Intelligence: Optimal send times and posting schedules
- Workflow Automation: Smart triggers for scaling, pausing, optimizing

Campaign creation is enhanced by AI analysis of your goals and historical performance data.`
      },
      {
        title: 'Settings & Configuration Guide',
        content: `# Settings & Administration

Complete settings configuration guide:

## Settings Sections
1. API Keys & Security: Configure OpenAI API key, authentication settings
2. Knowledge Management: Manage knowledge buckets, upload documents
3. Platform Integrations: Connect social media, email services, third-party tools
4. Automation Settings: Configure webhooks, data sync, automated workflows

## Essential Setup Steps
1. Navigate to Settings from main menu
2. Configure OpenAI API key in 'API Keys' section (REQUIRED for AI features)
3. Set up Knowledge Management buckets
4. Connect social media platforms in 'Integrations'
5. Configure email automation settings
6. Set up webhooks for external system integration
7. Review security and privacy settings
8. Test all integrations

## Platform Integrations Available
- Social Platforms: Facebook, Twitter, LinkedIn, Instagram
- Email Services: Mailchimp, SendGrid, ConvertKit
- CRM Systems: Salesforce, HubSpot, Pipedrive
- Analytics: Google Analytics, Facebook Insights

Your OpenAI API key is required for AI features to work. Keep this key secure and never share it.`
      },
      {
        title: 'Troubleshooting & Common Issues',
        content: `# Troubleshooting Guide

Solutions to common platform issues:

## AI Assistant Not Responding
- Check OpenAI API key configured in Settings
- Verify API key has sufficient credits
- Wait for server wake-up if showing "sleeping" status
- Try refreshing page and asking again

## Knowledge Search Not Working
- Ensure documents have "Ready" status (not "Processing")
- Try more specific search queries
- Check content exists in knowledge buckets
- Verify document upload was successful

## Campaign Creation Issues
- Ensure all required fields completed
- Check internet connection for template loading
- Try refreshing and using different template
- Clear browser cache if experiencing loading issues

## Integration Connection Problems
- Verify API credentials are correct and active
- Check platform-specific permission settings
- Try disconnecting and reconnecting integration
- Ensure third-party platforms allow API access

## Server Status Understanding
- Active: AI backend ready and responsive
- Sleeping: Server needs 30-60 seconds to wake up
-

 Error: Connection issues or configuration problems

## Getting Additional Help
- Ask AI assistant: "How do I [specific task]?" for step-by-step guidance
- Use knowledge search to find relevant help documents
- Contact support for technical issues

Most issues resolved by refreshing page, checking internet connection, and verifying API key configuration.`
      }
    ]
    
    // Upload each section as a separate document
    for (const section of documentationSections) {
      try {
        await KnowledgeService.uploadDocument(
          bucketId,
          section.title,
          section.content,
          `${section.title.toLowerCase().replace(/\s+/g, '-')}.md`,
          'text/markdown'
        )
      } catch (error) {
        console.error(`Failed to upload documentation section: ${section.title}`, error)
      }
    }
  }
  
  static async searchPlatformDocumentation(query: string): Promise<any[]> {
    try {
      return await KnowledgeService.searchKnowledge(
        query,
        'general',
        undefined,
        5
      )
    } catch (error) {
      console.error('Failed to search platform documentation:', error)
      return []
    }
  }
}
