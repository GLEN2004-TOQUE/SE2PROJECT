# Security TODO

## Current security mechanisms in use

### Backend
- `helmet` for HTTP security headers
- `cors` with explicit allowed origins and allowed headers
- `express-rate-limit` for brute force protection on auth and OTP endpoints
- `sanitize-html` middleware to sanitize request body strings and reduce XSS risk
- `bcryptjs` for password hashing
- `jsonwebtoken` for JWT authentication
- `verifyToken` middleware to require a valid bearer token
- `authorizeRole` and `authorizeOwnerOrRole` middleware for role-based access control
- `requireActiveUser` middleware to verify the account exists and is active
- `/health` endpoint for status checks only (no auth data exposure)

### Frontend
- `security.js` utilities for input sanitization (`sanitizeText`, `sanitizeEmail`)
- client-side auth rate-limit tracking via `localStorage` with `canAttemptAuth`
- form validation for email and password strength

## What to review / improve

### Authentication and authorization
- [ ] Confirm `process.env.JWT_SECRET` is securely set in deployment and not checked into source control
- [ ] Ensure JWT expiration (`1h`) matches session policies and token refresh needs
- [ ] Consider using HTTP-only cookies for auth instead of sending JWTs in plain Authorization headers if browser security is a concern
- [ ] Audit all protected routes to confirm `verifyToken`, `requireActiveUser`, and role checks are applied consistently

### Password handling
- [ ] Remove storing `password_plain` in database if possible; only keep hashed passwords
- [ ] Enforce stronger password rules than 6 characters, e.g. minimum 10 or use complexity checks
- [ ] Implement password reset flow with secure tokens instead of sending passwords directly, if not already present

### Input validation and sanitization
- [ ] Expand server-side validation to cover query params, route params, and JSON shapes beyond request body strings
- [ ] Add stricter validation for fields like fullName, email, lecture content, quiz titles, and uploaded file metadata

### Infrastructure and environment
- [ ] Confirm CORS origin list is minimal for production and not overly permissive
- [ ] Add rate limiting or API throttling for non-auth endpoints if needed
- [ ] Review error messages for sensitive information leakage; keep responses generic for auth failures
- [ ] Use secure database connection settings and remove `rejectUnauthorized: false` if possible

### Monitoring and logging
- [ ] Add security logging for failed auth attempts, token errors, and suspicious activity
- [ ] Monitor OTP send/verify failures and potential abuse patterns

## Notes
- The app currently uses both Supabase and local DB auth flows; verify security logic is consistent across both paths.
- This file is a starting point for a security review rather than a complete audit.
