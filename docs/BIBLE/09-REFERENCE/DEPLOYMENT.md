
# Deployment Guide

## Overview

This guide covers deployment options for AI Marketing Hub, from development to production environments.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase project configured
- Git repository access

## Environment Configuration

### Development Environment
```bash
# Start development server
npm run dev

# Server will be available at http://localhost:5173
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Deployment Options

### 1. Lovable Hosting (Recommended)

Lovable provides integrated hosting with automatic deployments:

1. **Automatic Deployment**:
   - Every change in the editor automatically deploys
   - Available at your project's Lovable subdomain
   - SSL certificate included

2. **Custom Domain Setup**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed
   - SSL certificate automatically provisioned

3. **Environment Variables**:
   - Managed through Lovable's Supabase integration
   - No manual configuration required

### 2. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

**vercel.json Configuration**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Netlify Deployment

1. **Via Git Integration**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Manual Deployment**:
```bash
# Build the project
npm run build

# Deploy to Netlify
npx netlify-cli deploy --prod --dir=dist
```

**netlify.toml Configuration**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. AWS S3 + CloudFront

1. **Create S3 Bucket**:
```bash
aws s3 create-bucket --bucket your-app-name --region us-east-1
```

2. **Enable Static Website Hosting**:
```bash
aws s3 website s3://your-app-name --index-document index.html --error-document index.html
```

3. **Deploy Files**:
```bash
npm run build
aws s3 sync dist/ s3://your-app-name --delete
```

4. **Configure CloudFront** for CDN and custom domain support

### 5. Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

**Build and Run**:
```bash
docker build -t ai-marketing-hub .
docker run -p 80:80 ai-marketing-hub
```

## Environment Variables

### Required Variables
- Supabase integration handles most configuration automatically
- Custom API keys should be managed through Supabase Secrets

### Optional Variables
```bash
# Custom API endpoints (if not using default Supabase)
VITE_API_BASE_URL=https://your-api.com

# Analytics tracking
VITE_GA_TRACKING_ID=GA-XXXXX-X

# Feature flags
VITE_ENABLE_BETA_FEATURES=false
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Enable compression
npm install --save-dev vite-plugin-compression
```

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
```

### CDN Configuration
- Enable compression (gzip/brotli)
- Set appropriate cache headers
- Configure image optimization

## Monitoring and Analytics

### Error Tracking
```bash
# Add Sentry for error tracking
npm install @sentry/react @sentry/tracing
```

### Performance Monitoring
```bash
# Add Web Vitals tracking
npm install web-vitals
```

### Analytics Integration
```typescript
// Google Analytics 4
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href
});
```

## Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' *.supabase.co;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' *.supabase.co;">
```

### HTTPS Configuration
- Always use HTTPS in production
- Configure HSTS headers
- Set secure cookie attributes

## Continuous Deployment

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      run: |
        # Your deployment commands here
```

## Rollback Strategy

### Blue-Green Deployment
1. Deploy to staging environment
2. Run health checks
3. Switch traffic to new version
4. Keep previous version for quick rollback

### Database Migrations
- Always run migrations before deployment
- Have rollback scripts ready
- Test migrations on staging first

## Health Checks

### Application Health
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION
  });
});
```

### Monitoring Checklist
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database connectivity
- [ ] External service integrations
- [ ] Performance metrics within acceptable ranges

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Runtime Errors**:
   - Check browser console for errors
   - Verify environment variables
   - Check network connectivity to Supabase

3. **Performance Issues**:
   - Analyze bundle size
   - Check for memory leaks
   - Optimize images and assets

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Or specific modules
DEBUG=vite:* npm run dev
```

## Support

For deployment support:
- Check the troubleshooting section first
- Review logs for specific error messages
- Contact support with deployment details and error logs
