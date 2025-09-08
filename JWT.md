# 🚀 JWT Quick Review (Cheat Sheet)

- **JWT** = JSON Web Token → `header.payload.signature`
- **Used for:** Stateless auth (Angular → Node BFF → APIs → AWS)
- **Flow:** Login → JWT issued → Frontend stores → Sends `Authorization: Bearer <token>` → BFF validates → Microservices trust claims
- **Best Practices:**
  - Short-lived Access Tokens + Refresh Tokens
  - Store in HttpOnly secure cookie (not localStorage)
  - Always check `exp`, verify signature
  - JWT ≠ encrypted, only signed (payload is visible)
- **Interview Keywords:** Stateless, scalability, integrity, OAuth2/OIDC, Cognito, revocation, refresh token

---
# 🔑 JWT Token Basics

-   **JWT** = JSON Web Token.

-   It's a **string** (three parts separated by `.`):

        header.payload.signature

    -   **Header**: metadata (`alg`, `typ`).
    -   **Payload**: claims (e.g., `sub`, `roles`, `exp`).
    -   **Signature**: HMAC or RSA signature to ensure integrity.

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

### 2. **Frontend (Angular) stores JWT**

-   Usually in **memory** or **Secure HttpOnly Cookie**.\
    (⚠️ Avoid `localStorage` if possible --- XSS risk).\
-   Angular adds `Authorization: Bearer <token>` to API calls.

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
const jwt = require("jsonwebtoken");
const secret = "super-secret"; // use env var in real app

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded; // payload available to downstream
    next();
  });
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

Use **HTTP Interceptor**:

``` ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = sessionStorage.getItem("jwt"); // or in-memory service
    if (token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
```

Register in `main.ts`:

``` ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([AuthInterceptor]))]
});
```

------------------------------------------------------------------------

# 🧩 Interview Cheat-Sheet Phrases

-   **JWT is stateless** → server doesn't need to keep sessions in DB.\
-   **Integrity** is guaranteed via signature, not secrecy.\
-   **Short-lived access tokens + refresh tokens** are best practice.\
-   **OAuth2 + OIDC** often sit on top (Auth0, Cognito, etc.).\
-   In **Vanguard AWS stack**, JWTs likely issued by **Cognito / SSO**
    and verified in **Lambda / API Gateway**.

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
  Ideally: **HttpOnly secure cookies** (protected from XSS).  
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
