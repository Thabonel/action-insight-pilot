# User Registration Validation Documentation

## Overview

This document describes the comprehensive input validation system implemented for user registration, ensuring strong security and data integrity across both frontend and backend.

## Validation Architecture

### Multi-Layer Validation Approach

The system implements a defense-in-depth strategy with validation at multiple levels:

1. **Frontend UI Validation** - Real-time feedback to users
2. **Frontend Pre-Submit Validation** - Client-side validation before API calls
3. **Backend Edge Function Validation** - Server-side validation via Supabase Edge Function
4. **Supabase Auth Validation** - Final validation by Supabase authentication service

---

## Password Requirements

### Strength Requirements

All passwords must meet the following criteria:

- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Lowercase**: At least one lowercase letter (a-z)
- **Uppercase**: At least one uppercase letter (A-Z)
- **Number**: At least one digit (0-9)
- **Special Character**: At least one special character (!@#$%^&*(),.?":{}|<>)
- **Common Password Check**: Password cannot be in the list of common passwords

### Common Password Blacklist

The following passwords (and similar variations) are blocked:

```
password, password123, 12345678, qwerty, abc123, monkey, 1234567,
letmein, trustno1, dragon, baseball, iloveyou, master, sunshine,
ashley, bailey, passw0rd, shadow, 123123, 654321
```

### Password Strength Scoring

Passwords receive a score from 0-5:

- **0**: Very Weak - Does not meet requirements
- **1**: Weak - Meets 1 requirement
- **2**: Fair - Meets 2-3 requirements
- **3**: Good - Meets 4 requirements
- **4**: Strong - Meets all requirements
- **5**: Very Strong - Meets all requirements with additional entropy

---

## Email Requirements

### Format Validation

- **Pattern**: RFC 5322 compliant email format
- **Maximum Length**: 320 characters (RFC 5321 limit)
- **Allowed Characters**: Letters, numbers, and special characters as per RFC standard

### Example Valid Emails

```
user@example.com
first.last@company.co.uk
user+tag@subdomain.example.org
```

---

## Frontend Implementation

### Files Modified

#### 1. `/src/pages/auth/AuthPage.tsx`

**Changes**:
- Added email validation with real-time feedback
- Added email sanitization on input
- Added comprehensive form validation before submission
- Added visual error indicators for invalid inputs
- Disabled submit button when validation fails
- Added accessibility attributes (aria-invalid, aria-describedby)

**New Features**:
- `handleEmailChange()` - Sanitizes and validates email input
- `validateForm()` - Comprehensive pre-submit validation
- `emailError` state - Tracks email validation errors
- Character limits: email (320), password (128)

#### 2. `/src/lib/validation/input-sanitizer.ts`

**Changes**:
- Enhanced `validatePasswordStrength()` function
- Added common password detection
- Added password length limits (min 8, max 128)
- Added null/undefined checks
- Improved error messages

**New Features**:
- `COMMON_PASSWORDS` - Blacklist of weak passwords
- `isCommonPassword()` - Helper function to check against blacklist

#### 3. `/src/contexts/AuthContext.tsx`

**Changes**:
- Added email validation before signup
- Added backend validation via Edge Function
- Improved error handling and messages
- Added validation of Edge Function response

**Validation Flow**:
1. Validate email format
2. Validate password strength (client-side)
3. Call backend validation Edge Function
4. If all pass, proceed with Supabase signup

---

## Backend Implementation

### Files Created

#### 1. `/backend/validation.py`

**New Module**: Comprehensive validation utilities for Python backend

**Functions**:

```python
validate_email(email: str) -> Tuple[bool, Optional[str]]
```
- Validates email format using RFC 5322 compliant regex
- Returns (is_valid, error_message)

```python
validate_password_strength(password: str) -> Dict[str, any]
```
- Validates password meets all security requirements
- Returns dict with is_valid, errors list, and score

```python
sanitize_text_input(text: str, max_length: int = 500) -> str
```
- Removes control characters
- Limits length
- Trims whitespace

```python
validate_uuid(uuid_string: str) -> bool
```
- Validates UUID v1-5 format

```python
validate_url(url: str) -> bool
```
- Validates HTTP/HTTPS URLs

```python
sanitize_sql_input(input_string: str) -> str
```
- Basic SQL injection prevention (use parameterized queries as primary defense)

**Exception Class**:
```python
ValidationError(message: str, field: Optional[str] = None)
```
- Custom exception for validation failures

---

### Supabase Edge Functions

#### 1. `/supabase/functions/validate-user-registration/index.ts`

**New Edge Function**: Server-side validation for user registration

**Endpoint**: `https://[project-ref].supabase.co/functions/v1/validate-user-registration`

**Request Body**:
```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success)**:
```typescript
{
  "success": true,
  "message": "Validation passed"
}
```

**Response (Failure)**:
```typescript
{
  "success": false,
  "errors": [
    "Password must contain at least one uppercase letter",
    "Email address is too long (maximum 320 characters)"
  ]
}
```

**Validations Performed**:
1. Email format validation
2. Email length check (max 320 characters)
3. Password strength validation
4. Password length checks (min 8, max 128)
5. Common password detection

---

## Usage Examples

### Frontend Usage

#### Validating Email Input

```typescript
import { validateEmail } from '@/lib/validation/input-sanitizer';

const email = 'user@example.com';

if (!validateEmail(email)) {
  console.error('Invalid email format');
}
```

#### Validating Password

```typescript
import { validatePasswordStrength } from '@/lib/validation/input-sanitizer';

const password = 'MySecureP@ss123';
const validation = validatePasswordStrength(password);

if (!validation.isValid) {
  console.error('Password errors:', validation.errors);
}

console.log('Password strength score:', validation.score);
```

### Backend Usage

#### Python Backend

```python
from validation import validate_email, validate_password_strength, ValidationError

email = "user@example.com"
is_valid, error = validate_email(email)

if not is_valid:
    raise ValidationError(error, field="email")

password = "SecureP@ss123"
result = validate_password_strength(password)

if not result["is_valid"]:
    raise ValidationError(
        f"Password validation failed: {', '.join(result['errors'])}",
        field="password"
    )
```

#### Calling Edge Function

```typescript
const { data, error } = await supabase.functions.invoke(
  'validate-user-registration',
  {
    body: {
      email: 'user@example.com',
      password: 'SecureP@ss123!'
    }
  }
);

if (error || !data?.success) {
  console.error('Validation errors:', data?.errors);
}
```

---

## Security Considerations

### Defense in Depth

1. **Client-side validation** provides immediate feedback and prevents unnecessary API calls
2. **Backend validation** ensures security even if client-side checks are bypassed
3. **Supabase Auth** provides final layer of authentication security

### Password Security

- Passwords are **never** logged or stored in plain text
- Validation functions only check format, not store values
- Common passwords blocked to prevent dictionary attacks
- Length limits prevent buffer overflow and DoS attacks

### Input Sanitization

- All user input is sanitized before processing
- Control characters removed
- Length limits enforced
- SQL injection patterns detected and removed (when applicable)

### Rate Limiting

Consider implementing rate limiting on the registration endpoint to prevent:
- Brute force attacks
- Account enumeration
- Resource exhaustion

---

## Testing

### Test Cases for Password Validation

```typescript
// Should pass
validatePasswordStrength('SecureP@ss123');

// Should fail - too short
validatePasswordStrength('Pass1!');

// Should fail - no uppercase
validatePasswordStrength('password123!');

// Should fail - no special character
validatePasswordStrength('Password123');

// Should fail - common password
validatePasswordStrength('password123');

// Should fail - too long (>128 chars)
validatePasswordStrength('a'.repeat(129));
```

### Test Cases for Email Validation

```typescript
// Should pass
validateEmail('user@example.com');
validateEmail('first.last@company.co.uk');
validateEmail('user+tag@example.org');

// Should fail - invalid format
validateEmail('invalid-email');
validateEmail('@example.com');
validateEmail('user@');

// Should fail - too long (>320 chars)
validateEmail('a'.repeat(310) + '@example.com');
```

---

## Deployment

### Prerequisites

1. Supabase project set up
2. Supabase CLI installed (`npm install -g supabase`)
3. Environment variables configured

### Deploy Edge Function

```bash
# Deploy the validation Edge Function
supabase functions deploy validate-user-registration

# Test the function
supabase functions invoke validate-user-registration \
  --body '{"email":"test@example.com","password":"TestP@ss123"}'
```

### Environment Variables

**Frontend** (`.env`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend** (`backend/.env`):
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

---

## Error Handling

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Password must be at least 8 characters long" | Password too short | Use longer password |
| "Password must contain at least one uppercase letter" | Missing uppercase | Add A-Z character |
| "Password is too common" | Common password used | Choose unique password |
| "Invalid email format" | Email doesn't match RFC pattern | Use valid email format |
| "Email address is too long" | Email > 320 characters | Shorten email address |

### Frontend Error Display

Errors are displayed:
1. **Inline** - Below input fields (email errors)
2. **Visual Indicator** - Password strength meter
3. **Toast Notifications** - On form submission failure
4. **Button State** - Submit button disabled when invalid

---

## Future Enhancements

### Recommended Additions

1. **Password Breach Detection** - Check against HaveIBeenPwned API
2. **Email Domain Validation** - Verify email domain has valid MX records
3. **Disposable Email Detection** - Block temporary email providers
4. **Rate Limiting** - Implement on Edge Function
5. **CAPTCHA** - Add reCAPTCHA for bot prevention
6. **Password History** - Prevent password reuse
7. **2FA Support** - Add two-factor authentication
8. **Account Lockout** - Lock account after failed attempts

---

## Troubleshooting

### Edge Function Not Working

**Issue**: Edge Function returns errors or doesn't respond

**Solutions**:
1. Check function is deployed: `supabase functions list`
2. Verify environment variables are set
3. Check function logs: `supabase functions logs validate-user-registration`
4. Ensure CORS headers are properly configured

### Frontend Validation Not Triggering

**Issue**: Validation doesn't show errors

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify import paths are correct
3. Clear browser cache and reload
4. Check if validation functions are exported properly

### Backend Validation Failing

**Issue**: Python validation functions not working

**Solutions**:
1. Verify `validation.py` is in backend directory
2. Check Python version compatibility (3.9+)
3. Ensure regex patterns are correctly formatted
4. Test functions in isolation

---

## Compliance

### GDPR Compliance

- Email validation ensures proper contact information
- No personal data stored during validation
- Validation errors don't expose sensitive information

### OWASP Recommendations

This implementation follows OWASP guidelines:
- ✅ Password length requirements (8+ characters)
- ✅ Password complexity requirements
- ✅ Input sanitization
- ✅ Defense in depth
- ✅ Secure error handling (no sensitive data leakage)

---

## Support

For issues or questions about the validation system:

1. Check this documentation
2. Review code comments in validation files
3. Check Supabase Edge Function logs
4. Create GitHub issue with details

---

**Last Updated**: 2025-10-31
**Version**: 1.0.0
**Maintainer**: Development Team
