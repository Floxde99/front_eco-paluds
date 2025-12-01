# Security Considerations - Eco-Paluds Frontend

## Authentication Token Storage

### Current Implementation

The application currently stores the authentication token in `localStorage`:

```javascript
// src/services/Api.js
localStorage.setItem('authToken', headerValue)
```

### Security Risks

⚠️ **WARNING**: Storing authentication tokens in `localStorage` presents security vulnerabilities:

1. **XSS Attacks**: Any JavaScript code running on the page can access `localStorage`
2. **No Expiration**: Tokens persist even after browser restart
3. **Cross-Tab Access**: Any tab from the same origin can access the token

### Recommended Solutions

#### Option 1: HTTP-Only Cookies (Recommended)

**Backend Changes Required:**
- Set authentication token as an `httpOnly` cookie
- Configure `sameSite` and `secure` flags
- Implement CSRF protection

**Frontend Changes:**
```javascript
// No manual token storage needed
// Browser automatically sends cookie with requests
```

**Advantages:**
- ✅ Not accessible via JavaScript (XSS protection)
- ✅ Automatic expiration
- ✅ CSRF protection with proper configuration

#### Option 2: Session Storage

**Changes:**
```javascript
// Replace localStorage with sessionStorage
sessionStorage.setItem('authToken', headerValue)
```

**Advantages:**
- ✅ Cleared when tab closes
- ✅ Not shared across tabs

**Disadvantages:**
- ❌ Still vulnerable to XSS
- ❌ User must re-login after closing tab

#### Option 3: Refresh Token Pattern

Implement a dual-token system:
- Short-lived access token (in memory)
- Long-lived refresh token (httpOnly cookie)

### Implementation Status

**Current Status:** ⚠️ Using `localStorage` (not changed in this update)

**Reason:** Changing token storage requires backend modifications and coordination with the API team.

**Next Steps:**
1. Discuss with backend team about implementing httpOnly cookies
2. Plan migration strategy
3. Update frontend to remove manual token management
4. Test authentication flow

---

## Other Security Considerations

### Input Validation

✅ **Implemented:**
- GPS coordinates validation (latitude: -90 to 90, longitude: -180 to 180)
- Email format validation
- SIRET format validation
- Phone number format validation

See: `src/lib/validation.js`

### API Security

✅ **Current Practices:**
- HTTPS for API communication
- CORS configured with `withCredentials: true`
- Request timeout (10 seconds)
- Authorization header for authenticated requests

### XSS Protection

✅ **React Built-in Protection:**
- React automatically escapes values in JSX
- Dangerous HTML injection prevented by default

⚠️ **Areas to Monitor:**
- User-generated content display
- Dynamic HTML rendering (if any)

### CSRF Protection

⚠️ **Status:** Depends on backend implementation

**Recommendation:** If using cookies for authentication, ensure backend implements CSRF tokens.

---

## Monitoring and Logging

✅ **Implemented:**
- Centralized logging service (`src/lib/logger.js`)
- Error tracking preparation (ready for Sentry integration)
- Debug logs disabled in production

---

## Future Improvements

1. **Implement Content Security Policy (CSP)**
   - Restrict script sources
   - Prevent inline scripts
   - Monitor violations

2. **Add Security Headers**
   - X-Content-Type-Options
   - X-Frame-Options
   - Strict-Transport-Security

3. **Implement Rate Limiting**
   - Protect against brute force attacks
   - API request throttling

4. **Add Subresource Integrity (SRI)**
   - Verify CDN resources
   - Prevent tampering

---

## Contact

For security concerns or to report vulnerabilities, please contact the development team.

**Last Updated:** 2025-11-21
