# ☁️ AWS Prep Guide (Vanguard Role)

---

## 🔹 1. Compute

### **EC2 (Elastic Compute Cloud)**
- **What it is**: Virtual servers in the cloud.
- **Use cases**: Lift-and-shift legacy apps, custom workloads needing full OS control.
- **Interview note**: Expensive for scaling event-driven workloads (serverless preferred now).

### **Lambda (Serverless Functions)**
- **What it is**: Run code without managing servers.
- **Use cases**: Event-driven apps, APIs behind API Gateway, Kinesis event processing, file triggers from S3.
- **Key limits**: 15 min runtime, cold start issues (optimize via provisioned concurrency).
- **Vanguard context**: Modernization → Lambda is **preferred over EC2**.

### **EKS (Elastic Kubernetes Service)**
- **What it is**: Managed Kubernetes.
- **Use cases**: Microservices that require container orchestration.
- **Tradeoff**: More complex than Lambda; used for enterprise-scale services needing flexibility.
- **Vanguard context**: Legacy workloads moving to microservices.

---

## 🔹 2. Storage

### **S3 (Simple Storage Service)**
- **What it is**: Object storage (virtually unlimited).
- **Use cases**: Static website hosting (Angular builds), file uploads, data lake.
- **Features**: Versioning, lifecycle policies, encryption (SSE-S3/KMS).
- **Vanguard context**: Frontend Angular builds likely hosted in S3 + CloudFront.

### **DynamoDB**
- **What it is**: NoSQL key-value & document database.
- **Use cases**: High-performance apps, user sessions, event storage.
- **Best practices**: Design for access patterns (partition key), use GSIs for queries.
- **Vanguard context**: Rollover product → low-latency operations → DynamoDB.

---

## 🔹 3. Streaming & Messaging

### **Kinesis**
- **What it is**: Real-time data streaming (like Kafka).
- **Use cases**: Ingesting clickstream, logs, financial transactions.
- **Scaling**: Shards determine throughput.

### **Firehose (Kinesis Data Firehose)**
- **What it is**: Managed pipeline for streaming → storage.
- **Use cases**: Deliver streaming data into S3, Redshift, Splunk.
- **Difference**: Kinesis = raw stream; Firehose = auto buffer + delivery.

---

## 🔹 4. Monitoring & Observability

### **CloudWatch**
- **Metrics**: CPU, Lambda duration, DynamoDB throttles.
- **Logs**: Centralized log collection.
- **Alarms**: Trigger notifications or auto-scaling.

### **Splunk** (external, but often integrated)
- Used for log search, dashboards, security analytics.

---

## 🔹 5. Other Common AWS Services

- **API Gateway**: Expose REST/GraphQL APIs; integrates with Lambda/EKS.  
- **RDS (Relational Database Service)**: Managed SQL databases (Postgres, MySQL, Oracle).  
- **SNS/SQS**: Messaging → pub/sub or queue-based async comms.  
- **CloudFormation / CDK / Terraform**: Infrastructure as Code.

---

# 🔄 Vanguard Use-Case Scenarios

### 1. **Onboarding App Modernization**
- Angular frontend on **S3 + CloudFront**.  
- API Gateway → **Lambda** → **DynamoDB**.  
- Events published to **Kinesis** for downstream analytics.  
- **CloudWatch** monitors Lambda execution, DynamoDB performance.

### 2. **Rollover Product Enhancement**
- Legacy DB2 → migrating to DynamoDB/Postgres.  
- Batch ingestion → **Firehose** delivering to S3 data lake.  
- Microservices on **EKS** for scalability.  
- End-to-end logs forwarded to **Splunk**.

---

# 📝 Frequent AWS Interview Questions

### Q1. EC2 vs Lambda vs EKS — when do you use each?
- **EC2**: full OS control, legacy workloads, custom installs.  
- **Lambda**: event-driven, short tasks, no server mgmt.  
- **EKS**: complex, containerized microservices needing orchestration.  

### Q2. How do you design a serverless web app in AWS?
- **Frontend**: Angular hosted on **S3 + CloudFront**.  
- **Backend**: **API Gateway → Lambda → DynamoDB**.  
- **Auth**: AWS Cognito.  
- **Monitoring**: CloudWatch logs/metrics.  

### Q3. How do Kinesis and Firehose differ?
- **Kinesis**: raw, real-time stream (requires consumer apps).  
- **Firehose**: fully managed delivery → storage (S3/Redshift/Splunk).  

### Q4. How do you ensure DynamoDB performance?
- Correct **partition key** design.  
- Use **GSIs** for queries.  
- Avoid hot partitions.  
- Use **provisioned vs on-demand** modes wisely.  

### Q5. What monitoring setup would you propose?
- **CloudWatch Alarms** on Lambda duration, DynamoDB throttles.  
- **Splunk dashboards** for logs + audit trails.  
- Alerts integrated with Slack/MS Teams.  

### Q6. How do you secure AWS workloads?
- IAM least privilege.  
- Encrypt data at rest (KMS) and in transit (TLS).  
- VPC for isolation (private subnets for EKS/DB).  
- Secrets in **AWS Secrets Manager**, not in code.  

---

# 🎯 Key Interview Phrases
- “We design **event-driven architectures** with Lambda + Kinesis for scalability.”  
- “We always follow **Well-Architected Framework** principles: security, cost optimization, performance.”  
- “We host Angular frontend in **S3 + CloudFront**, APIs on **Lambda/EKS**, state in **DynamoDB/Postgres**.”  
- “Monitoring with **CloudWatch + Splunk** ensures observability and proactive alerts.”  

---
