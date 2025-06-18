
# Debugging Guide

## Frontend Debugging

### React Component Issues

**Problem**: Component not rendering
- Check for JavaScript errors in console
- Verify component imports and exports
- Ensure proper JSX syntax
- Check for missing dependencies

**Problem**: State not updating
- Verify useState/useEffect usage
- Check for state mutation issues
- Ensure proper dependency arrays
- Look for infinite render loops

**Problem**: Props not passed correctly
- Verify prop names and types
- Check component hierarchy
- Use React Developer Tools
- Add console.log for debugging

### API Integration Issues

**Problem**: API calls failing
```typescript
// Add error handling and logging
try {
  const response = await apiClient.get('/endpoint');
  console.log('API Response:', response);
} catch (error) {
  console.error('API Error:', error);
  // Handle specific error types
}
```

**Problem**: Authentication errors
- Check token validity
- Verify header configuration
- Test token refresh logic
- Check user session state

### Performance Issues

**Problem**: Slow component rendering
- Use React Profiler
- Check for unnecessary re-renders
- Implement memoization
- Optimize heavy computations

**Problem**: Memory leaks
- Clean up event listeners
- Cancel pending requests
- Clear timers and intervals
- Properly handle component unmounting

## Backend Debugging

### Python/FastAPI Issues

**Problem**: Import errors
```python
# Check module paths and PYTHONPATH
import sys
print(sys.path)

# Verify relative imports
from .module import function
```

**Problem**: Database connection issues
```python
# Test database connectivity
try:
    result = supabase.table('test').select('*').execute()
    print("Database connected successfully")
except Exception as e:
    print(f"Database error: {e}")
```

### API Endpoint Debugging

**Problem**: 500 Internal Server Error
- Check server logs
- Add try-catch blocks
- Validate input data
- Test database queries

**Problem**: Authentication failures
```python
# Add logging to auth middleware
import logging
logger = logging.getLogger(__name__)

def verify_token(token: str):
    logger.info(f"Verifying token: {token[:10]}...")
    # Verification logic
```

### Supabase Issues

**Problem**: RLS policy blocking queries
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test policy conditions
SELECT auth.uid(); -- Should return user ID when authenticated
```

**Problem**: Edge Function errors
- Check function logs in Supabase dashboard
- Test function locally with Supabase CLI
- Verify environment variables
- Check CORS configuration

## Database Debugging

### Query Performance Issues

**Problem**: Slow queries
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM table WHERE condition;

-- Check for missing indexes
SELECT * FROM pg_stat_user_tables WHERE relname = 'your_table';
```

**Problem**: Connection pooling issues
- Monitor connection usage
- Check connection limits
- Optimize query patterns
- Use connection pooling best practices

## Integration Debugging

### Social Media API Issues

**Problem**: OAuth authentication failing
```python
# Debug OAuth flow
def debug_oauth_flow(auth_code: str):
    print(f"Auth code received: {auth_code}")
    
    # Test token exchange
    try:
        token_response = exchange_code_for_token(auth_code)
        print(f"Token response: {token_response}")
    except Exception as e:
        print(f"Token exchange failed: {e}")
```

**Problem**: API rate limiting
- Implement exponential backoff
- Monitor rate limit headers
- Use request queuing
- Cache responses when possible

### Email Service Issues

**Problem**: Email delivery failures
```python
# Debug email sending
def debug_email_send(email_data):
    try:
        response = email_service.send(email_data)
        print(f"Email sent successfully: {response}")
    except Exception as e:
        print(f"Email send failed: {e}")
        # Check specific error types
        if "authentication" in str(e).lower():
            print("Check API keys and credentials")
        elif "rate limit" in str(e).lower():
            print("Rate limit exceeded")
```

## Debugging Tools and Techniques

### Frontend Tools
- **React Developer Tools**: Component inspection and profiling
- **Browser DevTools**: Network, Console, Performance tabs
- **Redux DevTools**: State management debugging
- **Lighthouse**: Performance auditing

### Backend Tools
- **FastAPI Docs**: Interactive API documentation
- **Supabase Dashboard**: Database and function monitoring
- **Logging**: Structured logging with appropriate levels
- **Postman/Insomnia**: API endpoint testing

### Debugging Strategies

1. **Reproduce the Issue**
   - Create minimal reproduction case
   - Document steps to reproduce
   - Test in different environments
   - Gather relevant data

2. **Isolate the Problem**
   - Use binary search approach
   - Comment out code sections
   - Test individual components
   - Check dependencies

3. **Add Logging**
   ```typescript
   // Frontend logging
   console.log('Debug point 1:', data);
   console.error('Error occurred:', error);
   
   // Backend logging
   logger.info(f"Processing request: {request_id}")
   logger.error(f"Error in function: {error}")
   ```

4. **Use Debugging Tools**
   - Set breakpoints in code
   - Step through execution
   - Inspect variable values
   - Monitor network requests

### Common Debugging Patterns

**API Error Handling**
```typescript
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    console.error('Response error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('Request error:', error.request);
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
};
```

**Database Query Debugging**
```python
def debug_query(query_func, *args, **kwargs):
    import time
    start_time = time.time()
    
    try:
        result = query_func(*args, **kwargs)
        execution_time = time.time() - start_time
        print(f"Query executed successfully in {execution_time:.2f}s")
        return result
    except Exception as e:
        execution_time = time.time() - start_time
        print(f"Query failed after {execution_time:.2f}s: {e}")
        raise
```

**Component State Debugging**
```typescript
const useDebugState = (stateName: string, state: any) => {
  useEffect(() => {
    console.log(`${stateName} changed:`, state);
  }, [stateName, state]);
};

// Usage
const [data, setData] = useState([]);
useDebugState('data', data);
```

## Error Recovery Strategies

### Graceful Error Handling
- Implement error boundaries
- Provide fallback UI components
- Show meaningful error messages
- Log errors for monitoring

### Retry Logic
```typescript
const retryApiCall = async (apiCall: () => Promise<any>, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private threshold = 5;
  private timeout = 60000; // 1 minute

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           Date.now() - this.lastFailTime < this.timeout;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();
  }
}
```
