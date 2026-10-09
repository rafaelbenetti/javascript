# 👨‍💻 Team Leader Prep — Technical & Leadership Guide

> Group 5 · Corrected version of the former `other/overview.md` · Sits next to the leadership Q&A, not in the frontend-framework folder
> Legend: **✏️ FIXED** = corrected · **➕ ADDED** = new · unmarked = original
> The 30 people-and-process answers are in [leadership.md](leadership.md). Deeper stacks: [aws.md](../3-cloud-devops/aws.md), [ci-cd.md](../3-cloud-devops/ci-cd.md), [observability-newrelic-splunk.md](../3-cloud-devops/observability-newrelic-splunk.md), [architecture-patterns.md](../4-architecture-security/architecture-patterns.md), [owasp.md](../4-architecture-security/owasp.md)

## What was fixed (changelog)
1. **Branching.** ✏️ Trunk-based development is the model that matches CI/CD: short-lived branches, `main` always releasable, feature flags for unfinished work. GitFlow (long-lived `develop`, release branches, hotfix branches) still fits a product that maintains several released versions. It is not the modern default.
2. **Tests.** ➕ The original list (unit, integration, E2E) is the layers. Added the **test pyramid**, the **testing trophy**, and the ice-cream-cone anti-pattern.
3. **Observability.** ✏️ Named the pillars: **logs, metrics, traces**, with profiles as the optional fourth. **OpenTelemetry** is the instrumentation standard (APIs, SDKs, OTLP), not "a tracing product" next to X-Ray. You still need a backend to store and query.
4. **DORA.** ➕ The four delivery metrics: deployment frequency, lead time for changes, change failure rate, failed deployment recovery time. Measured on the system, never on a person.
5. **AWS list.** ✏️ Kept as general literacy. The services this interview asks about are in [aws.md](../3-cloud-devops/aws.md): CloudFront, S3, Elastic Beanstalk, ECS/ECR, Lambda, SQS/SNS, Aurora. EKS, DynamoDB and Kinesis are the older list. S3's "11 nines" is **durability**, not availability.
6. **Security.** ✏️ OWASP Top 10 **2025** (the 2021 list is what most slides still show). TLS 1.2 is the minimum. Prefer 1.3.
7. **➕ Added** the 30-second summary, six short questions, and traps. No personal story is invented here. The `[confirm]` rows live in [leadership.md](leadership.md).

## ➕ Say it in 30 seconds
"I integrate on trunk: branches live a day or two, main stays green, and a feature flag is how unfinished work reaches production without being released. Tests are a pyramid, many fast unit tests, fewer integration tests, a handful of end-to-end tests, and I would rather have one integration test that boots the real wiring than a hundred tests that mock every neighbor. In production I want logs, metrics and traces on one correlation id, exported with OpenTelemetry, and I page on symptoms (error rate, latency, lag) rather than on CPU. The health of that system is the four DORA numbers: how often we deploy, how long a commit takes to reach production, how often a deploy fails, and how fast we restore. **[confirm the branching model and the pipeline you actually run.]**"

---

## 🔹 Technical Depth

### 🌩️ Cloud-native architecture (AWS focus)

**Core services**

- **EC2**: virtual servers for flexible workloads.
- **S3**: object storage, highly durable (99.999999999%). ✏️ That figure is **durability** (the chance an object is lost), not uptime. Availability is a separate SLO, and it is lower.
- **Lambda**: serverless compute, pay-per-execution. ✏️ A fit for short, event-driven work. A long-running Spring Boot API is usually a container (ECS or Beanstalk), not a function.
- **Kinesis/Firehose**: streaming data ingestion. ✏️ Not in the Applica stack. The queue pair there is SNS → SQS.
- **DynamoDB**: NoSQL database, millisecond latency. ✏️ Not in this JD. The relational store is Aurora MySQL.
- **EKS**: managed Kubernetes service. ✏️ Not in this JD. Containers here are ECS/Fargate or Beanstalk.
- **CloudWatch**: monitoring & observability. ➕ Plus New Relic (APM) and Splunk (logs) on the JD. See [observability-newrelic-splunk.md](../3-cloud-devops/observability-newrelic-splunk.md).

**Patterns**

- **Serverless** (Lambda, DynamoDB, S3) → agile, cost-effective, event-driven. ✏️ S3 stays in the picture either way (static front end behind CloudFront). Lambda is a choice, not a default, for a Spring service.
- **Containerized** (EKS, ECS) → flexibility, portable workloads. ✏️ ECS/Fargate is the one to talk about here.
- **Event-driven** (Kinesis, SNS, SQS) → decoupled systems.
- **Message queues** for resilience (SQS, Kafka on AWS MSK).

**Hands-on exercise:** Deploy a small app using **API Gateway + Lambda + DynamoDB**. ✏️ Useful as a serverless exercise. For this role, the matching exercise is a Spring Boot container on ECS, an Aurora schema, and an SQS consumer. **[confirm which of these you have actually deployed.]**

---

### 🔒 Security & Compliance

- **Auth & Identity:** JWT, OAuth2, OIDC. ➕ Authorization Code + PKCE for a SPA, or a BFF. Access tokens are short-lived. Refresh tokens sit in an HttpOnly cookie. Details in [jwt.md](../4-architecture-security/jwt.md) and [storage-security.md](../4-architecture-security/storage-security.md).
- **OWASP Top 10:** ✏️ the **2025** list. Know injection, broken access control, XSS, SSRF, security misconfiguration, and how you'd test them. The worked examples are in [owasp.md](../4-architecture-security/owasp.md).
- **Encryption:** in transit (TLS 1.2 minimum, prefer 1.3), at rest (KMS).
- **Regulatory basics:** GDPR (EU), SOC2 (US enterprises), HIPAA (healthcare). ➕ GDPR in practice: purpose limitation, a lawful basis, data minimization, and a real erasure path. See [security-data-privacy.md](../4-architecture-security/security-data-privacy.md).

---

### ⚙️ CI/CD & DevOps Practices

**Git branching strategies:**

- **GitFlow** → feature, develop, release, hotfix branches (stable, but heavy). ✏️ The cost is integration delay: `develop` and `main` drift, and the release branch is where conflicts go to hide. It earns its keep when you must patch several versions in the field.
- **Trunk-based** → ✏️ developers integrate into `main` at least daily. A branch that lives for weeks is not trunk-based, even if you call it a feature branch. Unfinished work is hidden behind a **feature flag**, so deploy and release are different events. `main` is always green and deployable. This is the model CI/CD assumes. Direct-to-main and short-lived merge requests are both trunk-based. The rule is the lifetime, not whether a PR exists.

**CI/CD pipelines:**

- GitHub Actions, GitLab CI, Jenkins. ✏️ This JD's pipeline tool is **Jenkins**. The worked Jenkinsfile is in [docker-jenkins-pipeline.md](../3-cloud-devops/docker-jenkins-pipeline.md).
- Automate **build → test → deploy → monitor**.
- ➕ Build the artifact **once** (a Docker image tagged with the git SHA) and promote that same digest through environments.

**Testing:**

- Unit (fast, isolated).
- Integration (API/service interactions).
- E2E (real flows).

➕ **Test pyramid.** Many unit tests at the bottom, fewer integration tests, a small number of end-to-end tests at the top. Cost and brittleness go up as you climb. Feedback speed goes down. The pyramid is a shape, not a rule that integration tests don't matter.

➕ **Testing trophy** (Kent C. Dodds). Static checks (the typechecker, the linter) form the base, then unit tests, then a **wide integration band**, then a few E2E tests. The point: a unit test that mocks every collaborator stays green while the wiring is broken. An integration test that renders the page against MSW, or boots the service against a real database (Testcontainers), catches that for less pain than a hundred browser tests. The trophy does not say "stop writing unit tests". It says the middle layer is where most regressions actually are.

➕ **Ice-cream cone**, the anti-pattern: almost no unit tests, a lot of manual QA and slow E2E. The suite is red for reasons nobody can diagnose, so people rerun it.

**Observability:**

- ✏️ The pillars, in the order you use them during an incident:
  - **Metrics** answer "is it broken, and since when?" They are cheap and aggregated: rate, errors, p95 latency, queue depth. Golden signals: latency, traffic, errors, saturation.
  - **Logs** answer "what exactly happened on this request?" Structured JSON, with a level and a **correlation / trace id**. Not a stack of `console.log`.
  - **Traces** answer "which hop ate the time?" A trace is a tree of spans (browser → API → service → SQL → queue). One trace id ties the log lines to the spans.
  - **Profiles** (optional fourth) answer "which function is hot?" Continuous profiling, or a browser performance trace. Real-user monitoring (Core Web Vitals) is the front-end cousin.
- **OpenTelemetry** is the vendor-neutral way to produce all three: APIs and SDKs in the process, **OTLP** on the wire, a collector in the middle, and an exporter to whatever you pay for. It is not itself a place you query. The backends on this JD are CloudWatch, New Relic and Splunk. X-Ray is the AWS-native tracer. Instrument once, point the exporter at the backend. Spring Boot does this through Micrometer Tracing. Propagate W3C `traceparent` on HTTP and on messages.
- **Monitoring** (CloudWatch, Prometheus) is the metrics half. **Logging** (Splunk, ELK) is the log half. **Tracing** (OpenTelemetry, X-Ray) is the trace half. The original bullets named tools. The pillars are the model. The full walkthrough is [observability-newrelic-splunk.md](../3-cloud-devops/observability-newrelic-splunk.md).
- ➕ Page a human on **symptoms** (error budget burn, p95, consumer lag), with a runbook. A CPU alert with no user impact is how on-call gets ignored.

➕ **DORA metrics** (the four). They describe the delivery system, not a person's performance. Using them in a ranking spreadsheet makes people game the numbers.

| Metric | What it measures | A healthy reading looks like |
|---|---|---|
| **Deployment frequency** | How often production changes | On demand. The top band in the DORA reports is many times a day |
| **Lead time for changes** | Commit → running in production | Under a day for a high performer. The top band is under an hour. A monthly release train is the slow end |
| **Change failure rate** | Share of deploys that need a rollback, hotfix, or patch | The top bands sit around 0–15%. A high rate together with high frequency means you are shipping untested |
| **Failed deployment recovery time** | How long until the user impact is gone (the old "MTTR") | Under a day, and under an hour at the top end, because rollback is boring and practiced |

Later DORA reports also discuss **reliability** (are you meeting the SLOs users feel). That is not a fifth lever you pull instead of the four. Frequency without a low change-failure rate is just faster incidents. The same four are restated in [ci-cd.md](../3-cloud-devops/ci-cd.md) and [leadership.md](leadership.md).

---

### 🏗️ Architecture Patterns

- **Monolith** → simple, fast start, but hard to scale. ✏️ Hard to scale *organizationally* past a point. A well-built monolith scales technically further than people admit.
- **Microservices** → decoupled, scalable, but adds ops complexity. ✏️ You pay in distributed failure, tracing, and data ownership. Not a default.
- **Modular monolith** → structured monolith with clear boundaries, good compromise. ➕ Spring Modulith is the Java way to keep those boundaries testable. See [architecture-patterns.md](../4-architecture-security/architecture-patterns.md).
- **Event-driven design** → async communication with Kafka/Kinesis. ✏️ Or SNS/SQS. The producer does not call the consumer.
- **API-first** → REST or GraphQL contracts before implementation.
- **DDD basics** → bounded contexts, ubiquitous language, aggregates.

---

## 🔹 Leadership & Management

### ⚡ Agile & Delivery

**Scrum:**

- Time-boxed sprints, roles (PO, SM, Devs), ceremonies (planning, review, retro).
- Best for predictable cadence and stakeholder visibility.

**Kanban:**

- Continuous flow, WIP limits, pull-based.
- Best for support/ops teams or when priorities change rapidly.

**Key metrics:** velocity (Scrum), cycle time (Kanban), lead time, throughput.

➕ ✏️ Velocity is a **planning** tool for one team over time. It is not comparable across teams, and it is not a DORA metric. Cycle time (start of work → done) and lead time (request → production) are the flow numbers. DORA lead time starts at the **commit**, which is narrower than product lead time. Don't mix them in one sentence.

---

### 👥 Team Leadership

- **Mentoring:** build up juniors with reviews, pair coding.
- **Conflict resolution:** open communication, empathy, clarity of roles.
- **Delegation vs micromanagement:** trust but verify with reviews and check-ins.
- **Cross-functional collaboration:** foster Dev + QA + Ops synergy.

➕ The spoken answers, and the stories that have to be yours, are in [leadership.md](leadership.md). Fill the `[confirm]` cells before the interview. Nothing in this file is a claim that you ran a particular team.

---

## ➕ Questions worth being able to answer in a minute

### Trunk-based or GitFlow?
Trunk-based, unless the product really ships several supported versions at once. Short branches, main releasable, flags for unfinished work. GitFlow's release branch feels safe and makes integration late, which is when it is expensive. **[Say which one your last team used, not which one sounds modern.]**

### Pyramid or trophy?
Both want few end-to-end tests. The pyramid emphasizes a wide unit base. The trophy emphasizes static types plus integration tests that exercise real wiring, because mocked unit tests miss the bugs users hit. On a React + Spring system that means Jest/RTL with MSW, JUnit with Mockito for pure logic, `@WebMvcTest` and Testcontainers for the edges, and a few Playwright paths. Coverage is a floor. Assertions are the point.

### What are the observability pillars, and where does OpenTelemetry fit?
Logs, metrics, traces. OpenTelemetry is how you emit them without marrying the SDK to New Relic, Splunk or CloudWatch. A trace id in the log line is what makes the three one investigation instead of three tools.

### What are the DORA metrics, and how would you cheat them?
Deployment frequency, lead time for changes, change failure rate, recovery time. Cheating: counting a deploy that only rolled a config, shrinking lead time by starting the clock at the release branch, hiding failures by hot-fixing forward and not calling it a failure, or restoring service by disabling the feature and never fixing it. The point of the four together is that each one catches a cheat on another.

### What do you alert on?
User-facing symptoms and saturation that predicts them: error rate, p95 latency, queue lag, error-budget burn. Not CPU by itself, and not "any ERROR log line", which pages you for expected 404s.

### Monolith or microservices for a new product?
A modular monolith until a boundary has a real reason to move: an independent scaling need, a different runtime, or a team that must deploy on its own. Splitting first means you debug across a network before you understand the domain.

---

## ➕ Traps and gotchas

- Calling a three-week feature branch "trunk-based" because it eventually merges to `main`.
- Treating GitFlow as the professional option and trunk-based as the reckless one. The reckless one is an untested `main`. The flag and the pipeline are what make trunk safe.
- Quoting S3's 11 nines as availability. It is durability.
- "We have observability" because there is a log file. Without metrics you don't know it's broken. Without traces you don't know where. Without a shared id you can't join them.
- Describing OpenTelemetry as a competitor to Splunk. It is the pipe. Splunk is a place the pipe can end.
- Alerting on causes (CPU, a single exception class) instead of symptoms, then wondering why the page fired at 3am for a batch job.
- Using DORA, velocity, or coverage as a leaderboard for individuals. People then split deploys, avoid hard changes, and assert `toBeTruthy()`.
- A test suite that is 95% mocked unit tests and still ships broken joins. That is the gap the trophy is about.
- Confusing DORA lead time (commit → production) with Kanban lead time (ticket opened → done).
