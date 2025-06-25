# Integrations Documentation

## Overview

PAM integrates with various third-party services to provide comprehensive marketing automation capabilities. The platform uses a secure, token-based authentication system for external integrations and implements robust error handling and retry mechanisms.

## Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PAM Frontend  │    │   Supabase      │    │   External      │
│                 │◄──►│   Backend       │◄──►│   Services      │
│ • OAuth Flow    │    │                 │    │                 │
│ • Token Mgmt    │    │ • Token Storage │    │ • OpenAI        │
│ • API Calls     │    │ • Edge Functions│    │ • Resend        │
│ • Error Handling│    │ • Encryption    │    │ • Social APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Integrations

### OpenAI API Integration

**Purpose**: AI-powered content generation and chat functionality

**Configuration**:
```typescript
// Supabase Edge Function configuration
const openAI = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// Content generation
const generateContent = async (prompt: string, options: GenerationOptions) => {
  const response = await openAI.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a marketing content creation assistant.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7
  });

  return response.choices[0]?.message?.content;
};
```

**Edge Function Implementation**:
```typescript
// supabase/functions/chat-ai/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://deno.land/x/openai@v4.20.1/mod.ts';

serve(async (req) => {
  try {
    const { message, context, sessionId } = await req.json();
    
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Get conversation history
    const conversationHistory = await getConversationHistory(sessionId);
    
    // Build messages array
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(context)
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content;

    // Save conversation
    await saveConversation(sessionId, message, response);

    return new Response(
      JSON.stringify({ response }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Frontend Usage**:
```typescript
// src/hooks/use-ai-chat.ts
export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string, context?: any) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message,
          context,
          sessionId: currentSessionId
        }
      });

      if (error) throw error;

      const newMessage: ChatMessage = {
        id: generateId(),
        user_message: message,
        ai_response: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      return data.response;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
};
```

---

### Resend Email Integration

**Purpose**: Transactional and marketing email delivery

**Configuration**:
```typescript
// supabase/functions/send-email/index.ts
import { Resend } from 'https://esm.sh/resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export const sendEmail = async (emailData: EmailData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: emailData.from || 'PAM <noreply@your-domain.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      tags: emailData.tags,
      headers: emailData.headers
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return { success: true, id: data?.id };
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};
```

**Email Campaign Implementation**:
```typescript
// Email campaign sending
const sendCampaignEmails = async (campaignId: string) => {
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select(`
      *,
      email_templates(*),
      campaigns(*)
    `)
    .eq('id', campaignId)
    .single();

  const { data: recipients } = await supabase
    .from('email_contacts')
    .select('*')
    .eq('subscribed', true);

  for (const recipient of recipients) {
    try {
      const personalizedContent = personalizeEmailContent(
        campaign.email_templates.html_content,
        recipient
      );

      await supabase.functions.invoke('send-email', {
        body: {
          to: [recipient.email],
          subject: campaign.subject_line,
          html: personalizedContent,
          tags: [
            { name: 'campaign_id', value: campaignId },
            { name: 'contact_id', value: recipient.id }
          ]
        }
      });

      // Log email sent
      await supabase
        .from('campaign_logs')
        .insert({
          campaign_type: 'email',
          recipient_email: recipient.email,
          status: 'sent'
        });

    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      
      await supabase
        .from('campaign_logs')
        .insert({
          campaign_type: 'email',
          recipient_email: recipient.email,
          status: 'failed',
          error_message: error.message
        });
    }
  }
};
```

---

### OAuth Social Media Integrations

**Purpose**: Connect social media accounts for posting and analytics

#### OAuth Connection Flow

```typescript
// src/hooks/use-oauth-connections.ts
export const useOAuthConnections = () => {
  const [connections, setConnections] = useState<OAuthConnection[]>([]);

  const initiateConnection = async (platform: string) => {
    try {
      // Create OAuth state for security
      const state = generateSecureState();
      
      await supabase
        .from('oauth_states')
        .insert({
          state_token: state,
          platform_name: platform,
          user_id: user.id,
          redirect_uri: `${window.location.origin}/integrations/callback`
        });

      // Redirect to OAuth provider
      const authUrl = buildOAuthUrl(platform, state);
      window.location.href = authUrl;
    } catch (error) {
      console.error('OAuth initiation error:', error);
      throw error;
    }
  };

  const handleCallback = async (code: string, state: string) => {
    try {
      // Verify state token
      const { data: stateRecord } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state_token', state)
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!stateRecord) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(
        stateRecord.platform_name,
        code,
        stateRecord.redirect_uri
      );

      // Store encrypted tokens
      await supabase
        .from('oauth_connections')
        .insert({
          user_id: user.id,
          platform_name: stateRecord.platform_name,
          access_token_encrypted: await encryptToken(tokens.access_token),
          refresh_token_encrypted: tokens.refresh_token ? 
            await encryptToken(tokens.refresh_token) : null,
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
          platform_user_id: tokens.user_id,
          platform_username: tokens.username,
          connection_status: 'connected'
        });

      // Cleanup OAuth state
      await supabase
        .from('oauth_states')
        .delete()
        .eq('id', stateRecord.id);

      await fetchConnections();
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  };

  return { connections, initiateConnection, handleCallback };
};
```

#### LinkedIn Integration

```typescript
// LinkedIn API configuration
const LINKEDIN_CONFIG = {
  clientId: Deno.env.get('LINKEDIN_CLIENT_ID'),
  clientSecret: Deno.env.get('LINKEDIN_CLIENT_SECRET'),
  scope: 'openid profile email w_member_social',
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  apiUrl: 'https://api.linkedin.com/v2'
};

const postToLinkedIn = async (content: string, accessToken: string) => {
  const postData = {
    author: `urn:li:person:${personId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await fetch(`${LINKEDIN_CONFIG.apiUrl}/ugcPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(postData)
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.statusText}`);
  }

  return await response.json();
};
```

#### Twitter/X Integration

```typescript
// Twitter API v2 configuration
const TWITTER_CONFIG = {
  clientId: Deno.env.get('TWITTER_CLIENT_ID'),
  clientSecret: Deno.env.get('TWITTER_CLIENT_SECRET'),
  scope: 'tweet.read tweet.write users.read offline.access',
  authUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  apiUrl: 'https://api.twitter.com/2'
};

const postToTwitter = async (content: string, accessToken: string) => {
  const tweetData = {
    text: content
  };

  const response = await fetch(`${TWITTER_CONFIG.apiUrl}/tweets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tweetData)
  });

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.statusText}`);
  }

  return await response.json();
};
```

---

### Integration Management

#### Connection Status Monitoring

```typescript
// src/hooks/use-integration-health.ts
export const useIntegrationHealth = () => {
  const [healthStatus, setHealthStatus] = useState<IntegrationHealth[]>([]);

  const checkConnectionHealth = async () => {
    const { data: connections } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user.id);

    const healthChecks = connections.map(async (connection) => {
      try {
        const isHealthy = await testConnection(connection);
        return {
          platform: connection.platform_name,
          status: isHealthy ? 'healthy' : 'unhealthy',
          lastChecked: new Date().toISOString(),
          error: null
        };
      } catch (error) {
        return {
          platform: connection.platform_name,
          status: 'error',
          lastChecked: new Date().toISOString(),
          error: error.message
        };
      }
    });

    const results = await Promise.all(healthChecks);
    setHealthStatus(results);
  };

  const testConnection = async (connection: OAuthConnection) => {
    // Implement platform-specific health check
    switch (connection.platform_name) {
      case 'linkedin':
        return await testLinkedInConnection(connection);
      case 'twitter':
        return await testTwitterConnection(connection);
      default:
        return false;
    }
  };

  return { healthStatus, checkConnectionHealth };
};
```

#### Token Refresh Management

```typescript
// Automatic token refresh
const refreshTokenIfNeeded = async (connection: OAuthConnection) => {
  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

  if (expiresAt.getTime() - now.getTime() < bufferTime) {
    try {
      const refreshToken = await decryptToken(connection.refresh_token_encrypted);
      const newTokens = await refreshAccessToken(
        connection.platform_name,
        refreshToken
      );

      await supabase
        .from('oauth_connections')
        .update({
          access_token_encrypted: await encryptToken(newTokens.access_token),
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000),
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      return newTokens.access_token;
    } catch (error) {
      // Mark connection as failed
      await supabase
        .from('oauth_connections')
        .update({
          connection_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      throw new Error('Token refresh failed');
    }
  }

  return await decryptToken(connection.access_token_encrypted);
};
```

---

## Planned Integrations

### CRM Integrations

#### Salesforce Integration
```typescript
// Planned Salesforce integration structure
const salesforceIntegration = {
  authenticate: async () => {
    // OAuth 2.0 flow for Salesforce
  },
  syncLeads: async () => {
    // Bidirectional lead synchronization
  },
  syncOpportunities: async () => {
    // Opportunity pipeline sync
  },
  webhookHandler: async () => {
    // Real-time data updates
  }
};
```

#### HubSpot Integration
```typescript
// Planned HubSpot integration structure
const hubspotIntegration = {
  authenticate: async () => {
    // OAuth 2.0 flow for HubSpot
  },
  syncContacts: async () => {
    // Contact synchronization
  },
  syncDeals: async () => {
    // Deal pipeline sync
  },
  syncCampaigns: async () => {
    // Marketing campaign sync
  }
};
```

### Email Platform Integrations

#### Mailchimp Integration
```typescript
// Planned Mailchimp integration
const mailchimpIntegration = {
  authenticate: async () => {
    // OAuth 2.0 flow for Mailchimp
  },
  syncAudiences: async () => {
    // Audience list synchronization
  },
  syncCampaigns: async () => {
    // Campaign data sync
  },
  importTemplates: async () => {
    // Template import functionality
  }
};
```

### Analytics Integrations

#### Google Analytics Integration
```typescript
// Planned Google Analytics integration
const googleAnalyticsIntegration = {
  authenticate: async () => {
    // OAuth 2.0 flow for Google Analytics
  },
  getTrafficData: async () => {
    // Website traffic analytics
  },
  getConversionData: async () => {
    // Conversion tracking
  },
  createGoals: async () => {
    // Automated goal creation
  }
};
```

---

## Security and Error Handling

### Token Encryption

```typescript
// Token encryption/decryption using Supabase secrets
const encryptToken = async (token: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('encrypt-data', {
    body: { 
      data: token,
      keyId: 'oauth_tokens'
    }
  });

  if (error) throw error;
  return data.encrypted;
};

const decryptToken = async (encryptedToken: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('decrypt-data', {
    body: { 
      encrypted: encryptedToken,
      keyId: 'oauth_tokens'
    }
  });

  if (error) throw error;
  return data.decrypted;
};
```

### Error Handling Patterns

```typescript
// Comprehensive error handling for integrations
class IntegrationError extends Error {
  constructor(
    public platform: string,
    public code: string,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

const handleIntegrationError = (error: any, platform: string) => {
  // Log error for monitoring
  console.error(`${platform} integration error:`, error);

  // Determine if error is retryable
  const retryableErrors = ['RATE_LIMIT', 'TIMEOUT', 'NETWORK_ERROR'];
  const isRetryable = retryableErrors.includes(error.code);

  // Create standardized error
  const integrationError = new IntegrationError(
    platform,
    error.code || 'UNKNOWN_ERROR',
    error.message || 'An unexpected error occurred',
    isRetryable
  );

  // Update connection status if auth error
  if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
    updateConnectionStatus(platform, 'auth_failed');
  }

  throw integrationError;
};
```

### Retry Logic

```typescript
// Exponential backoff retry mechanism
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !error.retryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Usage example
const postToSocialMedia = async (platform: string, content: string) => {
  return await withRetry(async () => {
    const connection = await getConnection(platform);
    const accessToken = await refreshTokenIfNeeded(connection);
    
    switch (platform) {
      case 'linkedin':
        return await postToLinkedIn(content, accessToken);
      case 'twitter':
        return await postToTwitter(content, accessToken);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  });
};
```

---

## Integration Testing

### Unit Tests

```typescript
// Integration testing examples
describe('OAuth Integration', () => {
  it('should handle LinkedIn OAuth flow', async () => {
    const mockCode = 'mock_auth_code';
    const mockState = 'secure_state_token';
    
    const result = await handleOAuthCallback('linkedin', mockCode, mockState);
    
    expect(result.platform_name).toBe('linkedin');
    expect(result.connection_status).toBe('connected');
  });

  it('should refresh expired tokens', async () => {
    const expiredConnection = createMockConnection({
      token_expires_at: new Date(Date.now() - 1000) // Expired
    });

    const refreshedToken = await refreshTokenIfNeeded(expiredConnection);
    
    expect(refreshedToken).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// End-to-end integration testing
describe('Social Media Posting', () => {
  it('should post content to LinkedIn', async () => {
    const content = 'Test post content';
    const result = await postToSocialMedia('linkedin', content);
    
    expect(result.success).toBe(true);
    expect(result.postId).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    const invalidContent = ''; // Invalid content
    
    await expect(
      postToSocialMedia('linkedin', invalidContent)
    ).rejects.toThrow(IntegrationError);
  });
});
```

---

## Monitoring and Analytics

### Integration Metrics

```typescript
// Track integration usage and performance
const trackIntegrationMetric = async (
  platform: string,
  operation: string,
  success: boolean,
  responseTime: number
) => {
  await supabase
    .from('integration_metrics')
    .insert({
      platform,
      operation,
      success,
      response_time_ms: responseTime,
      timestamp: new Date().toISOString()
    });
};

// Usage tracking wrapper
const withMetrics = async <T>(
  platform: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  let success = false;
  
  try {
    const result = await fn();
    success = true;
    return result;
  } finally {
    const responseTime = Date.now() - startTime;
    await trackIntegrationMetric(platform, operation, success, responseTime);
  }
};
```

### Health Monitoring

```typescript
// Integration health dashboard data
const getIntegrationHealthDashboard = async () => {
  const { data: metrics } = await supabase
    .from('integration_metrics')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24h
    .order('timestamp', { ascending: false });

  return {
    platforms: getPlatformSummary(metrics),
    successRates: calculateSuccessRates(metrics),
    averageResponseTimes: calculateAverageResponseTimes(metrics),
    errorRates: calculateErrorRates(metrics)
  };
};
```

This comprehensive integration documentation provides detailed information about PAM's current and planned integrations, security measures, error handling, and monitoring capabilities.