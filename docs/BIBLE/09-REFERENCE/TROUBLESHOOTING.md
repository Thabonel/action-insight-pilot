# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### Issue: "User is not authenticated" error
**Symptoms**: 
- User gets logged out unexpectedly
- Authentication state is lost on page refresh
- API calls return 401 errors

**Solutions**:
1. **Check Session Configuration**:
   ```typescript
   // Verify Supabase client configuration
   const supabase = createClient(url, key, {
     auth: {
       storage: localStorage,
       persistSession: true,
       autoRefreshToken: true,
     }
   });
   ```

2. **Verify Environment Variables**:
   ```bash
   # Check if environment variables are set correctly
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

3. **Check Browser Storage**:
   - Open browser developer tools
   - Go to Application/Storage tab
   - Check if `sb-<project>-auth-token` exists in localStorage
   - Clear storage and try logging in again

4. **Verify Auth Context Implementation**:
   ```typescript
   // Ensure proper auth state management
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
       }
     );

     // Check for existing session
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
     });

     return () => subscription.unsubscribe();
   }, []);
   ```

#### Issue: OAuth redirect not working
**Symptoms**:
- OAuth login redirects to 404 page
- "requested path is invalid" error
- Infinite redirect loops

**Solutions**:
1. **Check Supabase URL Configuration**:
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Verify Site URL: `https://your-domain.com`
   - Add redirect URLs:
     - `https://your-domain.com`
     - `https://your-domain.com/auth/callback`

2. **Verify OAuth Provider Settings**:
   ```typescript
   // For Google OAuth
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${window.location.origin}/dashboard`
     }
   });
   ```

3. **Check Environment Configuration**:
   - Verify OAuth provider credentials in Supabase
   - Ensure provider is enabled in Authentication settings

---

### Database Issues

#### Issue: "permission denied for table" error
**Symptoms**:
- RLS policy errors in console
- Data not loading for authenticated users
- Insert/update operations failing

**Solutions**:
1. **Check RLS Policies**:
   ```sql
   -- Verify policies exist
   SELECT * FROM pg_policies WHERE tablename = 'campaigns';
   
   -- Test policy manually
   SELECT * FROM campaigns WHERE auth.uid() = created_by;
   ```

2. **Enable RLS on Tables**:
   ```sql
   -- Enable RLS if not already enabled
   ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
   
   -- Create basic policy
   CREATE POLICY "Users can view their own campaigns" 
   ON campaigns FOR SELECT 
   USING (auth.uid() = created_by);
   ```

3. **Check User Authentication in Database**:
   ```sql
   -- Verify auth.uid() returns correct value
   SELECT auth.uid();
   ```

#### Issue: Slow query performance
**Symptoms**:
- Long loading times for data
- Database timeouts
- High CPU usage in Supabase dashboard

**Solutions**:
1. **Add Missing Indexes**:
   ```sql
   -- Common indexes for performance
   CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
   CREATE INDEX idx_leads_status ON leads(status);
   CREATE INDEX idx_campaign_metrics_date ON campaign_metrics(metric_date DESC);
   ```

2. **Optimize Queries**:
   ```typescript
   // Select only needed columns
   const { data } = await supabase
     .from('campaigns')
     .select('id, name, status, created_at') // Don't use *
     .eq('created_by', userId)
     .order('created_at', { ascending: false })
     .limit(50); // Always limit results
   ```

3. **Use Proper Filtering**:
   ```typescript
   // Filter at database level, not in JavaScript
   const { data } = await supabase
     .from('leads')
     .select('*')
     .eq('status', 'qualified') // Database filter
     .gte('created_at', startDate);
   ```

---

### Frontend Issues

#### Issue: Components not re-rendering with data updates
**Symptoms**:
- Data changes but UI doesn't update
- Stale data displayed
- Real-time updates not working

**Solutions**:
1. **Check State Management**:
   ```typescript
   // Use proper state updates
   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
   
   // Update state immutably
   setCampaigns(prev => [...prev, newCampaign]);
   
   // Don't mutate state directly
   // campaigns.push(newCampaign); // ❌ Wrong
   ```

2. **Verify useEffect Dependencies**:
   ```typescript
   // Include all dependencies
   useEffect(() => {
     fetchCampaigns();
   }, [userId, status]); // Include all variables used inside
   
   // Use useCallback for functions in dependencies
   const fetchCampaigns = useCallback(async () => {
     // Fetch logic
   }, [userId]);
   ```

3. **Check Real-time Subscriptions**:
   ```typescript
   useEffect(() => {
     const subscription = supabase
       .channel('campaigns')
       .on('postgres_changes', {
         event: '*',
         schema: 'public',
         table: 'campaigns',
         filter: `created_by=eq.${user.id}`
       }, (payload) => {
         // Handle real-time updates
         if (payload.eventType === 'INSERT') {
           setCampaigns(prev => [...prev, payload.new]);
         }
       })
       .subscribe();

     return () => subscription.unsubscribe();
   }, [user.id]);
   ```

#### Issue: Build failures
**Symptoms**:
- TypeScript compilation errors
- Vite build process fails
- Missing dependencies errors

**Solutions**:
1. **Fix TypeScript Errors**:
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Common fixes
   # - Add missing type definitions
   # - Fix import paths
   # - Add proper interface definitions
   ```

2. **Update Dependencies**:
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   
   # Update outdated packages
   npm update
   ```

3. **Check Import Paths**:
   ```typescript
   // Use absolute imports from src
   import { Button } from '@/components/ui/button';
   
   // Check tsconfig.json paths configuration
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

---

### Performance Issues

#### Issue: Slow initial page load
**Symptoms**:
- Long white screen on first load
- Large bundle sizes
- Poor Lighthouse scores

**Solutions**:
1. **Implement Code Splitting**:
   ```typescript
   // Lazy load heavy components
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const Campaigns = lazy(() => import('./pages/Campaigns'));
   
   // Use Suspense for loading states
   <Suspense fallback={<PageLoader />}>
     <Routes>
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/campaigns" element={<Campaigns />} />
     </Routes>
   </Suspense>
   ```

2. **Optimize Bundle Size**:
   ```bash
   # Analyze bundle
   npm run build
   npx vite-bundle-analyzer dist
   
   # Look for large dependencies to optimize
   ```

3. **Implement Proper Caching**:
   ```typescript
   // Use React Query for data caching
   const { data: campaigns, isLoading } = useQuery({
     queryKey: ['campaigns', userId],
     queryFn: () => fetchCampaigns(userId),
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

#### Issue: Memory leaks
**Symptoms**:
- Browser tab memory usage grows over time
- Application becomes sluggish
- Console warnings about memory

**Solutions**:
1. **Clean Up Subscriptions**:
   ```typescript
   useEffect(() => {
     const subscription = supabase.channel('updates').subscribe();
     
     // Always cleanup
     return () => subscription.unsubscribe();
   }, []);
   ```

2. **Clean Up Timers**:
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       // Periodic task
     }, 5000);
     
     return () => clearInterval(interval);
   }, []);
   ```

3. **Avoid Circular References**:
   ```typescript
   // Use WeakMap for object references
   const cache = new WeakMap();
   
   // Properly clean up event listeners
   useEffect(() => {
     const handleClick = () => {};
     document.addEventListener('click', handleClick);
     
     return () => document.removeEventListener('click', handleClick);
   }, []);
   ```

---

### Integration Issues

#### Issue: OAuth connections failing
**Symptoms**:
- OAuth popup closes without authentication
- "Invalid state" errors
- Connection shows as failed

**Solutions**:
1. **Check OAuth Configuration**:
   ```typescript
   // Verify OAuth settings in each provider
   // Google: https://console.developers.google.com
   // LinkedIn: https://www.linkedin.com/developers/apps
   
   // Ensure correct redirect URIs:
   // - https://your-domain.com/integrations/callback
   // - http://localhost:5173/integrations/callback (for development)
   ```

2. **Debug OAuth Flow**:
   ```typescript
   // Add logging to OAuth process
   const handleOAuthCallback = async (code: string, state: string) => {
     console.log('OAuth callback received:', { code, state });
     
     try {
       // Verify state
       const { data: stateRecord } = await supabase
         .from('oauth_states')
         .select('*')
         .eq('state_token', state)
         .single();
       
       console.log('State verification:', stateRecord);
       
       // Continue with token exchange...
     } catch (error) {
       console.error('OAuth error:', error);
     }
   };
   ```

3. **Check Network Issues**:
   ```bash
   # Test API endpoints directly
   curl -X POST https://api.linkedin.com/oauth/v2/accessToken \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=YOUR_CODE"
   ```

#### Issue: API rate limiting
**Symptoms**:
- "Too many requests" errors
- Temporary service unavailability
- Failed API calls

**Solutions**:
1. **Implement Rate Limiting**:
   ```typescript
   // Simple rate limiter
   class RateLimiter {
     private requests: number[] = [];
     
     canMakeRequest(limit: number, window: number): boolean {
       const now = Date.now();
       this.requests = this.requests.filter(time => now - time < window);
       return this.requests.length < limit;
     }
     
     recordRequest(): void {
       this.requests.push(Date.now());
     }
   }
   
   const rateLimiter = new RateLimiter();
   
   const apiCall = async () => {
     if (!rateLimiter.canMakeRequest(100, 60000)) { // 100 per minute
       throw new Error('Rate limit exceeded');
     }
     
     rateLimiter.recordRequest();
     // Make API call
   };
   ```

2. **Add Exponential Backoff**:
   ```typescript
   const withRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         
         const delay = Math.pow(2, i) * 1000; // Exponential backoff
         await new Promise(resolve => setTimeout(resolve, delay));
       }
     }
   };
   ```

---

### Development Environment Issues

#### Issue: Environment variables not loading
**Symptoms**:
- `undefined` values for environment variables
- API calls failing with invalid keys
- Development server issues

**Solutions**:
1. **Check File Names**:
   ```bash
   # Correct file names for Vite
   .env.local          # Local development
   .env.development    # Development environment
   .env.production     # Production environment
   
   # Variables must start with VITE_
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

2. **Restart Development Server**:
   ```bash
   # Environment variables are loaded on server start
   npm run dev
   ```

3. **Verify Variable Access**:
   ```typescript
   // Check if variables are loaded
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   
   // Use fallbacks for required variables
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   if (!supabaseUrl) {
     throw new Error('VITE_SUPABASE_URL is required');
   }
   ```

#### Issue: Hot reload not working
**Symptoms**:
- Changes not reflected automatically
- Need to manually refresh browser
- Development server issues

**Solutions**:
1. **Check Vite Configuration**:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       hmr: {
         overlay: true
       }
     }
   });
   ```

2. **Clear Browser Cache**:
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Restart Development Server**:
   ```bash
   # Stop and restart dev server
   npm run dev
   ```

---

### Deployment Issues

#### Issue: Build works locally but fails in production
**Symptoms**:
- Successful local builds
- Production build failures
- Runtime errors in production

**Solutions**:
1. **Check Environment Variables**:
   ```bash
   # Verify production environment variables
   # In Vercel, Netlify, or hosting platform dashboard
   
   # Test production build locally
   npm run build
   npm run preview
   ```

2. **Check Import Case Sensitivity**:
   ```typescript
   // Ensure correct case in imports
   import { Button } from './Button'; // Not './button'
   import { utils } from '../utils'; // Not '../Utils'
   ```

3. **Verify Dependencies**:
   ```bash
   # Check for missing dependencies
   npm ci
   
   # Verify production dependencies
   npm install --production
   ```

#### Issue: 404 errors for client-side routes
**Symptoms**:
- Direct URL access returns 404
- Refresh on routes fails
- Single Page Application routing issues

**Solutions**:
1. **Configure Hosting Redirects**:
   ```toml
   # netlify.toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

   ```json
   # vercel.json
   {
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

2. **Configure Web Server**:
   ```nginx
   # nginx configuration
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

---

## Debugging Tools

### Browser Developer Tools

1. **Console Debugging**:
   ```typescript
   // Add strategic console logs
   console.log('Auth state:', { user, session });
   console.log('API response:', data);
   console.error('Error details:', error);
   
   // Use console.table for arrays/objects
   console.table(campaigns);
   ```

2. **Network Tab**:
   - Monitor API requests and responses
   - Check request headers and payloads
   - Verify response status codes

3. **Application Tab**:
   - Check localStorage for auth tokens
   - Verify service worker registration
   - Monitor cookies and session storage

### React Developer Tools

1. **Component Inspector**:
   - View component props and state
   - Track component re-renders
   - Debug React Context values

2. **Profiler**:
   - Identify performance bottlenecks
   - Measure component render times
   - Optimize re-rendering patterns

### Supabase Debugging

1. **Database Logs**:
   ```bash
   # View database logs
   supabase logs db
   
   # View specific function logs
   supabase logs functions chat-ai
   ```

2. **Query Performance**:
   ```sql
   -- Check slow queries
   EXPLAIN ANALYZE SELECT * FROM campaigns WHERE created_by = 'user-id';
   
   -- View query statistics
   SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
   ```

---

## Getting Help

### Support Channels

1. **Documentation**: Check official docs first
2. **GitHub Issues**: Search existing issues
3. **Community Forums**: Discord, Stack Overflow
4. **Support Email**: For critical production issues

### Reporting Issues

When reporting issues, include:

1. **Environment Information**:
   - Browser version and type
   - Operating system
   - Node.js version
   - Package versions

2. **Error Details**:
   - Complete error messages
   - Stack traces
   - Console logs

3. **Reproduction Steps**:
   - Minimal code example
   - Step-by-step instructions
   - Expected vs actual behavior

4. **Context**:
   - When the issue started
   - Recent changes made
   - Similar issues encountered

### Emergency Procedures

For critical production issues:

1. **Immediate Actions**:
   - Check service status pages
   - Verify environment variables
   - Review recent deployments

2. **Rollback Procedures**:
   ```bash
   # Revert to previous deployment
   git revert HEAD
   git push origin main
   
   # Or rollback in hosting platform
   vercel rollback
   ```

3. **Communication**:
   - Notify stakeholders
   - Update status page
   - Document incident

This troubleshooting guide covers the most common issues encountered when developing and deploying PAM. Keep this guide updated as new issues and solutions are discovered.