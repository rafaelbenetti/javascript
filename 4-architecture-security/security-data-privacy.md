# Security and Data Privacy for a Fullstack (React + Spring) Engineer

> Group 4 · Priority LOW–MEDIUM · JD: "security and data privacy" · Status: new file
> Related: `owasp.md` (2025), `jwt.md`, `storage-security.md`

## Say it in 1 minute
"I treat security as part of done. Authentication uses a proven identity provider, and every request is authorised on the server, including ownership. Input is validated, queries are parameterised, and XSS is handled by React escaping plus a Content Security Policy. TLS is everywhere, data is encrypted at rest, and secrets live in a secrets manager. The pipeline scans dependencies and code. At EPAM that is Veracode, and I have remediated findings and built agent skills that help with triage. GDPR is the same discipline for personal data: collect the minimum, know where it flows, keep it out of logs and analytics, honour deletion and access, and set retention. A learning or media product across regions also needs consent before tracking, and extra care if minors can be users."

---

## 1. Secure SDLC (how security fits the day-to-day)
| Phase | Practice |
|---|---|
| Plan/design | Threat modelling (STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation of privilege), abuse cases, data classification |
| Code | Secure defaults, input validation, parameterised queries, output encoding, code review checklist |
| Build | SAST (Veracode, Sonar), SCA / dependency scanning, secret scanning (gitleaks), container image scanning, SBOM |
| Test | DAST (OWASP ZAP), auth/authz tests (can user A read user B's data?), security unit tests |
| Deploy | IaC review, least-privilege IAM, WAF, security headers, no debug endpoints |
| Operate | Security logging + alerting, patching SLAs, incident response, pen tests, bug bounty |

## 2. Application security checklist (React + Spring)
**Back end (Spring)**
- Spring Security: `SecurityFilterChain`, OAuth2 resource server (JWT) or session + CSRF. `@PreAuthorize` + **ownership checks** in services.
- Bean Validation on DTOs, size limits on payloads and uploads, allowlists for sort fields and enums.
- Parameterised JPA/JDBC queries, never string-built SQL/JPQL.
- Errors: generic ProblemDetail to clients, details only in logs (OWASP A10).
- Rate limiting (gateway/WAF or Bucket4j), especially on login, OTP and search.
- Secrets from Secrets Manager/SSM. Actuator locked down.
- Dependencies patched. Never deserialise untrusted Java objects.

**Front end (React)**
- Trust nothing on the client: hiding UI isn't authorisation.
- XSS: JSX escapes by default. Avoid `dangerouslySetInnerHTML` (sanitise with DOMPurify if unavoidable), validate URL schemes (`javascript:`).
- **Content Security Policy** (`script-src 'self'` + nonces), `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- No secrets in the bundle (env vars at build time are public). Subresource Integrity for third-party scripts.
- Token handling: HttpOnly cookies or BFF, not localStorage.
- Third-party scripts (analytics, A/B testing tags like Adobe) run with full page access. Load them via a tag manager with governance and consent gating.

**Transport and storage**
- TLS 1.2+ (prefer 1.3), HSTS. Encryption at rest (KMS for S3 and Aurora). Passwords hashed with bcrypt/Argon2. Field-level encryption or tokenisation for highly sensitive data.

## 3. Data privacy: GDPR essentials
- **Personal data** = anything identifying a person directly or indirectly (name, email, IP address, device IDs, location, cookie IDs). **Special category** (health, biometrics, etc.) needs extra protection.
- **Principles (Art. 5):** lawfulness/fairness/transparency, **purpose limitation**, **data minimisation**, accuracy, **storage limitation**, integrity and confidentiality, accountability.
- **Lawful bases (Art. 6):** consent, contract, legal obligation, vital interests, public task, legitimate interests.
- **Data subject rights:** access (export), rectification, **erasure** ("right to be forgotten"), restriction, portability, objection. Respond within one month.
- **Privacy by design and by default (Art. 25)**: privacy-protective defaults, opt-in for non-essential processing.
- **Breach notification**: to the supervisory authority within **72 hours** of becoming aware, and to users if high risk.
- **International transfers**: EU→US relies on the EU–US Data Privacy Framework (2023) or Standard Contractual Clauses.
- **Cookies/tracking (ePrivacy)**: non-essential cookies and analytics/A/B tags need **prior consent** (consent banner, Consent Mode). Reject must be as easy as accept.
- **Children**: GDPR Art. 8 consent age is 13–16 depending on the member state. In the US, COPPA covers under-13s. Relevant for edtech and learning products. US state laws (e.g. CCPA/CPRA in California) add similar rights.
- **Fines**: up to €20M or 4% of global annual turnover.

### Engineering practices for privacy
- **Data map**: which fields are PII, where they're stored (Aurora, Elasticsearch, S3, logs, analytics, backups) and who processes them (vendors = processors with DPAs).
- **Minimise**: don't collect what you don't need. Pseudonymise IDs in analytics (Mixpanel/Adobe) instead of emails.
- **Logs**: mask PII and never log tokens or passwords. Retention policies on logs too.
- **Deletion**: design for erasure across stores (DB, search indexes, caches, S3, third parties). Soft delete plus a hard-delete job, and backups expire on a schedule.
- **Access control**: least privilege for engineers too (production data access audited, masked staging data).
- **Retention**: TTLs and lifecycle rules, and delete when the purpose ends.
- **Export**: an endpoint or job to produce a user's data (access and portability).

## 4. Interview questions (spoken model answers)

**Q: How do you make sure the code you ship is secure?**
"Security is built into the workflow: threat-model features that touch auth or personal data, validate input and parameterise queries, enforce authorisation server-side with ownership checks, and keep secrets in a secrets manager. The pipeline runs SAST and dependency scanning with gates. At EPAM, Veracode findings are part of release prep. I've remediated them and built AI agent skills that automate much of that triage and ticketing. Then security headers and CSP on the front end, and alerting on suspicious activity." *[keep to what you actually did]*

**Q: What does GDPR mean for you as a developer?**
"Collect only what's needed and use it only for its stated purpose. Protect it with encryption and access control. Keep it out of logs and analytics. Make deletion and export possible across every store, including search indexes and backups. Set retention. And don't fire tracking or A/B testing tags before consent. Privacy by design and by default."

**Q: A user asks to delete their account. What happens technically?**
"Verify identity, then run an erasure workflow: delete or anonymise the user's rows in the primary DB, remove them from search indexes like Elasticsearch and from caches, delete their S3 objects, publish a `UserDeleted` event so other services and processors (analytics, email provider) erase too, and let backups age out under the retention policy. Keep only what a legal obligation requires (e.g. invoices). The whole thing is logged for accountability."

**Q: How do you protect PII in logs and analytics?**
"Structured logging with field-level masking, never logging request bodies or auth headers blindly, user IDs instead of emails, short retention on logs, and analytics events reviewed so they carry pseudonymous IDs only."

**Q: How would you handle a suspected data breach?**
"Contain first (revoke keys, block the vector), preserve evidence and logs, assess scope (which data, which users), escalate to security and the DPO immediately, because there's a 72-hour regulator notification window under GDPR. Then fix the root cause and run a blameless postmortem."

## 5. Traps and gotchas
- PII in URLs (it ends up in logs, CDN logs and referrer headers).
- Copying production data into dev or staging unmasked.
- "Deleted" users still in the search index, cache or analytics tool.
- Analytics or A/B scripts loaded before consent.
- Secrets in front-end env vars or Git history (rotate them, because deleting the commit doesn't help).
- Treating hashing as encryption, or encryption as anonymisation (pseudonymised data is still personal data under GDPR).
- Logging full exception messages that contain user data.
