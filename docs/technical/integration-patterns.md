
# Integration Patterns

## External API Integration

### Authentication Patterns

#### OAuth 2.0 Flow
```typescript
// Social media platform integration
export class SocialAuthService {
  static async initiateOAuth(platform: string, redirectUri: string) {
    const authUrl = buildAuthUrl(platform, redirectUri);
    window.location.href = authUrl;
  }
  
  static async handleCallback(code: string, platform: string) {
    const tokens = await exchangeCodeForTokens(code, platform);
    await storeTokensSecurely(tokens);
    return tokens;
  }
}
```

#### API Key Authentication
```typescript
// Service with API key authentication
export class EmailService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendEmail(data: EmailData) {
    return fetch('/api/email/send', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }
}
```

### Error Handling Patterns

#### Retry with Exponential Backoff
```typescript
export class ApiClient {
  async requestWithRetry<T>(
    endpoint: string, 
    options: RequestInit, 
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(endpoint, options);
        
        if (response.ok) {
          return await response.json();
        }
        
        if (response.status < 500 && attempt < maxRetries) {
          // Don't retry client errors
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

#### Circuit Breaker Pattern
```typescript
export class CircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt = Date.now();
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    if (this.failures >= 5) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + 60000; // 1 minute
    }
  }
}
```

## Database Integration Patterns

### Repository Pattern
```typescript
export class CampaignRepository {
  async findByUserId(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data;
  }
  
  async create(campaign: CreateCampaignData): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}
```

### Unit of Work Pattern
```typescript
export class DatabaseTransaction {
  private operations: (() => Promise<any>)[] = [];
  
  add(operation: () => Promise<any>) {
    this.operations.push(operation);
  }
  
  async commit() {
    const { data, error } = await supabase.rpc('execute_transaction', {
      operations: this.operations
    });
    
    if (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
    
    return data;
  }
}
```

## Real-time Integration

### WebSocket Patterns
```typescript
export class RealTimeService {
  private connection: RealtimeChannel;
  
  constructor(private tableName: string) {
    this.connection = supabase
      .channel(`realtime:${tableName}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: tableName }, 
          this.handleChange.bind(this)
      );
  }
  
  subscribe(callback: (change: any) => void) {
    this.connection.subscribe();
    this.onChange = callback;
  }
  
  private handleChange(payload: any) {
    if (this.onChange) {
      this.onChange(payload);
    }
  }
}
```

### Event-Driven Architecture
```typescript
export class EventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  publish(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
}
```

## Caching Patterns

### In-Memory Caching
```typescript
export class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>();
  
  set(key: string, data: any, ttlMs: number = 300000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
}
```

### Cache-Aside Pattern
```typescript
export class DataService {
  private cache = new CacheService();
  
  async getCampaigns(userId: string): Promise<Campaign[]> {
    const cacheKey = `campaigns:${userId}`;
    
    // Try cache first
    let campaigns = this.cache.get<Campaign[]>(cacheKey);
    
    if (!campaigns) {
      // Cache miss, fetch from database
      campaigns = await this.repository.findByUserId(userId);
      
      // Store in cache
      this.cache.set(cacheKey, campaigns, 300000); // 5 minutes
    }
    
    return campaigns;
  }
}
```

## Security Patterns

### Token Validation
```typescript
export class AuthMiddleware {
  static async validateToken(token: string): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }
}
```

### Rate Limiting
```typescript
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  isAllowed(userId: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(userId, validRequests);
    
    return true;
  }
}
```

## Monitoring and Observability

### Logging Pattern
```typescript
export class Logger {
  static info(message: string, context?: any) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString()
    }));
  }
  
  static error(message: string, error?: Error, context?: any) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack,
      context,
      timestamp: new Date().toISOString()
    }));
  }
}
```

### Health Check Pattern
```typescript
export class HealthChecker {
  private checks: HealthCheck[] = [];
  
  addCheck(name: string, check: () => Promise<boolean>) {
    this.checks.push({ name, check });
  }
  
  async getStatus(): Promise<HealthStatus> {
    const results = await Promise.allSettled(
      this.checks.map(async ({ name, check }) => ({
        name,
        healthy: await check()
      }))
    );
    
    const healthChecks = results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { name: 'unknown', healthy: false }
    );
    
    const allHealthy = healthChecks.every(check => check.healthy);
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      timestamp: new Date().toISOString()
    };
  }
}
```
