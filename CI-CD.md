# ⚙️ CI/CD Crash Review

![CI/CD Pipeline](CI-CD-Pipeline.png)



## 🔹 CI (Continuous Integration)
**Goal:** ensure code is **always tested, merged, and integrated** safely.

**Key Practices:**
- Developers push code frequently (small commits).
- Automated **build + test pipeline** runs on every push/merge.
- Tools: **GitHub Actions, Jenkins, GitLab CI, CircleCI**.
- Typical stages:
  1. Linting (style checks, e.g., ESLint, Prettier).
  2. Unit tests (Jest, JUnit).
  3. API/Integration tests (Supertest, Cucumber).
  4. Build artifacts (Angular dist, Docker image).

👉 Vanguard context: Angular (frontend build), Node BFF (unit + API tests), Java (microservices) — all tested automatically.

---

## 🔹 CD (Continuous Delivery / Deployment)
**Goal:** deliver tested code to **production-like environments** quickly & reliably.

**Two flavors:**
- **Continuous Delivery**: pipeline deploys to **staging automatically**, but production requires a manual approval.
- **Continuous Deployment**: pipeline deploys to **production automatically** if all tests pass.

**Pipeline stages (AWS focus):**
1. Build Docker image / Lambda package.
2. Run automated tests.
3. Deploy to:
   - **AWS EKS (Kubernetes)** for microservices.
   - **AWS Lambda (Serverless)** for event-driven APIs.
   - **S3 + CloudFront** for Angular frontend.
4. Post-deploy tests (smoke, health checks).
5. Monitoring hooks (CloudWatch, Splunk alerts).

👉 Vanguard context: modernization is **cloud-native AWS + serverless** → expect **IaC (Infrastructure as Code)** via **Terraform or AWS CDK**, automated pipelines via **AWS CodePipeline or Jenkins**.

---

## 🔹 Best Practices to Mention
- **Shift-left testing:** catch bugs early in CI (unit, lint).
- **Immutable artifacts:** build once, promote same artifact through dev → QA → prod.
- **Blue/Green or Canary deploys:** minimize risk.
- **Secrets management:** no hardcoding; use **AWS Secrets Manager** or **Vault**.
- **Observability in pipeline:** deploy + automatically verify via health check + Splunk logs.

---

## 🔹 CI/CD Example Pipeline (Simplified)
**Step 1:** Developer merges PR → GitHub Actions pipeline triggers.  
**Step 2:** Run `npm test` for Angular + Node, `mvn test` for Java microservices.  
**Step 3:** Build Docker image → push to ECR (Elastic Container Registry).  
**Step 4:** Deploy via Helm chart to EKS or via Serverless Framework to Lambda.  
**Step 5:** Run smoke tests (e.g., `cucumber-js --tags @smoke`).  
**Step 6:** Notify Slack/MS Teams → Ops sign-off for prod (if Delivery model).  

---

# 📝 CI/CD Interview Questions with Complete Answers

## 🔹 What is CI (Continuous Integration)?
**Answer:**  
Continuous Integration is the practice where developers merge code changes frequently into a shared repository. Each change triggers an automated build and test pipeline. The goal is to detect integration issues early and ensure that the software is always in a deployable state.

Key practices:
- Frequent commits to main branch.
- Automated builds (compile, package).
- Automated testing (unit, integration).
- Immediate feedback to developers.

---

## 🔹 What is CD (Continuous Delivery vs Continuous Deployment)?
**Answer:**  
- **Continuous Delivery**: Every change is automatically tested and prepared for release. Deployment to production requires manual approval.  
- **Continuous Deployment**: Every change that passes all tests is automatically deployed to production, without manual steps.

Both aim to reduce release risk and deliver value faster.

---

## 🔹 What is the difference between CI and CD?
**Answer:**  
- **CI** = integrating code frequently, with automated builds and tests to ensure code quality.  
- **CD** = delivering tested code to production (or production-like environments) in an automated, repeatable, and safe way.  
CI is about **code integration**, CD is about **code delivery**.

---

## 🔹 How do you ensure safe deployments?
**Answer:**  
- **Blue/Green deployments**: Run two environments, switch traffic when new version is stable.  
- **Canary releases**: Gradually roll out new version to a subset of users, monitor, then expand.  
- **Feature flags**: Decouple feature release from deployment, allowing controlled rollout.  
- **Monitoring and alerts**: Use CloudWatch, Splunk, Datadog to catch issues early.  
- **Automated rollback**: Roll back to last known good artifact if errors exceed thresholds.

---

## 🔹 How do you handle rollbacks?
**Answer:**  
- Maintain **immutable artifacts**: Build once, promote same artifact across environments.  
- Use **versioned deployments** (Docker images, Helm charts, Lambda versions).  
- Keep infrastructure versioned (Terraform, CloudFormation).  
- Automate rollback by redeploying last known good version or redirecting traffic (Blue/Green).

---

## 🔹 How do you integrate testing into CI/CD?
**Answer:**  
- **Unit tests**: Validate individual functions/classes (fast, run on every commit).  
- **Integration tests**: Verify APIs, DB connections, external services.  
- **Acceptance/BDD tests**: Cucumber/Postman/Newman, validate business flows.  
- **Performance tests**: Load testing (k6, JMeter).  
- **Security scans**: SAST/DAST, dependency scans.  
- Arrange in a pyramid → fast tests early, heavier tests later.

---

## 🔹 How do you manage secrets in CI/CD pipelines?
**Answer:**  
- Never commit secrets in code or configs.  
- Use **Secrets Manager** (AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets).  
- Inject secrets at runtime via environment variables.  
- Restrict access with least privilege.  
- Rotate secrets automatically.  
- Ensure audit logging for secret usage.

---

## 🔹 How would you implement CI/CD for AWS Lambda (Serverless)?
**Answer:**  
1. Developer commits code.  
2. CI pipeline builds artifact (zip, container image).  
3. Run unit and integration tests locally and in CI.  
4. Deploy via **AWS SAM, Serverless Framework, or CDK**.  
5. Run post-deploy smoke tests.  
6. Monitor logs (CloudWatch) and alerts (Splunk).  
7. Rollback with previous Lambda version if needed.

---

## 🔹 What tools are commonly used for CI/CD?
**Answer:**  
- **CI/CD engines**: Jenkins, GitHub Actions, GitLab CI, CircleCI, AWS CodePipeline.  
- **Build tools**: Maven, Gradle, npm.  
- **Testing tools**: JUnit, Jest, Mocha, Cucumber.  
- **Infrastructure as Code**: Terraform, AWS CloudFormation, AWS CDK.  
- **Container orchestration**: Docker, Kubernetes (EKS).  
- **Monitoring/Logs**: Splunk, Datadog, CloudWatch.

---

## 🔹 What are the benefits of CI/CD?
**Answer:**  
- Faster delivery of features.  
- Reduced integration problems.  
- Early detection of defects.  
- Consistent, repeatable deployments.  
- Higher confidence in releases.  
- Enables agile & DevOps culture.

---

## 🔹 Frequent Interview Questions

### Q: What is “build once, deploy everywhere”?  
**Answer:** Build an artifact once (e.g., Docker image), and promote it across Dev, QA, Staging, and Prod. Avoid rebuilding for each environment to ensure consistency.

### Q: How do you achieve zero-downtime deployments?  
**Answer:** Using Blue/Green or Canary deployments, combined with load balancers (ALB/NGINX). Traffic gradually shifts, ensuring no downtime.

### Q: How do you monitor CI/CD pipelines?  
**Answer:** Use pipeline dashboards (Jenkins, GitHub Actions), notifications (Slack/MS Teams), and observability tools (CloudWatch, Splunk) for build failures, test coverage, and deployment metrics.

### Q: How do you secure CI/CD pipelines?  
**Answer:** Restrict who can trigger deployments, use signed commits, scan for vulnerabilities (Snyk, OWASP Dependency Check), encrypt secrets, and ensure audit trails.

### Q: What challenges have you faced in CI/CD?  
**Answer:** Examples: flaky tests causing false negatives, long build times, secrets mismanagement, rollback difficulties. Solutions: stabilize tests, parallelize builds, implement proper secret stores, and automate rollbacks.

---

# 🎯 Key Phrases for the Interview
- "CI/CD enforces **automation, repeatability, and confidence** in releases."  
- "We follow a **build once, promote everywhere** strategy."  
- "We use **feature flags** to separate deployment from release."  
- "Our pipelines integrate **quality gates**: tests, security scans, code coverage."  
- "We ensure **observability** at every stage: metrics, logs, and alerts."  
