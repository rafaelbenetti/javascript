# ☁️ AWS Prep Guide

> Group 3 · Priority HIGH
> Deep dive with every JD service: `aws-fullstack-services.md`

## Say it in 1 minute
"For a React and Spring Boot product on AWS I would put the React build in S3 behind CloudFront. The API is a Docker image in ECR on ECS Fargate behind a load balancer. Elastic Beanstalk is the simpler path when the app fits it. Aurora MySQL holds the data in private subnets. Async work fans out from SNS into SQS, each queue with a dead-letter queue, and Lambda handles the short event-driven jobs. Secrets sit in Secrets Manager, and every task gets a least-privilege role. CloudWatch, New Relic, and Splunk are the observability the role asks about. My production cloud at EPAM is GCP, and the AWS service I have used directly is S3, on Benwer Cars. Containers, managed databases, queues, a CDN, and IAM all map across."

> **Honesty rule:** only name GCP services you really used at EPAM. Say "on GCP we used the equivalent" without inventing specifics.

---

## 🔹 1. Compute

### **EC2 (Elastic Compute Cloud)**
- **What it is**: Virtual servers in the cloud.
- **Use cases**: Lift-and-shift legacy apps, custom workloads needing full OS control.
- **Interview note**: you manage OS patching and scaling (Auto Scaling Groups). For new services, managed options (ECS Fargate, Beanstalk, Lambda) usually win on ops effort. That's not because EC2 is "bad".

### **Lambda (Serverless Functions)**
- **What it is**: Run code without managing servers.
- **Use cases**: Event-driven apps, APIs behind API Gateway, **SQS/SNS/S3 event processing** (e.g. thumbnail or video-transcode trigger on S3 upload), scheduled jobs (EventBridge).
- **Key limits**: 15 min runtime, cold start issues (optimize via provisioned concurrency). Java cold starts are heavier: use **SnapStart** (Java), keep the package small, or use GraalVM native. Memory 128 MB–10 GB (CPU scales with memory). Concurrency limits. Use RDS Proxy when connecting to Aurora.
- **Lambda for short, spiky, event-driven work. Long-running Spring Boot APIs fit containers better.**

### **ECS (Elastic Container Service) + ECR (Elastic Container Registry)**
- **ECR**: private Docker registry. Jenkins pushes images tagged with the git SHA, and ECR can scan them for vulnerabilities.
- **ECS**: AWS's container orchestrator. **Task definition** (image, CPU/memory, env, secrets, ports, IAM task role) → **service** (desired count, rolling or blue/green deploys, auto scaling) on **Fargate** (serverless, no instances) or EC2 capacity. Sits behind an **ALB** with health checks (Spring Actuator `/actuator/health`).

### **Elastic Beanstalk**
- PaaS: upload a jar or Docker image and Beanstalk provisions EC2, ASG, load balancer, scaling, health and logs. It's fast to start, with less control. Deployment policies: all at once, rolling, rolling with additional batch, immutable, traffic splitting (canary).

### **EKS (Elastic Kubernetes Service)** *(Vanguard-era; not in this JD)*
- **What it is**: Managed Kubernetes.
- **Tradeoff**: more powerful and portable than ECS, but more complex. ECS is simpler when you're all-in on AWS.

---

## 🔹 2. Storage

### **S3 (Simple Storage Service)**
- **What it is**: Object storage (virtually unlimited). **11 nines durability.**
- **Use cases**: Static website hosting ( **React builds**), file uploads, data lake,  media/video assets.
- **Features**: Versioning, lifecycle policies, encryption (SSE-S3/KMS). Block Public Access on by default, so serve through **CloudFront with Origin Access Control (OAC)**, not a public bucket. **Pre-signed URLs** for direct browser uploads and downloads (I used S3 on Benwer Cars **[describe exactly how: e.g. uploads via pre-signed URLs, only if true]**).
-  Context: frontend builds hosted in S3 + CloudFront.

### **Aurora MySQL (RDS)**
- MySQL-compatible managed DB: storage replicated **6 ways across 3 AZs**, writer endpoint plus reader endpoint (up to 15 replicas), fast failover, Serverless v2 auto-scaling. → `../1-java-spring-backend/mysql-aurora-sql-performance.md`

### **DynamoDB** *(Vanguard-era; not in this JD)*
- NoSQL key-value/document. Design for access patterns (partition key, GSIs), avoid hot partitions.

---

## 🔹 3. Streaming & Messaging

### **SQS (Simple Queue Service)**
- A queue: producers send, **consumers poll** (long polling). Each message is processed by one consumer. **Visibility timeout** hides a message while it's being processed, and if it isn't deleted in time, it reappears (**at-least-once**, so handlers must be **idempotent**). **DLQ** after N failed receives (`maxReceiveCount`).
- **Standard** (very high throughput, best-effort order, possible duplicates) vs **FIFO** (ordering per message group, exactly-once processing within a 5-minute dedupe window, lower throughput).

### **SNS (Simple Notification Service)**
- Pub/sub: one message **pushed** to many subscribers (SQS, Lambda, HTTP, email/SMS/mobile push). No persistence of its own.
- **SNS → multiple SQS queues (fan-out)**: each consumer service gets its own durable queue. Message filtering policies per subscription.

### **Kinesis / Firehose** *(Vanguard-era)*
- Kinesis = ordered, replayable shards, the closest AWS-native analogue to **Kafka** (or use MSK, managed Kafka). Firehose = managed delivery to S3/Redshift/Splunk.
- **Bridge:** "At EPAM I worked with Kafka on call (consumer lag, partitions, offsets). Kafka/Kinesis is a replayable log. SQS is a work queue with deletes. SNS is push fan-out."

---

## 🔹 4. Monitoring & Observability

### **CloudWatch**
- **Metrics**: CPU, Lambda duration,  ECS service CPU/memory, ALB 5xx/latency, SQS `ApproximateAgeOfOldestMessage`, Aurora connections.
- **Logs**: Centralized log collection.
- **Alarms**: Trigger notifications or auto-scaling.

### **Splunk** (external, but often integrated)
- Used for log search, dashboards, security analytics.

### **New Relic**
- APM: transactions, slow SQL, distributed tracing, errors inbox, alerts. Java agent attaches to the Spring Boot JVM. → `observability-newrelic-splunk.md`

---

## 🔹 5. Other Common AWS Services

- **API Gateway**: Expose REST/GraphQL APIs; integrates with Lambda/ALB/ECS.
- **RDS (Relational Database Service)**: Managed SQL databases (Postgres, MySQL, Oracle). **Aurora** is the high-availability variant used in this JD.
- **SNS/SQS**: Messaging → pub/sub or queue-based async comms.  (see section 3)
- **CloudFormation / CDK / Terraform**: Infrastructure as Code.
- **CloudFront**: CDN with edge caching, TLS, compression, WAF, OAC to S3, path-based behaviours (`/api/*` → ALB, `/*` → S3), invalidations, signed URLs/cookies for protected media.
- **IAM**: roles over keys. **ECS task role** = what the app can call. **Task execution role** = pulling from ECR and reading secrets. Least privilege.
- **Secrets Manager / SSM Parameter Store**: DB passwords and API keys injected into ECS tasks, with rotation.
- **VPC**: public subnets (ALB) and private subnets (ECS tasks, Aurora). Security groups allow ALB → tasks → DB only.
- **Route 53** (DNS), **ACM** (TLS certificates), **WAF** (rate limiting, OWASP rules), **ElastiCache** (Redis), **MediaConvert / IVS** (video, nice-to-have).

---

# 🔄 Use-Case Scenarios

### 1. **Web app deployment**
- React on **S3 + CloudFront** (hashed assets cached for a year, `index.html` no-cache, invalidation on deploy).
- Spring Boot in Docker → **ECR** → **ECS Fargate** behind an **ALB** (`/api/*` routed by CloudFront to the ALB).
- **Aurora MySQL** in private subnets, credentials from Secrets Manager.
- Jenkins pipeline builds, tests, pushes to ECR and updates the ECS service (rolling or blue/green).

### 2. **Async processing (e.g. a lesson video uploaded)**
- Browser uploads with an S3 pre-signed URL → S3 event → **SNS topic "media-uploaded"** → SQS queues for (a) the transcoding worker (ECS or MediaConvert job), (b) the search-indexing service, (c) notifications (Lambda).
- Each queue has a DLQ plus alarms on age of oldest message. Handlers are idempotent.


---

# 📝 Frequent AWS Interview Questions

### Q1.  ECS vs Lambda vs Elastic Beanstalk vs EC2: when do you use each?
- **ECS/Fargate**: containerised, long-running services (Spring Boot APIs) with full control of the runtime, no servers to manage.
- **Lambda**: short (<15 min), event-driven, spiky work. Pay per invocation.
- **Elastic Beanstalk**: quickest path for a standard web app when you accept its conventions.
- **EC2**: full OS control, legacy or special workloads.

### Q2.  How do you design a React + Spring Boot web app on AWS?
- **Frontend**: React on **S3 + CloudFront**.
- **Backend**: Spring Boot containers on **ECS Fargate** behind an **ALB** (or Beanstalk).
- **Data**: **Aurora MySQL** (+ ElastiCache if needed).
- **Async**: **SNS → SQS**, Lambda workers.
- **Auth**: Cognito or the company's IdP (OIDC/JWT validated by Spring Security).
- **Monitoring**: CloudWatch + New Relic APM + Splunk logs.

### Q3.  SQS vs SNS vs Kafka/Kinesis?
- **SQS**: queue, pull, one consumer per message, visibility timeout, DLQ.
- **SNS**: pub/sub push fan-out, often into SQS.
- **Kafka/Kinesis**: durable ordered log, multiple consumer groups, replay.

### Q4.  How do you make it highly available?
- Multi-AZ everything: ECS tasks across AZs behind the ALB, Aurora with replicas in other AZs (automatic failover), CloudFront at the edge. Health checks plus auto scaling. Stateless services (sessions in tokens or Redis).

### Q5. What monitoring setup would you propose?
- **CloudWatch Alarms** on  ALB 5xx and latency, ECS CPU/memory, SQS queue age, DLQ depth, Aurora CPU and connections.
- **Splunk dashboards** for logs + audit trails. **New Relic** APM for traces and slow transactions.
- Alerts integrated with Slack/MS Teams  / PagerDuty (I'm on PagerDuty on-call at EPAM).

### Q6. How do you secure AWS workloads?
- IAM least privilege  (task roles, no long-lived access keys).
- Encrypt data at rest (KMS) and in transit (TLS).
- VPC for isolation ( private subnets for ECS tasks and Aurora).
- Secrets in **AWS Secrets Manager**, not in code.
- WAF on CloudFront/ALB, S3 Block Public Access + OAC, ECR image scanning, CloudTrail audit logs.

### Q7. "Have you used AWS in production?" (honest bridge)
"My production cloud at EPAM is GCP, where I work with **[the GCP services you actually used]**. On Benwer Cars I used S3 directly **[how]**. AWS concepts map closely: containers and registries, managed relational databases, pub/sub and queues, CDN, IAM. I'm confident ramping up quickly, and I'd lean on IaC and the team's existing patterns."

---

# 🎯 Key Interview Phrases
-  "React on **S3 + CloudFront**, Spring Boot on **ECS Fargate** from **ECR**, data in **Aurora MySQL**."
-  "**SNS fan-out to SQS** for decoupled async work, with DLQs and idempotent consumers."
- "We always follow **Well-Architected Framework** principles: security, cost optimization, performance."  (6 pillars: operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability)
-  "Monitoring with **CloudWatch + New Relic + Splunk** ensures observability and proactive alerts."

---

## Traps and gotchas
- Public S3 buckets for the website. Use CloudFront + OAC.
- Forgetting the CloudFront invalidation, or caching `index.html` forever, so users get stale apps.
- Lambda + Aurora without RDS Proxy causes connection storms.
- Non-idempotent SQS consumers process duplicates twice.
- Visibility timeout shorter than processing time causes duplicate processing.
- Long-lived IAM access keys in env vars or Git. Use roles.
- Claiming AWS production experience you don't have. Use the bridge answer.
