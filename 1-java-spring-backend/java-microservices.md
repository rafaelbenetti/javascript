# Java Microservices: Concepts for Interview Preparation

This guide covers microservices architecture in Java and Spring, as theory and concepts only, with no code. It's written to help you explain *why* each pattern exists and what it solves, not only to name it.

---

## 1. What Microservices Are

A **microservices architecture** builds one application as a set of **small, independently deployable services**. Each service:

- owns **one business capability**, such as orders, payments, catalog, or notifications,
- owns **its own data**, with a separate database or schema that no other service touches directly,
- runs in **its own process** and talks to others only over the network,
- can be **built, deployed, scaled, and fixed independently**, usually by one team.

The boundaries usually follow **Domain-Driven Design**. Each service matches a *bounded context*: an area of the business where the terms and rules are consistent. Getting these boundaries right matters more than any technology choice. Services that are split badly have to call each other constantly, and you end up with a **distributed monolith**: all the costs of microservices with none of the benefits.

---

## 2. Monolith vs. Microservices

| Aspect | Monolith | Microservices |
|---|---|---|
| Deployment | One unit, so every change redeploys everything | Each service is deployed on its own |
| Scaling | The whole app scales together | Each service scales by its own load |
| Data | One shared database, with easy joins and transactions | Database per service, so consistency becomes a design problem |
| Failure | One bug can take down everything | Failures can be isolated, if you design for it |
| Communication | In-process method calls, which are fast and reliable | Network calls, which are slow, can fail, and need retries |
| Teams | Everyone works in one codebase | Teams own services end to end |
| Technology | One stack | Each service can choose its own, within reason |
| Operations | Simple to run, test, and debug | Needs CI/CD, containers, monitoring, and tracing |

**Key interview point:** microservices trade **code complexity** for **operational and distributed-systems complexity**. A well-structured *modular monolith* is often the right starting point. Splitting into services pays off when teams, scaling needs, or release speed demand it.

---

## 3. Communication Styles

### Synchronous: HTTP and REST, or gRPC

One service calls another and **waits for the answer**.

- **Pros:** simple to understand, gives an immediate response, and fits queries naturally.
- **Cons:** **temporal coupling**. If the called service is slow or down, the caller is too. Long call chains multiply latency and failure probability.
- **Spring clients:**
  - **RestTemplate** is the classic blocking client. It's now in maintenance mode.
  - **RestClient** is its modern synchronous replacement, with a fluent style.
  - **WebClient** is the non-blocking, reactive client. It suits high concurrency and streaming.
  - **OpenFeign** (Spring Cloud) lets you declare a client as an interface, and the framework generates the HTTP calls.
- Always set **timeouts**, propagate **correlation IDs**, and never make an unbounded chain of synchronous calls.

### Asynchronous: Messaging and Events

A service **publishes a message or event** and continues. Other services consume it when they're ready.

- **Pros:** **loose coupling** in time and in knowledge of each other, resilience to downstream outages, natural load leveling, and easy fan-out to many consumers.
- **Cons:** **eventual consistency**, harder debugging, and you need to handle duplicates, ordering, and poison messages.
- **Brokers:**
  - **Apache Kafka** is a distributed, durable, partitioned log. It handles high throughput, consumers can replay events, and ordering is guaranteed per partition. It's ideal for event streaming and event sourcing.
  - **RabbitMQ** is a traditional message broker with flexible routing through exchanges and queues. It's ideal for task queues and command-style messaging.
  - Cloud equivalents are AWS SQS and SNS, Google Pub/Sub, and Azure Service Bus.
- **Spring support:** Spring for Apache Kafka, Spring AMQP for RabbitMQ, and **Spring Cloud Stream**, which is a broker-neutral abstraction.
- **Delivery semantics:** most systems are **at-least-once**, so consumers must be **idempotent**. Processing the same message twice must give the same result.

**Rule of thumb:** use synchronous calls for *queries that need an answer now*, and asynchronous events for *notifying that something happened* and for long-running workflows.

---

## 4. Service Discovery

Service instances come and go as they scale, restart, or move hosts, so their addresses aren't fixed. **Service discovery** lets services find each other by **name** instead of a hard-coded address.

- **Service registry:** each instance registers itself when it starts and sends heartbeats. Instances that stop sending them are removed.
- **Client-side discovery:** the caller asks the registry for the instances and load-balances between them itself.
- **Server-side discovery:** the caller hits a load balancer or the platform, which routes the request.
- **Spring Cloud options:**
  - **Netflix Eureka** is a registry server that clients register with.
  - **HashiCorp Consul** combines a registry, health checks, and a key-value config store.
  - **Spring Cloud LoadBalancer** is the client-side load balancer. It replaced Netflix Ribbon.
- **Platform alternative:** in Kubernetes or AWS (Kubernetes Services and DNS, ECS Service Connect, Cloud Map), discovery is built in, and Eureka is often unnecessary.

---

## 5. API Gateway

An **API gateway** is the **single entry point** for external clients. It sits in front of the services and handles shared edge concerns:

- **Routing** requests to the right service,
- **Authentication** and token validation at the edge,
- **Rate limiting** and throttling,
- **TLS termination**, CORS (rules for which other websites may call the API), and request and response transformation,
- **Aggregation**, combining several service calls into one response. A **Backend-for-Frontend** is a variant with one gateway per client type, such as web or mobile.

**Spring Cloud Gateway** is Spring's reactive, non-blocking gateway, built from *routes*, *predicates* (rules that decide which route matches) and *filters* (logic that changes the request or response). It replaced Netflix Zuul. Alternatives include Kong, NGINX, and AWS API Gateway.

**Watch out:** keep business logic *out* of the gateway, or it becomes a new monolith and a single point of failure.

---

## 6. Distributed Transactions and the Saga Pattern

In a monolith, one database transaction can update orders, payments, and inventory together. With a **database per service**, that's no longer possible. Classic **two-phase commit** across services is slow, fragile, and poorly supported by modern brokers and databases, so it's generally avoided.

### The Saga Pattern

A **saga** is a sequence of **local transactions**, one per service. Each step commits locally and triggers the next. If a step fails, the saga runs **compensating transactions** that undo the earlier steps in business terms, for example "refund the payment" or "release the reserved stock".

Two coordination styles:

- **Choreography:** each service listens for events and reacts, so there's no central coordinator. It's simple for short flows, but the overall process gets hard to see and reason about as it grows.
- **Orchestration:** a central **orchestrator** tells each service what to do and tracks the state. The flow is explicit and easier to monitor, at the cost of one more component. Tools include Camunda, Temporal, and Axon.

Key ideas:

- Sagas give **eventual consistency**, not immediate atomicity, so design the user experience for intermediate states such as "order pending".
- Compensations must be **idempotent** and allowed to retry.
- A service needs to **update its database and publish an event reliably together**. Use the **Transactional Outbox** pattern: write the event to an outbox table in the same local transaction, then a separate process publishes it, for example with Debezium change data capture. This avoids the *dual-write problem*, where one of the two writes succeeds and the other doesn't.

---

## 7. Resilience Patterns and Circuit Breakers

In a distributed system, **partial failure is normal**. A single slow dependency can tie up every thread in the callers, and the failure cascades through the system. Resilience patterns stop that.

- **Timeouts:** never wait forever. This is the most important and most forgotten pattern.
- **Retries with exponential backoff and jitter:** retry only *transient* failures and only *idempotent* operations, and add random delay so retries don't all hit at once.
- **Circuit breaker:** it tracks failures to a dependency. After a threshold it **opens** and fails fast without calling. After a wait it goes **half-open** and lets a few trial calls through. If those succeed, it **closes** again. This protects both the caller and the struggling service.
- **Bulkhead:** isolate resources, such as separate thread pools or concurrency limits per dependency, so one bad dependency can't exhaust everything.
- **Rate limiter:** cap how many calls are allowed in a time window.
- **Fallbacks:** return a cached value, a default, or a degraded response instead of an error.

**Resilience4j** is the standard library in Spring, through Spring Cloud Circuit Breaker. It provides a circuit breaker, retry, rate limiter, bulkhead, and time limiter as composable modules. It replaced Netflix Hystrix, which is now in maintenance only.

---

## 8. Distributed Tracing and Observability

A single user request may pass through many services. When it's slow or fails, you need to see the **whole path**.

- **Trace:** the full journey of one request. **Span:** one unit of work within it, such as one service call or one database query. A **trace ID** is propagated across every hop, through HTTP headers and message headers.
- **Spring:** **Micrometer Tracing**, which replaced Spring Cloud Sleuth in Boot 3, exporting to **Zipkin**, **Jaeger**, or any backend that supports **OpenTelemetry**, the vendor-neutral standard.
- **The three pillars of observability:**
  - **Logs:** structured JSON logs, centrally collected (ELK, Loki, CloudWatch), with the trace ID in every line.
  - **Metrics:** Micrometer, Prometheus, and Grafana. Track latency, error rate, throughput, and saturation.
  - **Traces:** to find *where* the time went.
- **Health checks:** Spring Boot Actuator's liveness and readiness probes let the platform restart or stop routing to unhealthy instances.

---

## 9. Configuration Management Across Services

With dozens of services across several environments, configuration must be **centralized, versioned, and kept separate from code**.

- **Spring Cloud Config:** a config server, usually backed by a Git repository. Services fetch their configuration at startup, organized by application name and profile. Changes are versioned and auditable.
- **Refreshing at runtime:** configuration can be reloaded without a restart, and **Spring Cloud Bus** broadcasts refresh events to all instances.
- **Alternatives:** Consul KV, Kubernetes ConfigMaps and Secrets, AWS SSM Parameter Store, and AppConfig.
- **Secrets:** keep them in a dedicated secrets manager such as HashiCorp Vault through Spring Cloud Vault, AWS Secrets Manager, or Kubernetes Secrets. Never put them in Git or in images.
- **Principle:** the **same build** is promoted through every environment, and only the configuration differs.

---

## 10. Common Problems and How to Solve Them

### Data Consistency
- **Problem:** there are no cross-service transactions, so data is spread across databases, and joins across services are impossible.
- **Solutions:** sagas with compensations, the transactional outbox, idempotent consumers, and **eventual consistency** accepted as part of the design. Use **CQRS** (separate models for reads and writes) or materialized views built from events for reads that need data from several services. Give every piece of data **one owner**.

### Network Latency
- **Problem:** every hop adds milliseconds, and chains of calls add up.
- **Solutions:** design coarse-grained APIs that avoid chatty calls, run independent calls in parallel, cache, aggregate at the gateway or BFF, use asynchronous communication where an immediate answer isn't needed, and use efficient protocols such as gRPC for internal traffic.

### Partial Failures
- **Problem:** some services are up and others are down or slow, and failures cascade.
- **Solutions:** timeouts, retries with backoff, circuit breakers, bulkheads, fallbacks, asynchronous messaging with dead-letter queues, and health checks with automatic restarts.

### Duplicate and Out-of-Order Messages
- **Problem:** at-least-once delivery and retries produce duplicates, and parallel consumers break ordering.
- **Solutions:** idempotent handlers using unique message IDs and deduplication, natural upserts, partitioning by key so related events stay in order, and version numbers to discard stale updates.

### Debugging and Visibility
- **Problem:** "it's slow somewhere" across 20 services.
- **Solutions:** distributed tracing, correlation IDs in every log line, central logging, dashboards, and alerts on error-rate and latency targets.

### Testing
- **Problem:** end-to-end tests across many services are slow and flaky.
- **Solutions:** strong unit and service-level tests, **contract testing** with Spring Cloud Contract or Pact so that a service and its callers agree on the API, Testcontainers for real dependencies, and a small set of end-to-end smoke tests.

### Versioning and Deployments
- **Problem:** services deploy independently, so APIs must not break their consumers.
- **Solutions:** backward-compatible changes, API versioning, the tolerant-reader principle (consumers ignore fields they don't recognize), and safe rollout strategies such as blue-green, canary, and feature flags.

### Security
- **Problem:** many network entry points and calls from service to service.
- **Solutions:** authenticate at the gateway with OAuth2 and OpenID Connect, propagate JWTs, and have each service validate tokens as an OAuth2 resource server. Use mutual TLS or a service mesh for service-to-service trust, and grant each service only the access it needs.

---

## 11. Spring Cloud Module Map

| Concern | Spring Cloud / Spring module | Common alternatives |
|---|---|---|
| Service discovery | Netflix Eureka, Spring Cloud Consul | Kubernetes DNS, AWS Cloud Map |
| Client load balancing | Spring Cloud LoadBalancer | Platform load balancers |
| API gateway | Spring Cloud Gateway | Kong, NGINX, AWS API Gateway |
| Central config | Spring Cloud Config, Spring Cloud Bus | Consul KV, ConfigMaps, SSM |
| Secrets | Spring Cloud Vault | AWS Secrets Manager, Kubernetes Secrets |
| Resilience | Resilience4j (Spring Cloud Circuit Breaker) | Service mesh (Istio) policies |
| Declarative HTTP clients | Spring Cloud OpenFeign, HTTP interfaces | RestClient, WebClient |
| Messaging | Spring Cloud Stream, Spring Kafka, Spring AMQP | Native broker clients |
| Tracing | Micrometer Tracing + OpenTelemetry/Zipkin | Jaeger, Datadog, New Relic |
| Contract testing | Spring Cloud Contract | Pact |

Netflix-era components such as **Hystrix, Zuul, and Ribbon** are retired. Naming Resilience4j, Spring Cloud Gateway, and Spring Cloud LoadBalancer shows you're current.

---

## 12. What to Be Ready to Say in an Interview

1. **When not to use microservices:** for a small team, an unclear domain, or an early product, a modular monolith is usually better.
2. **How you draw boundaries:** around business capabilities and bounded contexts, with one database per service.
3. **How services talk:** synchronous calls for queries, events for state changes, and the trade-offs between them.
4. **How you keep data consistent:** sagas, outbox, idempotency, and eventual consistency.
5. **How you stay resilient:** timeouts first, then retries, circuit breakers, bulkheads, and fallbacks.
6. **How you see what's happening:** tracing, structured logs with trace IDs, metrics, and health checks.
7. **How you configure and secure many services:** central config, a secrets manager, a gateway, and JWT validation in every service.
8. **How you deploy safely:** CI/CD per service, containers and orchestration, backward-compatible APIs, and canary or blue-green releases.
