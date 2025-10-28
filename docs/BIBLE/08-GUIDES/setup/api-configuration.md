
# API Configuration

## Required API Keys

### OpenAI (Required for AI features)
- Purpose: Content generation, chat assistance
- Configuration: `OPENAI_API_KEY`
- Setup: https://platform.openai.com/api-keys

### Email Services
- **SendGrid**: Email campaigns
- **Mailgun**: Transactional emails
- Configuration: Set in Supabase Edge Functions secrets

### Social Media APIs
- **Twitter/X API**: Social posting and analytics
- **Facebook Graph API**: Facebook/Instagram integration
- **LinkedIn API**: Professional networking features

### Analytics
- **Google Analytics**: Website tracking
- **Mixpanel**: Event analytics

## Configuration Steps

1. **Supabase Edge Functions Secrets**
   ```bash
   supabase secrets set OPENAI_API_KEY=your_key_here
   supabase secrets set SENDGRID_API_KEY=your_key_here
   ```

2. **Frontend Environment Variables**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Configuration**
   - User secrets table for secure storage
   - API key validation
   - Rate limiting configuration

## Security Best Practices
- Never commit API keys to version control
- Use environment variables
- Implement rate limiting
- Monitor API usage
- Rotate keys regularly
