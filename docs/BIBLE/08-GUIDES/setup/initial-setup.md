
# Initial Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account
- API keys for integrations

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   - Copy `.env.example` to `.env`
   - Configure Supabase credentials
   - Add API keys for integrations

4. **Database setup**
   - Run Supabase migrations
   - Configure Row Level Security
   - Set up authentication

5. **Start development server**
   ```bash
   npm run dev
   ```

## Configuration Checklist
- [ ] Supabase project configured
- [ ] Authentication enabled
- [ ] API keys configured
- [ ] Database migrations applied
- [ ] Email service configured
- [ ] Social media integrations set up

## Verification
- Login/logout functionality works
- Campaign creation successful
- API connections established
- Real-time updates functioning
