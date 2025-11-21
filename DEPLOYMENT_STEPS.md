# Deployment Steps for User Registration Validation

## Prerequisites

1. Supabase project configured
2. Supabase CLI authenticated: `supabase login`
3. Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

## Step 1: Deploy Edge Function

```bash
# Deploy the validation Edge Function
cd /Users/thabonel/Code/action-insight-pilot
supabase functions deploy validate-user-registration

# Verify deployment
supabase functions list
```

## Step 2: Test Edge Function

```bash
# Test the deployed function
supabase functions invoke validate-user-registration \
  --body '{"email":"test@example.com","password":"TestP@ss123!"}'

# Should return:
# {"success":true,"message":"Validation passed"}

# Test with invalid data
supabase functions invoke validate-user-registration \
  --body '{"email":"invalid","password":"weak"}'

# Should return errors
```

## Step 3: Test Frontend Integration

1. Start the dev server:
```bash
npm run dev
```

2. Open browser to registration page

3. Test scenarios:
   - ✅ Valid email + strong password → should succeed
   - ❌ Invalid email → should show error
   - ❌ Weak password → should show strength indicator errors
   - ❌ Common password (e.g., "password123") → should be rejected

## Step 4: Monitor Edge Function

```bash
# View real-time logs
supabase functions logs validate-user-registration --tail
```

## Step 5: (Optional) Update Backend Routes

If you have custom backend endpoints that need validation:

```python
# In any backend route file
from validation import validate_email, validate_password_strength, ValidationError

@router.post("/some-endpoint")
async def some_endpoint(email: str, password: str):
    # Validate email
    is_valid, error = validate_email(email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Validate password
    result = validate_password_strength(password)
    if not result["is_valid"]:
        raise HTTPException(
            status_code=400,
            detail=f"Password validation failed: {', '.join(result['errors'])}"
        )

    # Continue with endpoint logic...
```

## Verification Checklist

- [ ] Edge Function deployed successfully
- [ ] Edge Function responds to test requests
- [ ] Frontend shows validation errors correctly
- [ ] Strong password requirements enforced
- [ ] Email validation working
- [ ] Common passwords are blocked
- [ ] User can successfully register with valid credentials
- [ ] Edge Function logs show validation activity

## Troubleshooting

### Edge Function fails to deploy

```bash
# Check if you're logged in
supabase status

# Re-link project
supabase link --project-ref YOUR_PROJECT_REF

# Try deploying again
supabase functions deploy validate-user-registration
```

### Frontend can't reach Edge Function

Check:
1. Edge Function is deployed: `supabase functions list`
2. CORS headers are set (already in code)
3. Supabase URL and anon key are correct in `.env`

### Validation not triggering

Check browser console for errors and verify:
1. AuthContext.tsx is calling the Edge Function
2. Edge Function name matches: `validate-user-registration`
3. Request body format is correct
