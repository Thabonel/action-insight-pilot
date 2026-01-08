# Pre-Deployment Smoke Test Checklist

Run these tests on `http://localhost:8080` before pushing to production.

## Environment
- [ ] Backend running: `http://localhost:8000/health` returns 200
- [ ] Frontend running: `http://localhost:8080` loads
- [ ] No console errors in browser DevTools

## Authentication
- [ ] Login works with valid credentials
- [ ] Logout works
- [ ] Invalid credentials show error
- [ ] Session persists on refresh

## Dashboard
- [ ] Dashboard loads after login
- [ ] Campaign cards display correctly
- [ ] Navigation works (all menu items clickable)
- [ ] User avatar/profile menu works

## Campaign Management
- [ ] Create new campaign form loads
- [ ] Campaign creation succeeds
- [ ] Created campaign appears in dashboard
- [ ] Campaign editing works
- [ ] Campaign deletion works (with confirmation)

## AI Features
- [ ] AI suggestions generate
- [ ] Content generation works
- [ ] No AI API errors in console

## Settings
- [ ] Settings page loads
- [ ] API key fields display (if configured)
- [ ] Save settings works

## Performance
- [ ] Page load < 3 seconds
- [ ] No infinite loading states
- [ ] No memory leaks (check DevTools)

## Visual
- [ ] No layout breaks
- [ ] Responsive on mobile (resize browser)
- [ ] Dark mode works (if applicable)

✅ All checks passed → Ready to push
❌ Any failures → Fix before pushing
