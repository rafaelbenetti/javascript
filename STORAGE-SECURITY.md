# 🔐 Web Security & Auth Prep Guide

---

## Storage

### Cookies

- **Definition:** Small pieces of data stored in the browser, sent with every HTTP request to the server.
- **Use cases:** Authentication (session IDs), preferences, tracking.
- **Pros:** Works across tabs, automatically sent to server.
- **Cons:** Limited storage (~4KB), security risks (XSS/CSRF if not `HttpOnly` or `SameSite`).

**Code example:**

```js
// set cookie
document.cookie = "token=abc123; Secure; HttpOnly; SameSite=Strict";
```

---

### Local Storage

- **Definition:** Browser-based key/value storage. Persistent (survives page reload & browser restart).
- **Capacity:** ~5–10 MB.
- **Use cases:** Save user preferences, caching, feature flags.
- **Cons:** Accessible via JS → vulnerable to XSS. Never store sensitive tokens.

**Code example:**

```js
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");
```

---

### Session Storage

- **Definition:** Similar to Local Storage but tied to a browser tab/session. Cleared when tab closes.
- **Capacity:** ~5 MB.
- **Use cases:** Temporary state (wizard progress, session flags).

**Code example:**

```js
sessionStorage.setItem("step", "2");
const step = sessionStorage.getItem("step");
```

---

## Authentication

### Knowledge-based authentication

- **Definition:** Based on _something you know_.
- **Examples:** Passwords, PINs, security questions.
- **Weaknesses:** Can be guessed, phished, leaked.
- **Best practices:** Use strong password policies + hashing (bcrypt/argon2).

---

### Possession-based authentication

- **Definition:** Based on _something you have_.
- **Examples:** OTP from SMS/app, hardware token, smart card.
- **Strengths:** Harder to steal remotely.
- **Weaknesses:** Can be lost/stolen, SIM-swapping attacks.

---

### Multi-Factor authentication (MFA)

- **Definition:** Combining two or more authentication factors (knowledge, possession, inherence/biometric).
- **Examples:** Password + SMS OTP, Password + Authenticator app, Password + Fingerprint.
- **Best practices:** Prefer TOTP apps (Google Authenticator) or hardware keys (WebAuthn) over SMS.

---

## Authorization

### Cookies + Session Authorization

- **Flow:**

  1. User logs in with credentials.
  2. Server creates a session & stores session ID in DB/memory.
  3. Session ID sent to client in a **cookie**.
  4. Browser sends cookie automatically with each request.
  5. Server validates session ID → grants access.

- **Pros:** Secure if cookies are `HttpOnly`, `Secure`, and `SameSite=Strict`.
- **Cons:** Doesn’t scale well in distributed systems unless sessions are shared (Redis).

**Code (Express.js):**

```js
// login route
app.post("/login", (req, res) => {
  const user = authenticate(req.body);
  if (user) {
    req.session.userId = user.id; // session middleware stores in memory/Redis
    res.send("Logged in");
  } else {
    res.status(401).send("Invalid credentials");
  }
});
```

---

### Role-Based Access Control (RBAC)

- **Definition:** Access is granted based on the **role** assigned to the user.
- **Examples:** `Admin`, `Manager`, `Employee`.
- **Pros:** Simple, easy to manage.
- **Cons:** Not fine-grained.

**Code example:**

```ts
if (user.role === "admin") {
  // allow access
} else {
  res.status(403).send("Forbidden");
}
```

---

### Attribute-Based Access Control (ABAC)

- **Definition:** Access is based on **attributes** (user, resource, environment).
- **Examples:**

  - User attribute: department = “Finance”
  - Resource attribute: document.owner = user.id
  - Environment: only allow during business hours

- **Pros:** Very flexible, fine-grained.
- **Cons:** More complex policies to manage.

---

### Rule/Policy-Based Authorization

- **Definition:** Uses predefined **rules or policies** for access decisions.
- **Examples:**
  - Only users from `@company.com` can join.
  - Requests from outside VPN are blocked.
- Often implemented via **policy engines** (e.g., Open Policy Agent).

---

### OAuth 2.0 / OpenID Connect

- **Definition:** Authorization & authentication standards.
- **OAuth 2.0:** Delegates access (e.g., “Allow app X to access Google Calendar”).
- **OIDC:** Extends OAuth2 with identity (who the user is).
- **Pros:** Widely used, standardized.
- **Cons:** Misconfiguration can lead to vulnerabilities.

---

### Access Control Lists (ACLs)

- **Definition:** Defines **which users/groups can access which resources**.
- **Example:**
  - File `report.pdf` → read: Alice, Bob; write: Alice.
- **Pros:** Very precise.
- **Cons:** Hard to manage at scale.

---

### Context/Risk-Based Authorization

- **Definition:** Decisions based on **contextual signals**.
- **Examples:**
  - If login from new country → require MFA.
  - If risk score is high → block access.
- Used in **Zero Trust** security models.

---

# 📝 Interview Questions & Answers

## 1) Where should you store JWTs — Cookies or Local Storage?

**Answer:**

- **Cookies (HttpOnly, Secure, SameSite):** safer against XSS, but need CSRF protection.
- **LocalStorage:** vulnerable to XSS, should be avoided for sensitive tokens.
- **Best practice:** Use **HttpOnly cookies** + CSRF tokens.

---

## 2) What’s the difference between authentication and authorization?

**Answer:**

- **Authentication:** Verifying who the user is (login, MFA).
- **Authorization:** Deciding what the user can access (roles, permissions).

---

## 3) How does Session-based authentication differ from JWT-based authentication?

**Answer:**

- **Session-based:** Server stores session in memory/DB; client gets session ID in cookie.
- **JWT-based:** Token is stateless, signed, and stored on client (cookie or storage).
- **Trade-off:** Sessions are simpler but harder to scale; JWTs scale but must be secured.

---

## 4) Why is MFA important in modern apps?

**Answer:**

- Protects against stolen credentials.
- Adds extra layers (OTP, biometric) beyond just passwords.
- Required for compliance in finance, healthcare.

---

## 5) Compare RBAC vs ABAC — when would you use each?

**Answer:**

- **RBAC:** Simple roles → admin, user, manager. Use in small/medium apps.
- **ABAC:** Attribute-driven, fine-grained. Use in large enterprises with complex policies.

---

## 6) What are common security risks with cookies? How do you mitigate them?

**Answer:**

- Risks: XSS, CSRF, session hijacking.
- Mitigations: `HttpOnly`, `Secure`, `SameSite=Strict`, rotate session IDs, short expiry.

---

## 7) How does OAuth 2.0 differ from OIDC?

**Answer:**

- **OAuth 2.0:** Authorization only (what you can do).
- **OIDC:** Authentication + Authorization (who you are + what you can do).

---

## 8) What’s the difference between access control lists (ACL) and RBAC?

**Answer:**

- **ACL:** Fine-grained per-resource rules.
- **RBAC:** Role-based, simpler grouping of permissions.
- **Example:** ACL → “Alice can edit doc A”; RBAC → “Editors can edit all docs”.

---

## 9) What are common attacks in authentication/authorization flows?

**Answer:**

- **XSS:** Steals tokens from localStorage.
- **CSRF:** Tricks browser into sending cookies.
- **Brute force:** Guessing passwords.
- **Mitigation:** HttpOnly cookies, CSRF tokens, rate limiting, MFA.

---

## 10) How would you secure a distributed system (microservices) with auth?

**Answer:**

- Use **JWTs** or **OAuth2 access tokens** for stateless authentication across services.
- Centralize identity provider (IdP) like **Keycloak / Auth0**.
- Use **service-to-service authentication** (mTLS, API keys).
