# AI Marketing Hub

An intelligent SaaS platform for automated marketing campaign management and execution. Built with React, TypeScript, and Supabase.

## Overview

AI Marketing Hub is a comprehensive marketing automation platform that combines AI-powered content generation, campaign management, and multi-channel publishing. It provides businesses with the tools to create, manage, and optimize marketing campaigns across various digital channels.

### Key Features

- **AI-Powered Campaign Creation**: Automated campaign brief generation using advanced AI models
- **Multi-Channel Publishing**: Seamless integration with social media platforms and email services
- **Campaign Analytics**: Real-time performance tracking and optimization
- **Content Management**: AI-assisted content creation and optimization
- **Team Collaboration**: Role-based access control and workflow management
- **Lead Generation**: Automated lead scoring and qualification
- **Brand Management**: Centralized brand asset and guideline management

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **React Router** for navigation
- **Tanstack Query** for data fetching
- **React Hook Form** with Zod validation

### Backend
- **Supabase** for database, authentication, and real-time features
- **FastAPI** backend (Python) for custom business logic
- **Edge Functions** for serverless API endpoints

### External Integrations
- OpenAI API for content generation
- Social media platform APIs (Facebook, Twitter, LinkedIn, etc.)
- Email service providers
- Analytics and tracking services

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ (for backend development)
- Supabase account
- OpenAI API key

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-marketing-hub
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   The platform uses Supabase secrets management for secure API key storage. No `.env` files are needed.
   
   Required secrets (configured via Supabase dashboard):
   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SECRET_MASTER_KEY=your_master_encryption_key
   ```

### Development

1. **Start the frontend development server**
   ```bash
   npm run dev
   ```

2. **Start the backend server** (if running locally)
   ```bash
   cd backend
   python main.py
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Database Setup

The project uses Supabase with automatic migrations. The database schema includes:

- User authentication and profiles
- Campaign management
- Content storage and versioning
- Analytics and performance tracking
- Social media connections
- Brand asset management

### Authentication

The platform uses Supabase Auth with support for:
- Email/password authentication
- OAuth providers (Google, LinkedIn, etc.)
- Role-based access control
- Session management

## Project Structure

```
ai-marketing-hub/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── integrations/       # Third-party integrations
│   └── types/              # TypeScript type definitions
├── backend/
│   ├── agents/             # AI agent implementations
│   ├── routes/             # API route handlers
│   ├── database/           # Database utilities
│   └── models.py           # Data models
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## API Documentation

### Core Endpoints

- **Campaigns**: `/api/campaigns` - CRUD operations for marketing campaigns
- **Content**: `/api/content` - AI-powered content generation
- **Analytics**: `/api/analytics` - Performance tracking and reporting
- **Social**: `/api/social` - Social media platform integrations
- **AI Agents**: `/api/ai-agents` - AI-powered automation

### Authentication

All API endpoints require authentication via Supabase JWT tokens. Include the authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

## Deployment

### Production Deployment

1. **Frontend**: Deploy to Vercel, Netlify, or similar platform
2. **Backend**: Deploy to Render, Railway, or similar platform
3. **Database**: Supabase automatically handles scaling and backups

### Environment Configuration

Ensure all required secrets are configured in your deployment environment:
- Supabase project configuration
- API keys for external services
- CORS settings for your domain

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m 'Add some feature'`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Write tests for new features
- Update documentation for API changes
- Follow the existing code style and patterns

### Code Style

- Use ESLint and Prettier for code formatting
- Follow React best practices and hooks patterns
- Use TypeScript strict mode
- Implement proper error handling

## Security

- All sensitive data is encrypted at rest
- API keys are managed through Supabase secrets
- Role-based access control for all resources
- HTTPS enforced in production
- Input validation and sanitization

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review existing issues and discussions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Supabase for backend infrastructure
- UI components from Shadcn/ui
- AI capabilities powered by OpenAI
- Icons from Lucide React