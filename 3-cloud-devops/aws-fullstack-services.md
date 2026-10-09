# AWS for a Fullstack Java + React Engineer: the JD services in depth

> Group 3 · Priority HIGH · Prep guide Q21–22 · Status: new file
> JD services: **CloudFront, S3, Elastic Beanstalk, ECS/ECR, Lambda, SQS, SNS, Aurora (MySQL)**. Companion summary: `aws.md`.

## Honesty first (read before answering any AWS question)
- **Real:** production cloud at EPAM is **GCP**. **S3** used directly on Benwer Cars. Docker (Benwer Cars). Jenkins pipelines. Kafka on call at EPAM.
- **Not real (so don't claim it):** running ECS, Beanstalk, SQS/SNS or Aurora in production.
- **The formula:** *concept → how I'd do it on AWS → what I've done that's equivalent.* "I haven't run X in production. On GCP we used **[real service]**, and on AWS I'd do it with X like this…"

### GCP ↔ AWS bridge (general equivalents; only claim the ones you used)
| Need | GCP | AWS |
|---|---|---|
| Object storage | Cloud Storage | S3 |
| CDN | Cloud CDN | CloudFront |
| Containers (serverless) | Cloud Run | ECS on Fargate (or App Runner) |
| Kubernetes | GKE | EKS |
| PaaS | App Engine | Elastic Beanstalk |
| Functions | Cloud Functions / Cloud Run functions | Lambda |
| Pub/sub + queues | Pub/Sub | SNS + SQS (also EventBridge) |
| Managed Kafka | (Confluent / self-managed) | MSK |
| Managed MySQL | Cloud SQL / AlloyDB (Postgres) | RDS / Aurora |
| Registry | Artifact Registry | ECR |
| Secrets | Secret Manager | Secrets Manager / SSM Parameter Store |
| Logs and metrics | Cloud Logging / Monitoring | CloudWatch |
| IAM | IAM + service accounts | IAM roles (task roles) |

## Say it in 1 minute
"The picture I draw is one reference architecture. React is built to S3 and served by CloudFront. Spring Boot images go from ECR onto ECS Fargate behind an application load balancer. Aurora MySQL sits in private subnets, and the tasks reach it through security groups. Async work goes from SNS into SQS, each queue with a dead-letter queue, and the small event handlers run in Lambda. Secrets come from Secrets Manager through the IAM task role, so there is no long-lived key baked into the image. The layout is multi-AZ. Jenkins is what deploys it, and CloudWatch, New Relic, and Splunk are how you see it once it is running. My production cloud is GCP, so I map from the concepts I have operated, containers, managed SQL, and messaging, rather than from an AWS account I have not run. The AWS service I have used directly is S3."

---

## 1. CloudFront (CDN)
- Global edge network caching content close to users. TLS (ACM cert in us-east-1), HTTP/2 and HTTP/3, Brotli/gzip compression, **WAF** integration, DDoS protection (Shield Standard).
- **Origins**: S3 (via **Origin Access Control**, so the bucket stays private), ALB, any HTTP origin. **Behaviours** route by path: `/api/*` → ALB (no caching, forward auth headers), `/static/*` → S3 (long cache), default → S3 `index.html`.
- **Cache policy** decides the cache key (which headers, cookies or query strings) and TTLs. The origin request policy is what gets forwarded.
- **SPA routing**: custom error response 403/404 → `/index.html` with 200 (or a CloudFront Function rewrite).
- **Deploys**: hashed assets (`main.3f9a.js`, `max-age=31536000, immutable`) plus `index.html` with `no-cache`, so an **invalidation** of `/index.html` is all you need.
- **Protected media**: signed URLs or signed cookies (paid lessons/videos). **CloudFront Functions** (lightweight header rewrites) vs **Lambda@Edge** (heavier logic).
- **Q:** *"How do you deploy the React app?"* "Build in Jenkins, sync hashed assets to S3, upload `index.html` with no-cache, invalidate it in CloudFront. Rollback means re-uploading the previous build's `index.html`, since old hashed assets are still there."

## 2. S3
- Buckets of objects, 11 nines durability. Storage classes: Standard → Intelligent-Tiering → Standard-IA → Glacier tiers (lifecycle rules for old media).
- **Security**: Block Public Access (on by default), bucket policies, SSE-S3 (default) or SSE-KMS encryption, versioning + MFA delete, access logs.
- **Pre-signed URLs**: the backend (Spring with AWS SDK v2 `S3Presigner`) signs a short-lived PUT/GET URL, and the browser uploads directly, so large files never pass through the API. For big files use multipart upload.
- **Events**: object created → SNS/SQS/Lambda/EventBridge (thumbnailing, transcoding, virus scan).
- Strong read-after-write consistency for all operations (since Dec 2020).
- **Bridge:** "I used S3 on Benwer Cars **[exactly how, e.g. vehicle photo uploads; only if true]**."

## 3. Elastic Beanstalk
- PaaS over EC2 + ASG + ELB. Platforms: Corretto (Java jar), Docker, Node, etc. You give it an artifact plus `.ebextensions`/`.platform` config, and it handles provisioning, scaling, health and log rotation.
- **Deployment policies**: All at once (downtime) · Rolling · Rolling with additional batch (keeps capacity) · **Immutable** (new ASG, safest) · **Traffic splitting** (canary) · blue/green via environment URL swap.
- Good for: a quick standard Spring Boot deployment. Limits: less control, and some opinionated magic. Teams often migrate to ECS as they grow.
- **Q:** *"Beanstalk or ECS?"* "Beanstalk for a simple app where speed matters more than control. ECS when we want container-native deploys, many services, sidecars, fine-grained scaling and IaC-defined task definitions."

## 4. ECS + ECR
```text
Jenkins → docker build → push 123456789.dkr.ecr.eu-west-1.amazonaws.com/listing-api:<git-sha> → ECS service update
```
- **ECR**: private registry, IAM-authenticated (`aws ecr get-login-password`), image scanning (basic or Inspector enhanced), lifecycle policies to expire old images, immutable tags.
- **Task definition**: image, CPU/memory, port mappings, env vars, **secrets** (from Secrets Manager/SSM), log driver (awslogs/FireLens → Splunk/New Relic), health check, **task role** (app permissions) + **execution role** (pull image, read secrets).
- **Service**: desired count, spread across AZs, ALB target group, **rolling update** (`minimumHealthyPercent`/`maximumPercent`) with the **deployment circuit breaker** (auto-rollback on failed deploys) or **blue/green** (CodeDeploy, or ECS native blue/green). **Service auto scaling** on CPU, memory or ALB requests per target, or on SQS backlog per task for workers.
- **Fargate vs EC2 launch type**: Fargate has no instances to patch and costs per vCPU/GB-second. EC2 gives more control, GPUs and possibly lower cost at scale.
- **Spring Boot on ECS**: health check on `/actuator/health/readiness`, graceful shutdown (`server.shutdown=graceful` + ECS `stopTimeout`), JVM memory sized to the container (`-XX:MaxRAMPercentage=75`), structured logs to stdout.
- **Q:** *"Walk me through deploying a Spring Boot service to ECS."* "Jenkins runs tests and builds a multi-stage Docker image, pushes it to ECR tagged with the commit SHA, registers a new task-definition revision with that image, and updates the ECS service. ECS starts new tasks, waits for ALB health checks to pass, then drains the old ones. The circuit breaker rolls back if new tasks keep failing. Then smoke tests and New Relic or CloudWatch alarms are watched."

## 5. Lambda
- Event-driven functions: triggers from API Gateway/ALB, S3, SQS (poller with batching, partial batch failure via `ReportBatchItemFailures`), SNS, EventBridge schedules, DynamoDB/Kinesis streams.
- Limits: **15 min max**, memory 128 MB–10 GB (CPU proportional), `/tmp` up to 10 GB, payload 6 MB synchronous.
- **Cold starts**: worse for Java. Mitigate with **SnapStart** (snapshot of the initialised JVM), provisioned concurrency, smaller dependencies, or GraalVM native image. Keep SDK clients outside the handler for reuse.
- Concurrency: account limit, reserved concurrency to protect downstream (e.g. Aurora). Use **RDS Proxy** for DB connections.
- Good for: S3 thumbnails, SQS consumers with spiky load, cron jobs, webhooks. Not for: long-running or steady high-throughput APIs (containers are cheaper and simpler there).

## 6. SQS and SNS
| | SQS | SNS |
|---|---|---|
| Model | Queue (point-to-point), consumers **poll** | Pub/sub topic, **pushes** to subscribers |
| Delivery | At-least-once (Standard), exactly-once processing (FIFO) | At-least-once push. Retries per protocol |
| Persistence | Up to 14 days (default 4) | None (deliver or fail, DLQ per subscription) |
| Consumers | Each message goes to one consumer | Every subscriber gets a copy |
| Typical | Work queues, buffering, smoothing load | Fan-out, notifications |

- **SQS details**: visibility timeout (set above processing time; extend for long jobs), long polling (`WaitTimeSeconds=20`), batch of up to 10, **DLQ** via redrive policy (`maxReceiveCount`) plus redrive back to source after a fix, delay queues, max message size 1 MiB (raised from 256 KB in 2025; use the S3 claim-check pattern for bigger payloads).
- **FIFO**: `MessageGroupId` orders messages within a group, and the dedupe ID removes duplicates within 5 minutes. Throughput is lower (high-throughput mode is available).
- **SNS details**: subscriptions (SQS, Lambda, HTTPS, email, SMS, mobile push), **filter policies** (subscriber gets only `eventType = "VIDEO_UPLOADED"`), FIFO topics into FIFO queues.
- **Fan-out pattern**: `SNS topic → SQS (search-indexer) + SQS (notifier) + SQS (analytics)`. Each service scales and fails independently.
- **Spring**: Spring Cloud AWS (`@SqsListener`, `SqsTemplate`, `SnsTemplate`) or AWS SDK v2.
- **Kafka bridge (real experience):** "Kafka is a partitioned, replayable log. Consumers track offsets, and I've debugged consumer lag and partition issues on call at EPAM. SQS is simpler: messages are deleted after processing, with no replay, and scaling is automatic. The equivalent of Kafka lag in SQS is `ApproximateAgeOfOldestMessage` and queue depth, which I'd alarm on, plus DLQ depth."
- **Q:** *"How do you make consumers reliable?"* "Idempotent handlers (dedupe table keyed by message ID or business key, or upserts), visibility timeout above processing time, DLQ with alarms and a redrive procedure, batch partial failures, and an outbox pattern on the producer side so 'save to DB and publish' can't half-happen."

## 7. Aurora MySQL
- Storage layer: **6 copies across 3 AZs**, self-healing, grows automatically up to 128 TiB. Compute instances: 1 writer + up to **15 readers** (millisecond replica lag), automatic failover (usually under ~30 s).
- **Endpoints**: cluster (writer), reader (load-balanced across replicas), custom, instance. Spring: write DataSource → cluster endpoint, read-only DataSource → reader endpoint (or the AWS Advanced JDBC Wrapper for fast failover and read/write splitting).
- **Serverless v2** (scales in ACUs, good for variable load), **Global Database** (cross-region DR, about 1 s replication), **backtrack** (MySQL), fast **cloning**, **Performance Insights**, **RDS Proxy** (pooling, faster failover, IAM auth).
- Security: private subnets, security group only from ECS tasks, encryption with KMS, Secrets Manager rotation, IAM DB auth (optional).
- → SQL and indexing: `../1-java-spring-backend/mysql-aurora-sql-performance.md`

## 8. Cross-cutting: IAM, VPC, secrets, IaC
- **IAM**: roles, not users or keys, for workloads. Least-privilege policies (`s3:PutObject` on `arn:aws:s3:::media-bucket/uploads/*` only). Separate task role and execution role.
- **VPC**: public subnets (ALB, NAT), private subnets (ECS, Aurora). Security groups chained (ALB SG → app SG → DB SG). VPC endpoints for S3/ECR/Secrets Manager (no NAT cost, private traffic).
- **Secrets**: Secrets Manager (rotation, cost per secret) vs SSM Parameter Store (cheaper, SecureString). Injected into the ECS task definition `secrets`.
- **IaC**: Terraform, CloudFormation or CDK. All infrastructure changes reviewed in PRs. No click-ops in production.

## 9. Reference design to draw out loud
```text
Users → Route 53 → CloudFront (+WAF)
          ├── /*      → S3 (React build, OAC)
          └── /api/*  → ALB → ECS Fargate (Spring Boot, ≥2 tasks, multi-AZ) → Aurora MySQL (writer + readers)
                                     │                                   ↘ ElastiCache (optional)
                                     └── publish → SNS → SQS queues → workers (ECS / Lambda) ; DLQs
Observability: CloudWatch metrics/alarms · New Relic APM (Java agent) · logs → Splunk · PagerDuty
CI/CD: Jenkins → tests + coverage gate → Docker → ECR → ECS deploy (rolling/blue-green) ; S3 sync + CF invalidation
```

---

## 10. Interview questions (spoken model answers)

**Q: Have you worked with AWS?**
"Honestly, my production cloud at EPAM is GCP. On my own product, Benwer Cars, I used S3 directly **[how]**. I know the AWS equivalents and how I'd design with them: S3 and CloudFront for the front end, ECS Fargate with ECR for Spring Boot, Aurora, SNS and SQS. The concepts I've operated in production, like containers, managed SQL, messaging with Kafka and on-call observability, carry over directly."

**Q: How would you deploy a React + Spring Boot app on AWS?** → the reference design in section 9. Mention multi-AZ, private subnets, secrets, health checks, rollback and alarms.

**Q: SNS vs SQS? When both?** → table in section 6. "Both when one event has several independent consumers: SNS fans out to one SQS queue per consumer, giving each its own buffering, retries and DLQ."

**Q: Lambda or ECS for the Spring Boot API?** "ECS. A Spring Boot API is long-running and benefits from warm JVMs and connection pools, and steady traffic is cheaper on containers. Lambda for event-driven side jobs: S3 triggers, scheduled tasks, spiky queue consumers. If Lambda with Java, I'd use SnapStart for cold starts."

**Q: How does CloudFront caching work with deployments?** → section 1: hashed assets cached long, `index.html` no-cache plus invalidation.

**Q: How do you scale a queue worker?** "ECS service auto scaling on backlog per task (queue depth ÷ tasks), or Lambda's SQS poller, which scales automatically, with reserved concurrency to protect the DB."

**Q: Aurora failover: what does the app need to do?** "Use the cluster endpoint and DNS with a short TTL, retry transient connection errors, and keep the connection pool validated. The AWS JDBC wrapper or RDS Proxy shortens failover. Reads go to the reader endpoint, but read-your-own-writes stays on the writer."

---

## 11. Traps and gotchas
- Claiming production AWS experience you don't have. Interviewers probe one level deeper.
- Public S3 bucket website hosting instead of CloudFront + OAC.
- SQS visibility timeout shorter than processing time causes duplicates.
- Forgetting DLQs and alarms means silent message loss or poison-pill loops.
- Lambda → Aurora without RDS Proxy causes connection exhaustion.
- Java Lambda cold starts without SnapStart.
- Hard-coded AWS keys. Use IAM roles everywhere.
- Single-AZ anything in production.
- Caching authenticated API responses at CloudFront.
