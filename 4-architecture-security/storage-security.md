# 🔐 Web Security & Auth Prep Guide

> Group 4 · Corrected version of the former `STORAGE-SECURITY.md` · Priority MEDIUM
> Legend: **✏️ FIXED** = corrected · **➕ ADDED** = new · unmarked = original

## What was fixed (changelog)
1. **✏️ Cookie example was wrong**: `document.cookie = "token=abc123; Secure; HttpOnly; SameSite=Strict"` **can't** create an HttpOnly cookie. Browsers ignore cookies set from JS with the `HttpOnly` attribute. HttpOnly cookies can only come from the server's `Set-Cookie` header, and that's the whole point (JS can't read them). Replaced with server-side examples (Express and Spring).
2. **✏️ Q1** clarified: `SameSite=Lax` (the default when unset in Chromium browsers; Firefox and Safari differ) already blocks most cross-site POSTs, but CSRF tokens are still recommended for state-changing requests.
3. **✏️ OAuth/OIDC** wording tightened (OAuth 2.0 delegates authorisation. OIDC adds authentication: who the user is).
4. **✏️ MFA**: added passkeys/WebAuthn as the phishing-resistant option.
5. **➕ Added**: cookie attribute table, `__Host-` prefix, IndexedDB, Spring examples, 30-second summary and traps.

## ➕ Say it in 30 seconds
"Cookies are sent automatically with requests and can be made HttpOnly, Secure and SameSite, but only by the server. localStorage and sessionStorage are readable by any script, so an XSS bug can steal anything in them, and they're for preferences, never tokens. Authentication is proving who you are (password plus MFA, ideally passkeys). Authorisation is what you can do: RBAC for roles, ABAC or ownership checks for fine-grained rules, enforced on the server. For a React + Spring app I'd use OIDC with an HttpOnly cookie session or a BFF, CSRF protection, and per-request authorisation in the API. On OneHome, consumers and agents even have different permissions on the same feature: consumers set like and dislike, agents set recommend and exclude."


---

## Storage

### Cookies

- **Definition:** Small pieces of data stored in the browser, sent with every HTTP request to the server.
- **Use cases:** Authentication (session IDs), preferences, tracking.
- **Pros:** Works across tabs, automatically sent to server.
- **Cons:** Limited storage (~4KB), security risks (XSS/CSRF if not `HttpOnly` or `SameSite`).

**✏️ FIXED code example:**

```js
// ❌ WRONG (original): JS cannot set HttpOnly. The browser ignores this cookie.
// document.cookie = "token=abc123; Secure; HttpOnly; SameSite=Strict";

// ✅ Non-sensitive cookie from JS (readable by JS, so never a token):
document.cookie = "theme=dark; Path=/; Max-Age=31536000; Secure; SameSite=Lax";

// ✅ Auth cookie set by the SERVER (Express):
res.cookie("__Host-session", sessionId, {
  httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 60 * 1000,
});
// → Set-Cookie: __Host-session=...; Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax
```
```java
// ✅ Spring
ResponseCookie cookie = ResponseCookie.from("__Host-session", sessionId)
    .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(Duration.ofMinutes(30)).build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
```

**➕ Cookie attributes**
| Attribute | Effect |
|---|---|
| `HttpOnly` | JS can't read it (blocks token theft via XSS). **Server-only** |
| `Secure` | Sent only over HTTPS |
| `SameSite=Strict` | Never sent on cross-site requests (can break login redirects or incoming links) |
| `SameSite=Lax` | Sent on top-level GET navigations, not cross-site POSTs or iframes. **Chromium default when unset** (set it explicitly) |
| `SameSite=None` | Sent cross-site. **Requires `Secure`** (third-party contexts) |
| `Domain` / `Path` | Scope. Omitting `Domain` makes it host-only (safer) |
| `__Host-` prefix | Forces `Secure`, `Path=/` and no `Domain`, which prevents subdomain overwrite |
| `Max-Age` / `Expires` | Persistence. No expiry means a session cookie |

---

### Local Storage

- **Definition:** Browser-based key/value storage. Persistent (survives page reload & browser restart).
- **Capacity:** ~5–10 MB.
- **Use cases:** Save user preferences, caching, feature flags.
- **Cons:** Accessible via JS → vulnerable to XSS. Never store sensitive tokens. ➕ Synchronous API (blocks the main thread), strings only, shared per origin across tabs (the `storage` event syncs tabs).

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

### ➕ IndexedDB / Cache Storage
- Async, large, structured storage (offline apps, PWA caches). It's also JS-accessible, so the same XSS caveat applies.

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
- **Best practices:** Prefer TOTP apps (Google Authenticator) or hardware keys (WebAuthn) over SMS. ✏️ **Passkeys (WebAuthn/FIDO2)** are phishing-resistant and increasingly replace passwords entirely.

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
- **➕ Real example:** on OneHome's Favorites feature the **consumer** sets like/dislike and the **agent** sets recommend/exclude, and both can view all four. That's a role-based write rule the API must enforce. The UI hiding the buttons isn't enough.

**Code example:**

```ts
if (user.role === "admin") {
  // allow access
} else {
  res.status(403).send("Forbidden");
}
```
```java
// ➕ Spring: roles + ownership (RBAC alone doesn't stop IDOR)
@PreAuthorize("hasRole('AGENT')")
public void recommend(Long listingId, Long consumerId) { ... }

@PreAuthorize("#userId == authentication.name")
public List<Favorite> myFavorites(String userId) { ... }
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
- **OAuth 2.0:** Delegates access (e.g., “Allow app X to access Google Calendar”). ✏️ It issues **access tokens**. It isn't an authentication protocol by itself.
- **OIDC:** Extends OAuth2 with identity (who the user is). ✏️ Adds the **ID token** (always a JWT) and a `userinfo` endpoint.
- **➕ For SPAs:** Authorization Code flow **with PKCE** (the implicit flow is deprecated in OAuth 2.1 / current best practice). Or a BFF that does the code flow server-side.
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
- ✏️ **Nuance:** `SameSite=Lax` (set explicitly; Chromium also defaults to it) already blocks cookies on most cross-site POSTs, which removes most CSRF. But it's defence in depth: keep CSRF tokens for state-changing requests (Spring Security enables them by default for session apps), and remember same-site subdomains aren't "cross-site". Keeping tokens in memory plus a refresh HttpOnly cookie, or a BFF, are also good options.

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
- Use **service-to-service authentication** (mTLS, API keys). ➕ Prefer OAuth2 **client credentials** tokens or workload identity (IAM roles) over static API keys.
- ➕ Authorise per request in each service (zero trust). Don't rely on the gateway alone.


---

## ➕ Traps and gotchas
- Setting `HttpOnly` from `document.cookie`: impossible (see the fix above).
- Tokens in localStorage "because it's easier".
- `SameSite=None` without `Secure` gets rejected by browsers.
- Thinking SameSite makes XSS safe. XSS runs same-site, and it can do anything the user can.
- Role checks only (RBAC) without ownership checks means IDOR (OWASP 2025 A01).
- Implicit OAuth flow in new SPAs. Use code + PKCE.
- Authorisation only in the front end.
