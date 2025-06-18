
# Debugging Guide

## Development Tools

### Browser DevTools
1. **Console Tab**: Error messages, logs, warnings
2. **Network Tab**: API requests, response times, failures
3. **Application Tab**: Local storage, session data, cookies
4. **Performance Tab**: Runtime performance, memory usage
5. **Sources Tab**: Breakpoints, code debugging

### React Developer Tools
- Component hierarchy
- Props and state inspection
- Performance profiling
- Hook debugging

### Supabase Dashboard
- Database query logs
- Edge Function logs
- Authentication events
- Real-time subscriptions

## Common Debugging Scenarios

### Component Not Rendering
1. Check component import/export
2. Verify props being passed
3. Review conditional rendering logic
4. Check for JavaScript errors
5. Inspect component hierarchy

### State Not Updating
1. Check state mutation (use immutable updates)
2. Verify useEffect dependencies
3. Review event handlers
4. Check for async state updates
5. Use React DevTools to inspect state

### API Calls Failing
1. Check network connectivity
2. Verify API endpoint URLs
3. Review request headers
4. Check authentication tokens
5. Monitor server logs

### Database Issues
1. Review RLS policies
2. Check query syntax
3. Verify table permissions
4. Test queries in SQL editor
5. Check foreign key constraints

## Debugging Workflow

1. **Identify the Issue**
   - Reproduce the problem
   - Gather error messages
   - Note when it occurs
   - Check affected browsers/devices

2. **Isolate the Cause**
   - Use console.log statements
   - Add breakpoints
   - Comment out code sections
   - Test in isolation

3. **Test Solutions**
   - Make minimal changes
   - Test thoroughly
   - Check for side effects
   - Verify fix works consistently

4. **Document the Fix**
   - Update relevant documentation
   - Add comments to code
   - Create test cases
   - Share knowledge with team

## Performance Debugging

### Slow Page Loading
- Use Performance tab to profile
- Check for large bundle sizes
- Analyze network waterfall
- Review component re-renders

### Memory Leaks
- Monitor memory usage over time
- Check for event listener cleanup
- Review useEffect dependencies
- Use heap snapshots

### Unnecessary Re-renders
- Use React DevTools Profiler
- Add React.memo where appropriate
- Optimize useEffect dependencies
- Use useCallback/useMemo
