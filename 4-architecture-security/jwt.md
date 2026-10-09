# 🚀 JWT Quick Review (Cheat Sheet)

> Group 4 · Corrected version of the former `JWT.md` · Priority MEDIUM
> Legend: **✏️ FIXED** = corrected · **➕ ADDED** = new · unmarked = original

## What was fixed (changelog)
1. **✏️ Angular interceptor bug**: a **class** `HttpInterceptor` was registered with `withInterceptors([...])`, which only accepts **functional** interceptors (`HttpInterceptorFn`). Now shows the functional version, plus the correct class-based registration (`withInterceptorsFromDi()` + `HTTP_INTERCEPTORS`).
2. **✏️ Contradiction**: the interceptor read the token from `sessionStorage` while the file says to avoid web storage. It now uses an in-memory token service, with the cookie option explained.
3. **✏️ Express middleware**: invalid or expired token now returns **401** (not 403), and `jwt.verify` **pins algorithms** and checks issuer/audience (prevents `alg: none` and algorithm-confusion attacks). The secret comes from env.
4. **✏️ Header parsing** made robust (`Bearer` scheme check).
5. **➕ Added**: React fetch example, Spring resource-server equivalent, JWS vs JWE, `aud`/`iss` validation, refresh-token rotation, 30-second summary and traps.

## ➕ Say it in 30 seconds
"A JWT is a signed, base64url-encoded token (header, payload, signature) carrying claims like `sub`, `roles`, `exp`, `iss` and `aud`. It's signed, not encrypted, so anyone can read it and nobody should put secrets in it. The API verifies the signature with the issuer's public key (JWKS), pins the algorithm, and checks expiry, issuer and audience, which gives stateless auth across services. Access tokens are short-lived, and refresh tokens are rotated and kept in HttpOnly cookies. In the browser, the safest options are an HttpOnly cookie (plus CSRF protection) or memory, not localStorage. In Spring that's the OAuth2 resource server. In React, the token is attached by a fetch wrapper or a BFF."


- **JWT** = JSON Web Token → `header.payload.signature`
- **Used for:** Stateless auth (✏️ React/Angular → BFF → APIs (Spring/Node) → AWS)
- **Flow:** Login → JWT issued → Frontend stores → Sends `Authorization: Bearer <token>` → BFF validates → Microservices trust claims
- **Best Practices:**
  - Short-lived Access Tokens + Refresh Tokens
  - Store in HttpOnly secure cookie (not localStorage)
  - Always check `exp`, verify signature ➕ (and `iss`, `aud`; pin the allowed `alg`)
  - JWT ≠ encrypted, only signed (payload is visible)
- **Interview Keywords:** Stateless, scalability, integrity, OAuth2/OIDC, Cognito, revocation, refresh token

---
# 🔑 JWT Token Basics

-   **JWT** = JSON Web Token.

-   It's a **string** (three parts separated by `.`):

        header.payload.signature

    -   **Header**: metadata (`alg`, `typ`).
    -   **Payload**: claims (e.g., `sub`, `roles`, `exp`).
    -   **Signature**: HMAC or RSA ➕/ECDSA signature to ensure integrity. ➕ (Signed JWT = **JWS**. Encrypted JWT = **JWE**, rarely needed.)

------------------------------------------------------------------------

# 🔄 JWT Authentication Flow

### 1. **Login / Auth**

-   User logs in (username/password, SSO, OAuth2).
-   **Auth server** verifies credentials.
-   If valid → issues a **JWT** signed with a secret/private key.

Example payload:

``` json
{
  "sub": "user123",
  "name": "Jane Doe",
  "roles": ["admin"],
  "iat": 1694180400,
  "exp": 1694184000
}
```

JWT (simplified):

    eyJhbGciOiJIUzI1NiIsInR5cCI6...<snip>

------------------------------------------------------------------------

### 2. **Frontend (✏️ React or Angular) stores JWT**

-   Usually in **memory** or **Secure HttpOnly Cookie**.\
    (⚠️ Avoid `localStorage` if possible --- XSS risk).\
-   ✏️ The app adds `Authorization: Bearer <token>` to API calls (an Angular interceptor, or a React fetch wrapper). With HttpOnly cookies, the browser sends the cookie automatically and JS never sees the token.

------------------------------------------------------------------------

### 3. **BFF / API Gateway**

-   Node.js BFF receives request with JWT in header:

        Authorization: Bearer eyJhbGciOi...

-   BFF **verifies** signature (using shared secret or public key).

-   If valid:

    -   Extracts claims (user id, roles).
    -   Attaches user info to `req.user` for business logic.

------------------------------------------------------------------------

### 4. **Microservices**

-   BFF forwards calls to microservices.\
-   Either:
    -   **Pass the JWT along** (propagate identity).\
    -   Or issue **new internal token** for microservice communication.

------------------------------------------------------------------------

### 5. **Token Expiration & Refresh**

-   JWT usually **short-lived** (e.g., 15 mins).\
-   Refresh token (long-lived) stored securely (e.g., HttpOnly cookie).\
-   Angular app requests **new JWT** when old one expires.

------------------------------------------------------------------------

# ⚙️ Node.js Example -- JWT Verification

Install:

``` bash
npm i jsonwebtoken
```

**Middleware in Express** (`auth.js`):

``` js
// ✏️ FIXED: 401 for invalid/expired tokens, algorithms pinned, iss/aud checked, secret from env
const jwt = require("jsonwebtoken");
const publicKey = process.env.JWT_PUBLIC_KEY;   // RS256: verify with the issuer's public key (or fetch JWKS with jwks-rsa)

function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or malformed token" });
  }
  try {
    req.user = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],                 // never accept "none" or an unexpected alg (alg-confusion attack)
      issuer: "https://auth.example.com/",
      audience: "listing-api",
    });
    return next();
  } catch (err) {
    // ✏️ 401 = not authenticated (bad/expired token). 403 is for "authenticated but not allowed".
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
module.exports = authMiddleware;
```

Usage:

``` js
const auth = require("./auth");
app.get("/api/secure", auth, (req, res) => {
  res.json({ message: `Hello ${req.user.name}` });
});
```

------------------------------------------------------------------------

# ⚙️ Angular Example -- Attaching Token

✏️ **FIXED.** The original registered a *class* interceptor with `withInterceptors()`, which only accepts **functional** interceptors, so it wouldn't work. It also read the token from `sessionStorage`, contradicting the advice above.

**Functional interceptor (modern, standalone apps):**

``` ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStore } from './token-store';          // in-memory service, not web storage

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStore).accessToken();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
```

Register in `main.ts`:

``` ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))]
});
```

**Class-based interceptor (legacy DI style), correct registration:**

``` ts
providers: [
  provideHttpClient(withInterceptorsFromDi()),
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
]
```

# ➕ ⚙️ React Example -- Attaching Token

``` ts
// api.ts: a thin fetch wrapper; token kept in memory (module scope / context), refreshed via an HttpOnly refresh cookie
let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers,
               ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    credentials: 'include',                 // sends the HttpOnly refresh cookie to /api/auth/refresh
  });
  if (res.status === 401 && path !== '/auth/refresh') {
    const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (r.ok) { setAccessToken((await r.json()).accessToken); return api<T>(path, init); }
  }
  if (!res.ok) throw await res.json();      // ProblemDetail
  return res.json();
}
```
➕ Even simpler and safer: a **BFF** keeps tokens server-side and the browser only holds an HttpOnly session cookie.

# ➕ ⚙️ Spring Boot Example -- Validating JWTs

``` yaml
spring.security.oauth2.resourceserver.jwt:
  issuer-uri: https://auth.example.com/        # discovers JWKS, validates signature, exp, nbf, iss
  audiences: listing-api                        # Boot 3.x property to validate aud
```
``` java
http.oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));   // then @PreAuthorize("hasAuthority('SCOPE_listings:write')")
```

------------------------------------------------------------------------

# 🧩 Interview Cheat-Sheet Phrases

-   **JWT is stateless** → server doesn't need to keep sessions in DB.\
-   **Integrity** is guaranteed via signature, not secrecy.\
-   **Short-lived access tokens + refresh tokens** are best practice.\
-   **OAuth2 + OIDC** often sit on top (Auth0, Cognito, etc.).\
-   In **Vanguard AWS stack**, JWTs likely issued by **Cognito / SSO**
    and verified in **Lambda / API Gateway**.
-   ✏️ In a **Spring + React on AWS** stack: issued by Cognito or the corporate IdP (OIDC), verified by Spring Security's resource server in each service, or once at the gateway.

------------------------------------------------------------------------

# 📊 Analogy

Think of JWT like a **boarding pass**: - Issued by airline (Auth
server).\
- Contains your name, seat, and expiry.\
- Gate agents (APIs) check its validity; they don't call the airline DB
each time.\
- If it's tampered with, signature check fails.


---

# 📝 Common JWT Interview Questions

### 1. **What is a JWT and why do we use it?**
- *Answer:*  
  JWT = JSON Web Token, a compact, URL-safe token that encodes claims and is cryptographically signed.  
  It allows **stateless authentication** (server doesn’t need to store sessions) and is easy to transmit between systems (e.g., Angular → Node BFF → APIs).  

### 2. **What’s inside a JWT?**
- *Answer:*  
  Three parts:
  - Header (metadata, algorithm)  
  - Payload (claims: `sub`, `roles`, `exp`)  
  - Signature (ensures integrity, prevents tampering)  

### 3. **How does the server validate a JWT?**
- *Answer:*  
  Using the secret key (HMAC) or public key (RSA/ECDSA) that matches the issuer’s signing method.  
  The server decodes, verifies signature, checks expiration, and extracts claims.  

### 4. **Where should we store JWTs in a frontend app?**
- *Answer:*  
  Ideally: **HttpOnly secure cookies** (protected from XSS ➕ token theft, but then you need CSRF protection: `SameSite` + CSRF tokens).  
  Sometimes: in-memory storage (cleared on refresh, safer than localStorage).  
  ⚠️ Avoid localStorage/sessionStorage if security requirements are strict.  

### 5. **What is the difference between Access Token and Refresh Token?**
- *Answer:*  
  - Access token (short-lived, e.g., 15 min) → used on each API call.  
  - Refresh token (longer-lived, e.g., days) → used only to obtain new access tokens.  
  This reduces damage if a token leaks.  

### 6. **What happens if someone steals a JWT?**
- *Answer:*  
  - They can impersonate the user until it expires.  
  - That’s why tokens should be short-lived, sent only over HTTPS, and refresh tokens stored securely.  
  - You can also use token revocation lists or rotate secrets to mitigate.  

### 7. **What are common pitfalls when using JWT?**
- *Answer:*  
  - Storing too much data in the payload (tokens get large).  
  - Not checking expiration (`exp`).  
  - Using weak signing algorithms (e.g., none/HS256 with short secret).  
  - ➕ Not pinning the algorithm in verification (alg-confusion: an RS256 public key used as an HS256 secret).  
  - ➕ Not validating `aud`/`iss`, so a token for another app is accepted.  
  - ➕ Long-lived access tokens with no refresh rotation.  
  - Treating JWT as encrypted — it’s only **signed** by default (anyone can read payload).  

### 8. **What’s the difference between JWT and opaque tokens?**
- *Answer:*  
  - JWT = self-contained, client and server can read claims.  
  - Opaque tokens = random string, server must call token store (DB/Redis) to validate.  
  - JWTs = more scalable; opaque = more control (easier revocation).  

### 9. **How does JWT fit with OAuth2/OIDC?**
- *Answer:*  
  - In OAuth2, the Authorization Server issues tokens; JWT is a common format for **access tokens**.  
  - In OIDC (an identity layer on top of OAuth2), the **ID token** is always a JWT with user identity claims.  

### 10. **How would you revoke a JWT if it’s stateless?**
- *Answer:*  
  - Short TTL (time-to-live) + refresh tokens.  
  - Maintain a **revocation list/blacklist** for high-risk scenarios.  
  - Rotate signing keys (invalidate all tokens at once).  
  - ➕ **Refresh-token rotation** with reuse detection: each refresh issues a new refresh token, and reuse of an old one revokes the whole family.  
  - Use reference tokens (less common, moves back to server-side validation).  

### 11. **When would you NOT use JWT?**
- *Answer:*  
  - If tokens need to be revoked frequently in real-time (banking, high security).  
  - If payload size grows too large.  
  - If system is entirely centralized (sessions in Redis may be simpler).  

### 12. **How do microservices handle JWT in distributed systems?**
- *Answer:*  
  - Each service verifies the JWT independently (shared secret/public key).  
  - Services can trust user identity without querying central DB.  
  - Sometimes API Gateway validates JWT once, and forwards claims via headers.  


---

## ➕ Traps and gotchas
- "JWT is encrypted": no, it's base64url. Anyone can decode the payload.
- Putting PII or permissions you'd regret leaking into the payload.
- `jwt.decode()` instead of `jwt.verify()`: decode doesn't check the signature.
- 403 for an expired token. It should be 401, so the client knows to refresh or log in.
- localStorage tokens plus any XSS means account takeover.
- Cookie-based auth with no CSRF protection.
- Huge tokens in every request: headers have size limits (around 8 KB on many servers).
