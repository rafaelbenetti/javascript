# 🧱 Architecture Patterns — Deep Dive

> Group 4 · Priority MEDIUM · Prep guide Q20

## Say it in 1 minute
"I start with a modular monolith and clear module boundaries, and I extract a service only when team scale or a different scaling need pays for the ops cost. Each service owns its data. A query that needs an answer now goes over REST with a timeout. Work that can wait goes through events: SNS into SQS on AWS, Kafka where I have operated it at EPAM. Delivery is at least once, so consumers are idempotent, with a dead-letter queue and an alarm. The outbox keeps the row and the event in one local transaction. A saga replaces a distributed transaction, with a compensating step when a later step fails. Every outbound call has a timeout, backoff, and a circuit breaker, and a correlation id makes the failure debuggable. I have chased Kafka consumer lag on call."


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

- **Bounded contexts** map to modules:  `listings/`, `bookings/`, `payments/`, `users/`.
- **Enforce boundaries**:
  - TS project references / path aliases;
  - lints to **forbid cross-module imports** except via public API (barrel).
- **Private data** per module: no direct table sharing; interact via **module service interfaces**.
- **Domain events** (in-process) between modules; async later when split.

**Example (Spring Boot, Java packages + Spring Modulith)**

```
com.example.app
├── listings/          (public API: ListingService, ListingCreated event; internal/ package hidden)
├── bookings/
├── payments/
└── shared/            (value objects: Money, Email)
```
- **Spring Modulith** verifies module boundaries in a test (`ApplicationModules.of(App.class).verify()`) and supports in-process domain events via `ApplicationEventPublisher` + `@ApplicationModuleListener`, with an event publication registry (outbox-like).

**Example (Nx + TS project refs)**, still valid for a Node/NestJS or front-end monorepo

```
apps/api
libs/listings-domain    (public API: services, events, types)
libs/bookings-domain
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

**Why EDA:** decoupling, scalability, resilience; perfect for auditability and async workflows ( e.g., booking confirmation, video/media processing, search indexing, notifications).

**Core patterns**

- **Pub/Sub**: producers publish; many subscribers react. (SNS, Kafka topics)
- **Queues / Competing Consumers**: work distribution + scaling. (SQS)
- **Event Carried State Transfer**: downstreams build read models.
- **Sagas** (process manager/choreography): orchestrate multi-service business flows without distributed transactions.
- **Outbox Pattern**: guarantee “write DB + publish event” happens reliably.

**Idempotency & ordering**

- **Partition keys** (Kinesis/Kafka)  or **SQS FIFO message group IDs** to ensure per-key order.
- Include **idempotency keys** in events & dedupe at consumers.
- At-least-once delivery is the norm → **idempotent handlers** mandatory.

**Outbox sketch (SQL)**

```sql
--  inside the same DB transaction (Aurora MySQL)
INSERT INTO booking(id, listing_id, status, ...) VALUES (...);
INSERT INTO outbox(id, type, payload, status) VALUES (..., 'BookingCreated', '{...}', 'PENDING');
```

A relay (scheduled Spring job on ECS, or CDC with Debezium reading the MySQL binlog) reads `PENDING` rows, publishes to **SNS** (or Kafka), and marks them `SENT`. Consumers must still dedupe, because the relay can publish twice if it crashes after publishing but before marking.

```java
@Transactional
public Booking create(CreateBooking cmd) {
    Booking b = bookings.save(Booking.from(cmd));
    outbox.save(OutboxEvent.of("BookingCreated", b.getId(), json(b)));   // same transaction
    return b;
}

@Scheduled(fixedDelay = 1000)
void relay() {
    outbox.findTop100ByStatusOrderByCreatedAt(PENDING).forEach(e -> {
        sns.publish(topicArn, e.payload(), Map.of("eventType", e.type(), "eventId", e.id()));
        e.markSent();   // in a transaction; use SELECT ... FOR UPDATE SKIP LOCKED if several relays run
    });
}
```

**AWS implementation options**

- **SNS → SQS fanout** for pub/sub with durable queues per consumer. **(the default choice in the Applica stack)**
- **Kinesis**  or **MSK (managed Kafka)** for ordered partitions/high-throughput replayable streams.
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

- A thin **service per UI surface** ( React web, mobile app) that **adapts** backend APIs for optimal client consumption.
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
- **Domain Events**: facts ( “BookingRequested”) that drive reactions.

**Aggregate rules**

- Keep them **small**; enforce invariants inside.
- Cross-aggregate changes → **eventual consistency** + **sagas**.

**CQRS**

- Separate **commands (writes)** from **queries (reads)**: different models & stores if needed for performance ( e.g., Aurora for writes, an OpenSearch/Elasticsearch read model for listing search).
- Pair nicely with EDA.
- **Real example:** OneHome Favorites is a CQRS-style read side. Matrix (external MLS) owns the data, Kafka events populate an Elasticsearch index optimised for sentiment filtering and geo/map queries, and writes are synced back to Matrix.

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

**Java/Spring sketch (Ports & Adapters)**

```java
// port (domain owns the interface)
public interface BookingRepository {
    void save(Booking booking);
    Optional<Booking> byId(BookingId id);
}
public interface PaymentGateway { PaymentResult charge(Money amount, String customerRef); }

// application service uses ports only, so there's no Spring/JPA/Stripe in the domain
@Service
public class BookingService {
    private final BookingRepository repo;
    private final PaymentGateway payments;
    private final ApplicationEventPublisher events;
    public BookingService(BookingRepository repo, PaymentGateway payments, ApplicationEventPublisher events) {
        this.repo = repo; this.payments = payments; this.events = events;
    }
    @Transactional
    public Booking request(RequestBooking cmd) {
        Booking b = Booking.request(cmd);
        repo.save(b);
        events.publishEvent(new BookingRequested(b.id()));
        return b;
    }
}

// adapters (infrastructure)
@Repository class JpaBookingRepository implements BookingRepository { /* Spring Data JPA */ }
@Component  class StripePaymentGateway implements PaymentGateway { /* Stripe SDK */ }
```
- Easy to unit test: pass fakes or mocks for the ports.

**TypeScript sketch (Ports & Adapters)**; the same idea in NestJS

```ts
// port
export interface BookingRepo {
  save(b: Booking): Promise<void>;
  byId(id: string): Promise<Booking | null>;
}

// domain service uses the port
export class BookingService {
  constructor(private repo: BookingRepo, private bus: DomainEventBus) {}
  async request(cmd: RequestBooking) {
    const agg = Booking.request(cmd);
    await this.repo.save(agg);
    this.bus.publish(new BookingRequested(agg.id));
  }
}

// adapter ( Postgres via Drizzle, as on Benwer Cars)
export class DrizzleBookingRepo implements BookingRepo {
  /* ... */
}
```

---

## 6) Serverless vs Containerized (how to choose on AWS)

**Serverless (API Gateway + Lambda + DynamoDB/Aurora Serverless)**

- ✅ Minimal ops, scale-to-zero, pay per use, fast iteration.
- ✅ Great for **event-driven** + irregular traffic.
- ❌ Cold starts (mitigate with provisioned concurrency).
- ❌ Long-running / heavy compute not ideal.

**Containerized (ECS/EKS + Aurora/RDS)**

- ✅ Full control, long-running workloads, custom runtimes, WebSockets.
- ✅ Stable high throughput.
- ❌ You own cluster ops & scaling policies.

**Pragmatic pattern**

- **Containers (ECS Fargate) for the Spring Boot APIs**: warm JVMs and connection pools, steady traffic, simple local dev.
- **Serverless** for event-driven glue: S3 triggers, scheduled jobs, spiky queue consumers (Java Lambdas with SnapStart).

---

## 7) Data Ownership & Consistency

**Per-service DB** ( Aurora schema/cluster per service) → services own their data.  
**Queries that span services** → compose at the BFF, or build **read models** via events.  
**Sagas** coordinate multi-service workflows ( e.g., Booking → Payment → Confirmation; on payment failure, compensate by releasing the booking).  
**Consistency model**: prefer **eventual** across services; **strong** within aggregates.

**SAGA/retry principles**

- Retries with jittered backoff; compensate on failure (reverse or reconcile).
- **Idempotency keys** across APIs.
- Ensure **at-least-once** safe processing.

---

## 8) Observability & Reliability

- **Correlation IDs** propagate across services (HTTP headers, message metadata).
- **OpenTelemetry** for traces/metrics/logs; CloudWatch dashboards + alarms.  (+ New Relic APM / Splunk logs in the Applica stack)
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
- **Slow or unreliable dependency** → timeouts + retries with backoff + **circuit breaker** + fallback.
- **Irregular/peaky traffic** → **serverless**; **stable heavy** → containers.
- **Complex authorization** → **ABAC** or policy engine; encode in BFF/gateway.

---

# 🛠️ Concrete Steps

1. **Modularize the monolith** (Spring Modulith / package boundaries verified in tests).
2. Add **domain events** (in-proc) and  a thin **BFF** for the React app if the UI needs aggregation.
3.  Extract one high-value module (e.g. notifications or media processing) as a Spring Boot service on **ECS**.
4. Introduce **outbox** in the monolith + **SNS/SQS** consumers for the new slice.
5. Add **OpenTelemetry** + **correlation IDs** end-to-end.
6. Document **bounded contexts** + ERDs; align with stakeholders using **Ubiquitous Language**.

---

## 10) Resilience patterns (know these by name)

| Pattern | What | Spring/AWS |
|---|---|---|
| **Timeout** | Never wait forever | `RestClient` connect/read timeouts |
| **Retry + exponential backoff + jitter** | Transient failures, **idempotent ops only** | Resilience4j `@Retry`, SDK retries |
| **Circuit breaker** | Stop calling a failing dependency, fail fast, probe later (closed → open → half-open) | Resilience4j `@CircuitBreaker(fallbackMethod=...)` |
| **Bulkhead** | Isolate resources so one slow dependency can't exhaust all threads | Resilience4j bulkhead, separate pools |
| **Rate limiter** | Protect yourself and downstream | Resilience4j, API Gateway/WAF |
| **DLQ** | Park poison messages after N attempts | SQS redrive policy |
| **Idempotency** | Safe re-delivery | Dedupe table, idempotency keys, upserts |

---

## 11) Interview questions (spoken model answers)

**Q: Monolith or microservices?**
"It depends on team and domain maturity. For a new product or small team, a modular monolith: one deployable, clear module boundaries, simple transactions and debugging. Microservices pay off when independent teams need independent deploys, or parts need different scaling. They cost distributed-systems complexity: network failures, eventual consistency, observability, many pipelines. I'd evolve towards them by extracting the modules with the clearest boundaries."

**Q: How do services communicate, and how do you handle failure?**
"Synchronous REST where the caller needs an answer now, with timeouts, retries on idempotent calls and circuit breakers. Asynchronous events for everything that can be eventual: SNS fan-out to SQS on AWS, Kafka at EPAM. Consumers are idempotent because delivery is at-least-once, with DLQs and alarms. On call at EPAM I've debugged Kafka consumer lag and event-flow issues, so I've seen why idempotency, DLQs and correlation IDs matter." I also built a feature on that pattern: OneHome's Favorites/sentiments are stored in an Elasticsearch read model fed by Kafka events from Matrix, the external MLS that's the source of truth, and our backend service syncs each change back to Matrix. That's exactly where idempotent upserts with deterministic document IDs, and retry plus a dead-letter queue for the external sync, come in." *[confirm which safeguards were actually in place; full STAR in `../1-java-spring-backend/java-spring-boot-essentials.md`]* *(Add a concrete on-call incident too if you have one.)*

**Q: How do you keep data consistent across services?**
"No distributed transactions. Each service owns its data, consistency within a service is ACID, and across services it's eventual. The outbox pattern makes 'write and publish' atomic, and a saga coordinates multi-step flows with compensating actions, like releasing a booking if payment fails."

**Q: What's the outbox pattern?**
"Write the business row and an event row in the same local transaction. A relay publishes the event afterwards and marks it sent. It avoids the dual-write problem where the DB commits but the publish fails. The relay can publish twice, so consumers dedupe."

**Q: What's a BFF and when would you use one?**
"A backend dedicated to one front end, e.g. the React web app, that aggregates and shapes data from several services, handles auth tokens server-side, and lets the UI team move independently. Useful when web and mobile need different shapes, or when the UI would otherwise make many chatty calls."

**Q: Hexagonal architecture: why bother?**
"The domain doesn't depend on frameworks or infrastructure, only on interfaces it owns. Business logic is unit-testable without Spring or a database, and adapters like a payment provider or a queue can be swapped. NestJS and Spring both make this natural with DI."

---

## Traps and gotchas
- A shared database between microservices is a distributed monolith.
- Retrying non-idempotent calls means double charges or bookings.
- Synchronous call chains (A→B→C→D) multiply latency and failure probability.
- Dual writes (save then publish) without an outbox lose events.
- Microservices for a 3-person team means the ops cost outweighs the benefit.
- Exactly-once delivery is a myth in general. Design for at-least-once plus idempotency.
