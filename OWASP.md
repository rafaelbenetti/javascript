# 🛡️ OWASP Top 10 (2021)

## 🔹 Quick List

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

---

### **1️⃣ Broken Access Control**

**Description:**  
Users can perform actions or access resources beyond their permissions.  
**Example:**  
A regular user modifies a URL `/admin/delete?id=10` to delete another user’s data.  
**Mitigation:**

- Enforce **server-side authorization checks**.
- Apply **least privilege** and **deny by default** policies.

---

### **2️⃣ Cryptographic Failures**

**Description:**  
Sensitive data exposed due to missing or weak encryption.  
**Example:**  
Passwords stored in plain text or transmitted without HTTPS.  
**Mitigation:**

- Use **TLS 1.2+** for all connections.
- Hash passwords with **bcrypt** or **Argon2**.
- Never hardcode secrets in code or config.

---

### **3️⃣ Injection**

**Description:**  
Untrusted input alters commands or queries.  
**Example:**  
SQL Injection:

```sql
SELECT * FROM users WHERE id = '1 OR 1=1';
```

**Mitigation:**

- Use **parameterized queries** or ORM.
- Validate and sanitize all inputs.

---

### **4️⃣ Insecure Design**

**Description:**  
Missing security controls due to flawed design or architecture.  
**Example:**  
A financial app doesn’t limit transaction frequency → vulnerable to abuse.  
**Mitigation:**

- Perform **threat modeling** early.
- Design using **secure patterns** (e.g., defense in depth).

---

### **5️⃣ Security Misconfiguration**

**Description:**  
Improperly configured systems or frameworks expose vulnerabilities.  
**Example:**

- Default admin credentials still active.
- Open S3 buckets with public access.  
  **Mitigation:**
- Automate secure configurations.
- Disable unused endpoints and features.

---

### **6️⃣ Vulnerable and Outdated Components**

**Description:**  
Using libraries, packages, or dependencies with known vulnerabilities.  
**Example:**

- Unpatched React version with XSS bug.
- Outdated Log4j causing remote code execution.  
  **Mitigation:**
- Regularly update dependencies.
- Use **Snyk**, **Dependabot**, or **OWASP Dependency-Check**.

---

### **7️⃣ Identification and Authentication Failures**

**Description:**  
Weak login, session, or identity management.  
**Example:**

- JWTs without expiration.
- Session IDs in URLs.  
  **Mitigation:**
- Implement **multi-factor authentication (MFA)**.
- Use **secure cookies** (`HttpOnly`, `SameSite`, `Secure`).

---

### **8️⃣ Software and Data Integrity Failures**

**Description:**  
Trusting unverified code or updates; supply-chain attacks.  
**Example:**

- CI/CD pipeline executes unsigned code.
- NPM package replaced with malicious version.  
  **Mitigation:**
- Verify package signatures.
- Use **code integrity checks** in CI/CD.

---

### **9️⃣ Security Logging and Monitoring Failures**

**Description:**  
Failure to detect, alert, and respond to breaches in time.  
**Example:**

- Missing audit trail for failed logins or sensitive actions.  
  **Mitigation:**
- Log key security events.
- Use centralized monitoring (Splunk, ELK).
- Set up alerting for anomalies.

---

### **🔟 Server-Side Request Forgery (SSRF)**

**Description:**  
Server makes unauthorized requests to internal/external systems.  
**Example:**  
User submits URL like `http://169.254.169.254` to steal AWS metadata.  
**Mitigation:**

- Validate and sanitize all URLs.
- Block access to internal IP ranges.
- Enforce network segmentation and allowlists.

---
