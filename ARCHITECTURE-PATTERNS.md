# 🧱 Architecture Patterns — Deep Dive

## 1) Monolith, Modular Monolith, Microservices (and how to migrate)

### A) Monolith

**What it is:** One deployable unit (single process/app) with shared codebase & DB.  
**When it shines:** Small teams, early-stage products, tight feature coupling, low ops overhead.  
**Pain points:** Scaling parts independently; release blast radius; entangled domain boundaries; regression risk.

**Keep a monolith healthy**

- Clear **layering** (domain/app/infrastructure or controller/service/repo).
- **Strict module boundaries** inside the monolith (see “Modular Monolith”).
- Automated tests + CI; feature toggles for safer releases.

---

### B) Modular Monolith (Highly recommended stepping stone)

**What it is:** A monolith **structured as modules** with **enforced boundaries**, each exposing a well-defined API. One deployable, many “bounded contexts.”  
**Why it’s great:** You get many microservice benefits (clarity, isolation, independent teams) **without** ops complexity. It becomes your **microservice-ready** monolith.

**Key practices**

- **Bounded contexts** map to modules: `rollover/`, `accounts/`, `customers/`.
- **Enforce boundaries**:
  - TS project references / path aliases;
  - lints to **forbid cross-module imports** except via public API (barrel).
- **Private data** per module: no direct table sharing; interact via **module service interfaces**.
- **Domain events** (in-process) between modules; async later when split.

**Example (Nx + TS project refs)**

```
apps/api
libs/rollover-domain    (public API: services, events, types)
libs/accounts-domain
libs/shared-kernel      (value objects, utilities)
```

---

### C) Microservices

**What it is:** Independently deployable services with their **own data stores**. Often communicate via **async messaging** and expose APIs.  
**When to use:** Org/scale demands independent deploys; different scaling/perf profiles; clear domain boundaries; teams can own/run services (DevOps ready).

**Trade-offs**

- ✅ Independent deployability & scaling
- ✅ Fault isolation
- ❌ **Distributed complexity**: transactions, consistency, debugging
- ❌ Operational cost: CI/CD per service, observability, networking, security

**Microservice essentials**

- **Database per service** (no shared DB!).
- **APIs**: REST/GraphQL; asynchronous with SNS/SQS/Kinesis/Kafka.
- **Resilience**: retries, backoff, circuit breakers, idempotency.
- **Observability**: logs/metrics/traces with correlation IDs.

---

### Migration path (Monolith → Modular → Microservices)

1. **Map bounded contexts** (DDD).
2. **Refactor into a modular monolith** with hard boundaries.
3. Introduce **domain events** (in-proc).
4. Extract a high-value module behind an **internal API**.
5. Switch to **out-of-process** comms (HTTP/async).
6. Move its **data**; establish **sagas** & **outbox**.
7. Rinse & repeat.

---

## 2) Event-Driven Architectures (EDA)

**Why EDA:** decoupling, scalability, resilience; perfect for auditability and async workflows (e.g., Rollover pipeline, document ingestion, notifications).

**Core patterns**

- **Pub/Sub**: producers publish; many subscribers react. (SNS, Kafka topics)
- **Queues / Competing Consumers**: work distribution + scaling. (SQS)
- **Event Carried State Transfer**: downstreams build read models.
- **Sagas** (process manager/choreography): orchestrate multi-service business flows without distributed transactions.
- **Outbox Pattern**: guarantee “write DB + publish event” happens reliably.

**Idempotency & ordering**

- **Partition keys** (Kinesis/Kafka) to ensure per-key order.
- Include **idempotency keys** in events & dedupe at consumers.
- At-least-once delivery is the norm → **idempotent handlers** mandatory.

**Outbox sketch (SQL)**

```sql
-- inside the same DB transaction
INSERT INTO rollovers(id, status, ...) VALUES (...);
INSERT INTO outbox(id, type, payload, status) VALUES (..., 'RolloverCreated', '{...}', 'pending');
```

A worker (Lambda/EKS job) reliably reads `outbox.pending`, publishes to SNS/Kinesis, marks `sent`.

**AWS implementation options**

- **SNS → SQS fanout** for pub/sub with durable queues per consumer.
- **Kinesis** for ordered partitions/high-throughput streams.
- **EventBridge** for routing & SaaS integrations.
- **Step Functions** for **saga orchestration** with visual workflows & retries.

---

## 3) API-First: REST, GraphQL, and BFF

**API-first** means your **contract is king**: design schemas and flows up-front, enforce compatibility, generate clients, and version predictably.

**REST**

- ✅ Simpler caching (CDN), great tooling, clear resource semantics.
- ❌ Over/under-fetch issues across complex UIs.

**GraphQL**

- ✅ Client-driven queries, single round-trip, strong typing, schema SDL.
- ❌ Needs careful caching, N+1 avoidance (dataloaders), authorization per field.

**BFF (Backend-for-Frontend)**

- A thin **service per UI surface** (web, mobile) that **adapts** backend APIs for optimal client consumption.
- Reduces client complexity and **decouples release cycles**.

**Governance**

- OpenAPI/AsyncAPI registries; lint PRs for **breaking changes**.
- **Versioning**: additive first; deprecate/ sunset with telemetry.

---

## 4) DDD (Domain-Driven Design) Basics That Matter

**Key building blocks**

- **Ubiquitous Language**: same terms in code & business.
- **Entities** (identity) vs **Value Objects** (immutable, equality by value).
- **Aggregates**: consistency boundaries; one transaction updates **one aggregate**.
- **Domain Services**: domain logic that doesn’t fit an entity.
- **Repositories**: persist aggregates; hide storage.
- **Domain Events**: facts (“RolloverRequested”) that drive reactions.

**Aggregate rules**

- Keep them **small**; enforce invariants inside.
- Cross-aggregate changes → **eventual consistency** + **sagas**.

**CQRS**

- Separate **commands (writes)** from **queries (reads)**: different models & stores if needed for performance (e.g., DynamoDB read models).
- Pair nicely with EDA.

---

## 5) Layered, Hexagonal, Clean Architecture

**Layered (classic)**

- Presentation → Application → Domain → Infrastructure.
- Straightforward; can become leaky if not enforced.

**Hexagonal / Ports & Adapters**

- Domain core with **Ports** (interfaces) for incoming/outgoing; **Adapters** implement them (HTTP controllers, DB clients).
- Your domain is **UI/DB-agnostic** → easier testing & swapping infra.

**Clean Architecture (Onion)**

- Concentric layers; **dependencies point inward** only.
- Use **interfaces**/inversion of control to isolate domain.

**TypeScript sketch (Ports & Adapters)**

```ts
// port
export interface RolloverRepo {
  save(a: Rollover): Promise<void>;
  byId(id: string): Promise<Rollover | null>;
}

// domain service uses the port
export class RolloverService {
  constructor(private repo: RolloverRepo, private bus: DomainEventBus) {}
  async request(cmd: RequestRollover) {
    const agg = Rollover.request(cmd);
    await this.repo.save(agg);
    this.bus.publish(new RolloverRequested(agg.id));
  }
}

// adapter (DynamoDB)
export class DynamoRolloverRepo implements RolloverRepo {
  /* ... */
}
```

---

## 6) Serverless vs Containerized (how to choose on AWS)

**Serverless (API Gateway + Lambda + DynamoDB)**

- ✅ Minimal ops, scale-to-zero, pay per use, fast iteration.
- ✅ Great for **event-driven** + irregular traffic.
- ❌ Cold starts (mitigate with provisioned concurrency).
- ❌ Long-running / heavy compute not ideal.

**Containerized (EKS/ECS + RDS/DynamoDB)**

- ✅ Full control, long-running workloads, custom runtimes, WebSockets.
- ✅ Stable high throughput.
- ❌ You own cluster ops & scaling policies.

**Pragmatic pattern**

- **Serverless by default** for CRUD, workflows, async processing.
- **Containers** for specialized protocols, stateful long-running services, or heavy, predictable throughput.

---

## 7) Data Ownership & Consistency

**Per-service DB** (RDS/DynamoDB) → services own their data.  
**Queries that span services** → compose at the BFF, or build **read models** via events.  
**Sagas** coordinate multi-service workflows (e.g., Rollover → KYC → Funding).  
**Consistency model**: prefer **eventual** across services; **strong** within aggregates.

**SAGA/retry principles**

- Retries with jittered backoff; compensate on failure (reverse or reconcile).
- **Idempotency keys** across APIs.
- Ensure **at-least-once** safe processing.

---

## 8) Observability & Reliability

- **Correlation IDs** propagate across services (HTTP headers, message metadata).
- **OpenTelemetry** for traces/metrics/logs; CloudWatch dashboards + alarms.
- **SLIs/SLOs**: latency, error rate, availability; budget **error budgets** to control release cadence.
- **Chaos/Failure testing** in non-prod (timeouts, dependency faults).

---

## 9) Security Architecture

- **Zero trust** networks; authN/Z per request (JWT/OIDC).
- **Least privilege** IAM per service; secrets in **AWS Secrets Manager**.
- Validate payloads (schema validation), sanitize logs, encrypt everything.
- Public endpoints behind **API Gateway + WAF**; private services behind **service mesh**/private subnets.

---

# 🧭 Decision Cheat-Sheet

- **New product / small team** → Start **Modular Monolith**.
- **Team growth / domain boundaries clear** → carve out **microservices** one at a time.
- **Heavy workflows & integrations** → **event-driven** + **sagas** + **outbox**.
- **UI experiences with varied needs** → **BFF** per client; consider **GraphQL**.
- **Irregular/peaky traffic** → **serverless**; **stable heavy** → containers.
- **Complex authorization** → **ABAC** or policy engine; encode in BFF/gateway.

---

# 🛠️ Concrete Steps

1. **Modularize the monolith** (Nx workspace; enforce no cross-module imports).
2. Add **domain events** (in-proc) and a thin **BFF** for Angular.
3. Stand up **API Gateway + Lambda + DynamoDB** for a small, non-critical slice.
4. Introduce **outbox** in the monolith + **SNS/SQS** consumers for the new slice.
5. Add **OpenTelemetry** + **correlation IDs** end-to-end.
6. Document **bounded contexts** + ERDs; align with stakeholders using **Ubiquitous Language**.
