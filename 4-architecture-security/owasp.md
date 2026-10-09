# 🛡️ OWASP Top 10 ( updated: 2021 → **2025**)

> Group 4 · Priority MEDIUM (JD: security and data privacy)

## Say it in 1 minute
"The OWASP Top 10 for 2025 starts with Broken Access Control, and SSRF now sits inside that category. Security Misconfiguration is next, then Software Supply Chain Failures, then Cryptographic Failures, Injection, and Insecure Design. In a Spring and React app I turn that list into habits. Every request is authorised on the server, including an ownership check, not only a role name. Defaults stay locked, so actuator and debug endpoints are not public. Lockfiles and dependency scanning cover the supply chain. TLS and a real password hash cover cryptography. Queries are parameterised, so user input never builds the SQL. Features that touch identity or personal data get a threat model, and errors fail closed without leaking internals. At EPAM I have worked through Veracode findings, and I automated part of that remediation with AI agent skills. The fixes still go through review and tests like any other change."

## 🔹 Quick List ( 2025)

1. **A01:2025 Broken Access Control** ( now includes SSRF)
2. **A02:2025 Security Misconfiguration** ( was #5)
3. **A03:2025 Software Supply Chain Failures** ( new; expands "Vulnerable and Outdated Components")
4. **A04:2025 Cryptographic Failures** (was #2)
5. **A05:2025 Injection** (was #3, includes XSS)
6. **A06:2025 Insecure Design** (was #4)
7. **A07:2025 Authentication Failures** ( renamed)
8. **A08:2025 Software or Data Integrity Failures**
9. **A09:2025 Security Logging & Alerting Failures** ( renamed: "Monitoring" → "Alerting")
10. **A10:2025 Mishandling of Exceptional Conditions** ( new)

*(2021 list for reference: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable and Outdated Components, Identification and Authentication Failures, Software and Data Integrity Failures, Security Logging and Monitoring Failures, SSRF.)*

---

### **1️⃣ A01 Broken Access Control**

**Description:**
Users can perform actions or access resources beyond their permissions.
**Example:**
A regular user modifies a URL `/admin/delete?id=10` to delete another user’s data. IDOR: `GET /api/v1/favorites/123` returns someone else's favourites because only authentication is checked, not ownership. CSRF also maps here.
**Mitigation:**

- Enforce **server-side authorization checks**.
- Apply **least privilege** and **deny by default** policies.
- **Spring:** `authorizeHttpRequests` + `@PreAuthorize`, **and** ownership checks in the service (`favorite.userId == currentUser`). Hiding a button in React is UX, not security.

**SSRF (merged into A01 in 2025):** server makes unauthorized requests to internal/external systems, e.g. a user submits a URL like `http://169.254.169.254` to steal cloud metadata credentials. Mitigate with allowlists of hosts and schemes, blocking private and link-local ranges (after DNS resolution), no redirects following, network egress controls, and **IMDSv2** on AWS.

---

### **2️⃣ A02 Security Misconfiguration** ( was #5)

**Description:**
Improperly configured systems or frameworks expose vulnerabilities.
**Example:**

- Default admin credentials still active.
- Open S3 buckets with public access.
- Spring Actuator `/env`, `/heapdump` exposed publicly. Verbose stack traces in API errors. CORS `*` with credentials. Debug mode in production.

**Mitigation:**
- Automate secure configurations. **(IaC with reviewed defaults, S3 Block Public Access, security headers: CSP, HSTS, X-Content-Type-Options, frame-ancestors)**
- Disable unused endpoints and features.

---

### **3️⃣ A03 Software Supply Chain Failures** ( new, replaces "Vulnerable and Outdated Components")

**Description:**
Compromise or weakness anywhere in how software is built and delivered: vulnerable or malicious dependencies, compromised build tools or CI, unsigned artifacts, typosquatting.
**Example:**

- Unpatched React version with XSS bug.
- Outdated Log4j causing remote code execution (Log4Shell, 2021).
- Malicious npm package versions published by hijacked maintainer accounts (e.g. the 2025 "Shai-Hulud" npm worm). Typosquatted packages.

**Mitigation:**
- Regularly update dependencies.
- Use **Snyk**, **Dependabot**, or **OWASP Dependency-Check**. **(or Veracode SCA, which is what I've remediated findings with at EPAM)**
- Lockfiles + `npm ci`, pinned base images, SBOMs (CycloneDX), signed artifacts and provenance (Sigstore/SLSA), least-privilege CI tokens, review new dependencies.

---

### **4️⃣ A04 Cryptographic Failures** (was #2)

**Description:**
Sensitive data exposed due to missing or weak encryption.
**Example:**
Passwords stored in plain text or transmitted without HTTPS.
**Mitigation:**

- Use **TLS 1.2+** for all connections ( prefer 1.3, HSTS).
- Hash passwords with **bcrypt** or **Argon2** ( Spring: `PasswordEncoderFactories.createDelegatingPasswordEncoder()`. Never MD5/SHA-1, never reversible encryption for passwords).
- Never hardcode secrets in code or config.
- Encrypt sensitive data at rest (KMS). Don't invent crypto. Use secure random generators for tokens.

---

### **5️⃣ A05 Injection** (was #3)

**Description:**
Untrusted input alters commands or queries. Includes SQL, NoSQL, OS command, LDAP, expression-language injection, and **XSS**.

**SQL injection**

A quoted string like `SELECT * FROM users WHERE id = '1 OR 1=1';` doesn't inject anything: the whole thing is one quoted string. Injection happens when **input is concatenated into the query**:

```java
// ❌ VULNERABLE: string concatenation
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
// attacker sends:  ' OR '1'='1' --
// resulting SQL:   SELECT * FROM users WHERE email = '' OR '1'='1' -- '
//   → returns every user (the -- comments out the trailing quote)

// numeric variant: "SELECT * FROM users WHERE id = " + id   with id = "1 OR 1=1"
```
```java
// ✅ JDBC PreparedStatement: input is bound as data, never parsed as SQL
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);

// ✅ JPA / JPQL named parameter
em.createQuery("select u from User u where u.email = :email", User.class)
  .setParameter("email", email);

// ✅ Spring Data: derived queries and @Query with :params are parameterised
Optional<User> findByEmail(String email);

// ❌ still vulnerable inside JPA: "select u from User u where u.email = '" + email + "'"
// ❌ ORDER BY / column names can't be bound → allowlist them: Sort.by(allowed(field))
```

**XSS (React angle):** JSX escapes values by default, so `{userInput}` is safe. Dangerous paths are `dangerouslySetInnerHTML`, `href={userUrl}` with `javascript:` URLs, and injecting into `<script>`. Sanitise with DOMPurify, validate URL schemes, and add a strict **Content Security Policy**.

**Mitigation:**

- Use **parameterized queries** or ORM.  (An ORM only helps if you don't concatenate strings in JPQL/native queries.)
- Validate and sanitize all inputs.  (Allowlist validation, and encode output for the context: HTML, attribute, URL, JS.)

---

### **6️⃣ A06 Insecure Design** (was #4)

**Description:**
Missing security controls due to flawed design or architecture.
**Example:**
A financial app doesn’t limit transaction frequency → vulnerable to abuse.  A password reset that relies on guessable security questions.
**Mitigation:**

- Perform **threat modeling** early ( STRIDE, abuse cases in refinement).
- Design using **secure patterns** (e.g., defense in depth).  Rate limits, business-logic limits, secure-by-default libraries.

---

### **7️⃣ A07 Authentication Failures** ( renamed from "Identification and Authentication Failures")

**Description:**
Weak login, session, or identity management.
**Example:**

- JWTs without expiration.
- Session IDs in URLs.
- Credential stuffing with no rate limiting. JWT `alg: none` or algorithm confusion accepted.

**Mitigation:**
- Implement **multi-factor authentication (MFA)**  (passkeys/WebAuthn are strongest).
- Use **secure cookies** (`HttpOnly`, `SameSite`, `Secure`).
- Rate limiting and lockout with backoff, breached-password checks, session rotation on login, use a proven IdP (OIDC) rather than custom auth.

---

### **8️⃣ A08 Software or Data Integrity Failures**

**Description:**
Trusting unverified code, updates or data. *( Supply-chain build issues now mostly live in A03. A08 focuses on integrity checks of code and data.)*
**Example:**

- CI/CD pipeline executes unsigned code.
- NPM package replaced with malicious version.
- Insecure deserialisation of untrusted data (Java native serialisation, Jackson default typing). Loading scripts from a CDN without **Subresource Integrity**.

**Mitigation:**
- Verify package signatures.
- Use **code integrity checks** in CI/CD.
- SRI hashes on third-party scripts. Never deserialise untrusted Java objects. Disable Jackson default typing. Sign artifacts and images.

---

### **9️⃣ A09 Security Logging & Alerting Failures** ( renamed)

**Description:**
Failure to detect, alert, and respond to breaches in time.
**Example:**

- Missing audit trail for failed logins or sensitive actions.
- Logs collected but nobody alerted. Logging passwords, tokens or PII.

**Mitigation:**
- Log key security events.
- Use centralized monitoring (Splunk, ELK).
- Set up alerting for anomalies.  (2025 stresses **alerting**: logs nobody acts on don't help.)
- Never log secrets or PII. Protect logs from tampering. Alerts route to on-call (PagerDuty).

---

### **🔟 A10 Mishandling of Exceptional Conditions** ( new in 2025)

**Description:**
Improper error handling, logic errors and **failing open** when something unexpected happens: missing parameters, null dereferences, uncaught exceptions, error messages leaking internals.
**Example:**

- An authorisation check that throws, gets caught, and lets the request continue (fail-open).
- Stack traces and SQL errors returned to the client.
- A payment step that times out, leaving an inconsistent state with no rollback or compensation.

**Mitigation:**

- **Fail closed**: deny on error.
- A global exception handler (`@RestControllerAdvice` + ProblemDetail) that returns generic messages and logs details with a trace ID.
- Validate inputs and handle missing or extra parameters explicitly. Use transactions and compensations for partial failures.
- Test error paths, not just happy paths.

---

## Interview questions (spoken model answers)

**Q: Which OWASP risks matter most for a React + Spring app?**
"Broken access control first: every endpoint checks authentication **and** ownership server-side, e.g. a user can only read their own favourites. Injection: parameterised queries everywhere, and XSS is mostly handled by React's escaping, but I'm careful with `dangerouslySetInnerHTML` and URLs and add a CSP. Misconfiguration: actuator and debug endpoints locked down, strict CORS, security headers. And supply chain: lockfiles, `npm ci`, dependency and image scanning in the pipeline."

**Q: Show me a SQL injection and the fix.**
"Concatenating input like `\"... WHERE email = '\" + email + \"'\"` lets an attacker send `' OR '1'='1' --` and dump the table. The fix is binding parameters, with `PreparedStatement` placeholders or JPA named parameters, so input is always data. Things you can't bind, like sort columns, get an allowlist."

**Q: What's new in the 2025 list?**
"Software Supply Chain Failures as its own category, reflecting attacks on dependencies and build pipelines. Mishandling of Exceptional Conditions, about failing open and leaking errors. SSRF folded into Broken Access Control. And Security Misconfiguration moved up to #2."

**Q: How do you handle security findings in practice?**
"At EPAM we get Veracode findings, and I've worked on remediating them. I also built AI agent skills that automate much of that prep: triaging findings, creating Jira tickets and opening PRs. Fixes go through normal review and tests." *[keep it to what you actually did]*

**Q: How do you prevent CSRF?**
"For cookie-based sessions: `SameSite=Lax` or `Strict` cookies plus CSRF tokens on state-changing requests (Spring Security does this by default). For pure bearer-token APIs where the browser doesn't attach credentials automatically, CSRF isn't the threat, but XSS becomes the main token-theft risk."

---

## Traps and gotchas
- Quoting the 2021 list as current.
- "We use an ORM so we're safe from SQL injection": not if you concatenate JPQL or native SQL.
- Hiding UI elements as access control.
- `@CrossOrigin("*")` on authenticated endpoints.
- Returning exception messages or stack traces to clients.
- `catch (Exception e) { /* ignore */ }` around security checks means fail-open (A10).
- Logging the `Authorization` header.
