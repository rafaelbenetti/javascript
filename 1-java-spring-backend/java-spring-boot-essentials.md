# Java + Spring Boot Essentials (Spring Boot 3.x, Java 21)

> Group 1 · Priority HIGH
> This is the single home for core Spring and Spring Boot concepts. Related files: [code-free primer](spring-boot-fundamentals.md) · [interview index and short answers](spring-boot.md) · [security](spring-security.md) · [JPA, Hibernate and transactions](jpa-hibernate-transactions.md) · [testing](spring-boot-testing.md) · [microservices](java-microservices.md)

## Say it in 1 minute
"Spring Boot is Spring with auto-configuration, starters, and an embedded server, so a service is one runnable jar. The IoC container is the core. I declare beans with Service, Repository, and RestController, and I inject them through the constructor, so a unit test can pass fakes without starting the container. A request goes through a thin controller that validates a DTO, a service that holds the rules and the transaction, and a Spring Data repository. Errors are mapped once in a RestControllerAdvice that returns ProblemDetail. My daily backend is NestJS, with modules, providers, decorators, and guards, so the Spring shape feels familiar. The full-stack example is OneHome Favorites and sentiments: one filtered endpoint, an Elasticsearch read model fed by Kafka, and a sync back to an external MLS. That story is just below."

---

## 1. Core concepts

### IoC and DI
The `ApplicationContext` is a registry of objects it created itself. At startup it scans for stereotypes, instantiates each singleton in dependency order, and passes collaborators into the constructor, so your class never calls `new` on a repository. That split is why a unit test can pass a Mockito fake and production passes the real bean. NestJS does the same thing: the module builds providers and injects them. Constructor injection is the one to use. Setter injection is for optional dependencies, and field `@Autowired` hides them, blocks `final`, and is awkward to unit test. With a single constructor, `@Autowired` isn't needed.

```java
@Service
public class ListingService {
    private final ListingRepository repo;          // final = immutable, explicit
    private final PriceClient priceClient;

    public ListingService(ListingRepository repo, PriceClient priceClient) {
        this.repo = repo;
        this.priceClient = priceClient;
    }
}
```

### Stereotypes
A stereotype puts a class into that registry. `@Service` and `@Component` are only names. `@Repository` also wraps the bean in a proxy that translates vendor SQL exceptions into Spring's `DataAccessException`, so a service can catch one type instead of MySQL's. `@RestController` adds `@ResponseBody`, which tells the `DispatcherServlet` to run the return value through Jackson instead of looking up a view.

| Annotation | Meaning |
|---|---|
| `@Component` | Generic bean |
| `@Service` | Business logic (semantic only) |
| `@Repository` | Data access, plus translation of persistence exceptions to `DataAccessException` |
| `@Controller` / `@RestController` | Web layer. `@RestController` = `@Controller` + `@ResponseBody` (returns JSON) |
| `@Configuration` + `@Bean` | Explicit factory methods, for third-party objects you can't annotate |

- **`@SpringBootApplication`** = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` (scans its own package and below).

### Scopes
- **singleton** (default): one instance per container, cached and shared by every request thread. It **must be stateless or thread-safe**, because a mutable field races. NestJS providers are singletons by default for the same reason.
- **prototype**: a new instance on every injection or lookup. It isn't cached, and the container doesn't manage its destruction.
- **request**, **session**, **application**: web scopes, one instance per HTTP request, per user session, or per servlet context.
- Injecting a shorter-lived bean into a singleton needs a scoped proxy (or a provider), otherwise the singleton keeps the first instance forever.

### Bean lifecycle and proxies
This is the section the other files point to whenever they say "a self-call skips the proxy".

1. **Definition**: at startup the container collects bean definitions from component scanning, configuration classes and auto-configuration. Nothing is created yet. It's a list of recipes.
2. **Instantiation**: the container creates each singleton in dependency order, calling the constructor.
3. **Injection**: dependencies are passed in, through the constructor or, less ideally, through setters and fields.
4. **Aware callbacks**: a bean can optionally ask to be told its own name, the bean factory, or the application context. Application code rarely needs this.
5. **BeanPostProcessors, before init**: framework hooks see every bean and can inspect or change it. Much of Spring's behaviour lives in these processors.
6. **Init**: the bean's own setup runs, marked with `@PostConstruct` (or an init method). At this point all its dependencies are present, so it's the safe place to validate settings or warm a cache.
7. **BeanPostProcessors, after init: proxy creation**: if any feature applies to the bean (transactions, caching, async, method security, repository exception translation, your own aspects), a post-processor replaces the bean with a **proxy** that wraps it. Every other bean receives the proxy, not the original object.
8. **In use**: callers go through the proxy, which runs the extra behaviour around the real method.
9. **Destroy**: on shutdown, singletons get their `@PreDestroy` callbacks in reverse dependency order, to close pools and flush buffers. Prototypes don't.

**How a proxy works.** Boot creates proxies by subclassing the class at runtime (CGLIB), or with a JDK dynamic proxy when only an interface is needed. The proxy receives the call, does its work (opens a transaction, checks a cache, hands the call to another thread, checks a permission), then calls the real object.

**Why self-calls skip the proxy.** When a method inside the bean calls another method on the same bean, it calls it on the real object directly (`this`), not through the proxy. The proxy never sees that call, so the annotation on the inner method does nothing. The same is true for `private` methods, and for `final` methods with subclass proxies, because they can't be overridden. The fixes are to move the method into another bean, or to put the annotation on the public method that outside callers use. This one rule explains the classic surprises with `@Transactional` ([transactions](jpa-hibernate-transactions.md#transactional)), `@Cacheable`, `@Async` and `@PreAuthorize` ([method security](spring-security.md#9-method-security)).

**AOP in one paragraph.** Aspect-oriented programming is the general idea behind these proxies: a cross-cutting concern written once and applied to many methods. An *aspect* holds the logic, a *pointcut* says which methods it applies to, a *join point* is one such method call (in Spring, always a call entering through a proxy), and *advice* says when the logic runs: before, after returning, after throwing, after in any case, or **around**. Around advice wraps the call and can decide what happens after seeing the result or the exception, which is why transactions are around advice.

### How auto-configuration works internally
- `@EnableAutoConfiguration` makes Boot read a list of candidate configuration classes from the `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` file in each jar on the classpath. Boot's own auto-configure jar lists well over a hundred.
- Each candidate is guarded by **conditions**: register this only if a class is on the classpath, only if no bean of that type exists yet, only if a property is set, only in a web application, and so on. A candidate whose condition fails is skipped.
- Auto-configuration runs **after** your own beans are registered, so "only if missing" conditions see your definitions. That's how your own bean replaces Boot's default.
- A **starter** contains no logic. It's a dependency bundle that puts libraries on the classpath, and the conditions react to those classes. Add the JPA starter plus a driver and you get a `DataSource`, an `EntityManagerFactory` and a transaction manager. It's the same idea as a Nest dynamic module that registers providers unless you already did.
- When you need to know why something was or wasn't configured, start the app with `--debug` (or `debug=true`). Boot prints the **conditions evaluation report**, listing positive matches, negative matches and the reason for each. The Actuator `conditions` endpoint shows the same at runtime.
- Specific auto-configurations can be excluded, and almost all of them can be tuned with properties before you need to replace anything.

### Configuration and profiles
Boot builds one `Environment` out of layered property sources before creating beans, then binds a prefix onto a `@ConfigurationProperties` object, failing startup if a required value is missing. That is stricter than reading `process.env` in a few places and noticing the typo in production.

**Precedence, highest first** (this is the one list used across these notes):
1. Command-line arguments
2. Java system properties
3. OS environment variables
4. Profile-specific files outside the jar (`application-prod.yml` next to the jar or in `config/`)
5. Profile-specific files inside the jar
6. Application files outside the jar (`application.yml`)
7. Application files inside the jar
8. `@PropertySource` on configuration classes
9. Default properties

A **profile** is an extra property layer, activated with `SPRING_PROFILES_ACTIVE=prod` (or `spring.profiles.active`). The recommended pattern is **profile-specific property files**: the same beans everywhere, with different values per environment. Reserve `@Profile` on beans for the rare case where a whole implementation must differ, such as a fake mail sender in local development.

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:3306/app
    username: ${DB_USER}
    password: ${DB_PASSWORD}
app:
  pricing:
    base-url: https://pricing.internal
    timeout: 2s
---
spring.config.activate.on-profile: prod
logging.level.root: WARN
```
```java
@ConfigurationProperties(prefix = "app.pricing")
public record PricingProps(URI baseUrl, Duration timeout) {}   // type-safe, validated config
```
- Prefer `@ConfigurationProperties` over scattered `@Value`.
- Secrets come from env vars, Secrets Manager or SSM, never from the repo. Across many services, see config management in [microservices](java-microservices.md).

### Build and packaging
- **Maven or Gradle** resolve dependencies, compile, run tests and package. Maven is declarative with a fixed lifecycle. Gradle is scripted, faster on large builds thanks to caching. Both are fine, and Boot supports both equally.
- **The Boot parent and the BOM.** A Maven project usually inherits from the Spring Boot starter parent, or imports the Spring Boot dependencies BOM. A BOM (bill of materials) is a list of tested, compatible versions for hundreds of libraries, so you declare a dependency without a version and get the one Boot was tested with. Gradle gets the same through the Boot plugin with dependency management. Upgrading Boot upgrades the whole aligned set at once.
- **Starters** sit on top of the BOM: one dependency per capability (web, data JPA, validation, security, OAuth2 resource server, Actuator, test), each pulling a consistent bundle.
- **The Boot plugin** (Maven or Gradle) adds tasks to run the app and, most importantly, repackages the build into an **executable fat jar**: your classes, all dependency jars nested inside, and a small launcher that sets up the classpath and calls your main method. `java -jar` is all you need, with the embedded server inside.
- **Layered jars for Docker.** The fat jar can be split into layers: dependencies, Spring Boot loader, snapshot dependencies, and your application code. Copying them into separate image layers means a code change rebuilds only the thin top layer, and the heavy dependency layers stay cached. The plugin can also build an OCI image directly with buildpacks.
- Test conventions also come from the build: Surefire runs unit tests and Failsafe runs integration tests. See [testing](spring-boot-testing.md).

### Request pipeline: filters, interceptors and aspects
A request passes through three kinds of layer, in this order, and the response comes back out through them in reverse.

1. **Servlet filters** run at the server level, before Spring MVC is involved. They see the raw HTTP request and response, for every URL, including static resources and errors, but they don't know which controller will handle it. Use them for broad, transport-level concerns: security (the [Spring Security filter chain](spring-security.md#2-the-filter-chain) is filters), CORS, correlation ids, request logging, compression.
2. **The DispatcherServlet** then picks the handler method.
3. **HandlerInterceptors** run inside Spring MVC, before the handler, after it, and after the response completes. They know *which handler* was chosen and can stop the request, but they don't see the deserialised arguments. Use them for web concerns tied to handlers: locale, per-endpoint rate limits or audit, timing per route.
4. **Argument resolution and validation** turn the body and parameters into objects and run Bean Validation.
5. **AOP aspects** wrap individual bean methods (controllers, services, repositories) through proxies. They see the method and its real arguments and return value, and know nothing about HTTP. Use them for business-level cross-cutting concerns: transactions, caching, method security, metrics or auditing on service calls. They also apply to calls that didn't come from HTTP, such as a scheduled job or a message listener.

Rule of thumb: if it's about HTTP for every request, it's a filter. If it's about which endpoint, it's an interceptor. If it's about a method regardless of how it was called, it's an aspect. In NestJS terms, middleware is the filter, and guards and interceptors split across the other two.

### A REST endpoint end to end
Tomcat accepts the socket. The security filters run, then the `DispatcherServlet` matches method plus path to this handler. Jackson deserialises the body into the record, and `@Valid` runs Bean Validation before your method, so a negative price never reaches the service. The return value goes back through Jackson. Nest's `ValidationPipe` plus `@Body()` is the same gate in front of the controller method.

```java
public record CreateListingRequest(
    @NotBlank @Size(max = 120) String title,
    @NotNull @Positive BigDecimal price,
    @NotNull Long ownerId) {}

public record ListingResponse(Long id, String title, BigDecimal price) {}

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {
    private final ListingService service;
    public ListingController(ListingService service) { this.service = service; }

    @GetMapping("/{id}")
    public ListingResponse get(@PathVariable Long id) {
        return service.get(id);                       // throws NotFoundException -> 404
    }

    @GetMapping
    public Page<ListingResponse> search(@RequestParam(required = false) String city,
                                        Pageable pageable) {       // ?page=0&size=20&sort=price,asc
        return service.search(city, pageable);
    }

    @PostMapping
    public ResponseEntity<ListingResponse> create(@Valid @RequestBody CreateListingRequest req) {
        ListingResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/listings/" + created.id())).body(created); // 201
    }
}
```
- **DTOs (records) ≠ entities.** Never expose JPA entities directly: it causes lazy-loading errors, leaks fields and couples the API to the schema.
- `@Valid` triggers Bean Validation (`jakarta.validation`). A failure throws `MethodArgumentNotValidException`, which becomes 400.
- Needs `spring-boot-starter-validation`.

### Global error handling (Spring 6 `ProblemDetail`, RFC 9457)
When a controller throws, the `DispatcherServlet` asks the `@RestControllerAdvice` for the most specific `@ExceptionHandler` instead of writing a container error page. ProblemDetail is a small standard JSON shape (`type`, `title`, `status`, `detail`) so the React app has one error parser. A Nest exception filter is that same single mapping point.

```java
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ProblemDetail notFound(NotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Resource not found");
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Validation failed");
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
            .map(f -> Map.of("field", f.getField(), "message", f.getDefaultMessage())).toList());
        return pd;
    }

    @ExceptionHandler(Exception.class)            // last resort: log it, don't leak stack traces
    public ProblemDetail unexpected(Exception ex) {
        log.error("Unhandled", ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
    }
}
```
`spring.mvc.problemdetails.enabled=true` makes Spring's own exceptions use ProblemDetail too. This is the one copy of the error-handling example in these notes, and [spring-boot.md](spring-boot.md) links here.

### Layering
`Controller` (HTTP, validation, mapping) → `Service` (business rules, `@Transactional`) → `Repository` (`JpaRepository<Listing, Long>`). Controllers stay thin. The cut exists so status codes don't leak into business rules, and so the service can be tested without a server. The transaction sits on the service because that method is the unit of "this use case commits or rolls back together". A Nest controller, service and repository are the same three layers.

### MVC vs WebFlux vs virtual threads
- **Spring MVC** is the servlet model: **one thread per request**. A thread handles the request from start to finish and simply waits while JDBC or an HTTP call blocks. It's simple to write, debug and trace. The limit is the thread pool: a few hundred platform threads, each expensive.
- **WebFlux** is the **non-blocking** model. A few event-loop threads handle many requests, and no code may block: every I/O step returns a promise-like value and the thread moves on. It's very efficient for high concurrency and streaming, but the whole stack must be non-blocking (reactive drivers, no plain JDBC), and the code and stack traces are harder to follow. It's the Node.js event-loop model.
- **Virtual threads** (Java 21, Boot 3.2+ with `spring.threads.virtual.enabled=true`) keep the simple MVC style but make threads cheap. When a virtual thread blocks on I/O, the JVM unmounts it and the underlying OS thread runs another one. You get most of the concurrency benefit of WebFlux with ordinary blocking code.
- What doesn't change: CPU-bound work isn't faster, and the **database connection pool is still the ceiling**, because each query needs a real connection. Very long synchronized sections can pin a virtual thread to its carrier.
- In practice: MVC with virtual threads is the default choice for new I/O-bound services. WebFlux is for streaming, very high fan-out, or a codebase that is already reactive.

### Observability
- **Actuator** exposes operational endpoints. **Health** (with liveness and readiness groups for ECS, ALB or Kubernetes probes) answers "is the process up?" separately from "can it serve traffic?". **Info**, **metrics** and **prometheus** feed dashboards.
- **Safe to expose**: health and info, and prometheus on an internal port or network. **Never expose publicly**: env, configprops, heapdump, threaddump, loggers, beans, mappings, shutdown. They reveal secrets and internals or can change the running app. Expose only an explicit list, and secure the management endpoints separately from the API, ideally on a separate port.
- **Micrometer metrics** is the vendor-neutral metrics facade, the SLF4J of metrics. Boot records HTTP latency and status counts, JVM memory and GC, connection-pool usage and more, tagged by route and outcome, and exports them to Prometheus, CloudWatch, Datadog or New Relic. You add business counters and timers the same way.
- **Tracing** with Micrometer Tracing and **OpenTelemetry** gives every request a trace id and each step a span, and propagates the ids in headers to downstream services and message brokers. A tracing backend (Jaeger, Tempo, X-Ray) then shows one request across all services. It replaced Spring Cloud Sleuth in Boot 3.
- **Structured logs** are JSON lines with fields instead of free text, and Boot 3.4+ supports them out of the box. With tracing on, the trace and span ids go into every log line, so you can jump from a slow trace to its logs and back. That's what correlation ids mean in practice.
- The observation API ties these together: one instrumentation point produces a metric, a span and log context. For tracing across services see [microservices](java-microservices.md).

### Other features worth knowing
- **Caching (`@Cacheable`)**: the result of a method is stored by its arguments and returned on the next call without running the method. Boot plugs in a cache provider (Caffeine locally, Redis shared). It's a proxy, so self-calls skip it, and you need a plan for eviction and staleness.
- **`@Async` and scheduling**: `@Async` runs a method on another thread from an executor and returns immediately, and `@Scheduled` runs a method on a fixed rate, delay or cron. Both are proxy- or container-driven, so the same self-call rule applies. The security context and transactions don't follow the work to the other thread. With several instances, a scheduled job runs on every one unless you add a lock.
- **Application events**: a bean publishes an event and other beans listen, which decouples "order placed" from "send email". Listeners run synchronously by default. Transactional listeners can wait until after commit, so you don't send the email for an order that rolled back. For events between services, use a broker instead ([microservices](java-microservices.md)).
- **Graceful shutdown**: with `server.shutdown=graceful` the server stops accepting new requests, lets in-flight ones finish within a timeout, then the context closes and `@PreDestroy` hooks run. Together with readiness going down first, deployments don't drop requests.
- **Calling other services**: `RestClient` (Spring 6.1+, synchronous, fluent) or `WebClient` (reactive). `RestTemplate` is in maintenance mode. Always set timeouts. For resilience patterns see [microservices](java-microservices.md).
- **Boot 3 baseline**: Java 17+, Jakarta EE 9+ (`javax.*` became `jakarta.*`), Micrometer observation and tracing. Spring Boot 4 / Framework 7 (Nov 2025) exist. Know that, but most codebases are on 3.x.

### Security
Security has its own file: [spring-security.md](spring-security.md), covering the filter chain, the SecurityContext, JWT resource servers, passwords, sessions vs tokens, CORS, CSRF, method security and ownership checks.

### Data access and testing
JPA, Hibernate, the persistence context and `@Transactional` rules are in [jpa-hibernate-transactions.md](jpa-hibernate-transactions.md). Tests are in [spring-boot-testing.md](spring-boot-testing.md).

### NestJS ↔ Spring bridge (your strongest card)
Read this left to right when the question is "you haven't lived in Spring". The pipeline is the same: module, injected provider, decorator, validation, one error filter, a guard. The annotations change.

| NestJS | Spring Boot |
|---|---|
| `@Module` | `@Configuration` / component scan / auto-config |
| `@Injectable()` provider | `@Service` / `@Component` bean |
| Constructor injection | Constructor injection |
| `@Controller`, `@Get(':id')`, `@Param`, `@Body` | `@RestController`, `@GetMapping("/{id}")`, `@PathVariable`, `@RequestBody` |
| `ValidationPipe` + class-validator DTO | `@Valid` + Bean Validation on a record DTO |
| Exception filter | `@RestControllerAdvice` + `@ExceptionHandler` |
| Guard | Spring Security filter chain / `@PreAuthorize` |
| Interceptor | `HandlerInterceptor` / AOP `@Around` |
| ConfigModule | `@ConfigurationProperties` + profiles |
| TypeORM/Drizzle repository | Spring Data JPA repository |


---

## 2. Interview questions (spoken model answers)

**Q: How much Spring Boot have you done?**
"React and TypeScript are my strongest area, but I work end to end. The best example is from EPAM: At EPAM on OneHome, a top-5 US home-search app, I built the Favorites/sentiments feature: 4 sentiments (like and dislike from the consumer, recommend and exclude from the agent), shown on a map plus 4 tabs. One API endpoint filters by sentiment type. The data lives in Elasticsearch, fed by Kafka events because the source of truth is Matrix, an external MLS provider, and on every change our backend service sends the update back to Matrix to keep them in sync. **[If you also have hands-on Spring Boot work, add one line on it here. Don't present the Favorites service as Spring.]** At Luxoft I integrated front-ends with Java and C# REST APIs. My day-to-day backend is NestJS, which is deliberately modelled on Spring (modules, DI, decorators, guards, filters), so the mental model carries over directly. On Benwer Cars I built the whole backend myself in NestJS/Fastify with Postgres." *Don't inflate years.*

**Q: What is dependency injection and why constructor injection?**
"The container builds the objects and hands each one its dependencies, instead of the class creating them. That gives loose coupling and easy testing, because in a unit test I just pass a Mockito mock to the constructor. Constructor injection makes dependencies explicit and `final`, the object is never half-built, and too many constructor parameters is a visible smell that the class does too much. Field injection hides all of that."

**Q: Spring vs Spring Boot?**
"Spring is the framework: DI, MVC, data, security. Boot is the opinionated layer on top: starters, auto-configuration with sensible defaults, an embedded Tomcat, and Actuator. You get a runnable jar with almost no configuration, and any default can be overridden by defining your own bean or property."

**Q: Walk me through what happens on a request.**
"Embedded Tomcat accepts it. The Spring Security filter chain authenticates it, for example by validating a JWT. The `DispatcherServlet` finds the handler method, interceptors run, message converters (Jackson) deserialise the body, and validation runs. The controller calls the service, which runs inside a transaction through its proxy and uses the repository. The result is serialised back to JSON. If anything throws, the `@RestControllerAdvice` turns it into a consistent ProblemDetail response."

**Q: How do you handle errors consistently?**
"Domain exceptions like `NotFoundException` or `ConflictException` are thrown from the service and mapped once in a `@RestControllerAdvice` to 404, 409, and 400 for validation errors with per-field messages, using ProblemDetail. There's a catch-all 500 that logs with a correlation ID and never leaks stack traces. The front end then has one error shape to handle."

**Q: Bean scopes and thread safety?**
"Singleton by default, so one instance serves all concurrent requests. Beans must be stateless or use thread-safe state. Prototype gives a new instance per injection, and request/session scopes exist for web."

**Q: Why didn't my `@Transactional` (or `@Cacheable`, `@Async`) work?**
"Those features are proxies created after the bean is initialised. A call from inside the same class goes to the real object, not the proxy, so nothing happens. Private and final methods have the same problem. I move the method to another bean or annotate the public entry point."

**Q: Filter, interceptor or aspect?**
"Filter for HTTP-wide concerns before Spring MVC, like security and correlation ids. Interceptor when I need to know which handler runs. Aspect for method-level business concerns, like transactions or auditing, that should also apply outside HTTP."

**Q: How do you secure a Spring Boot API?**
See [spring-security.md](spring-security.md#interview-questions-spoken-model-answers).

**Q: How do you call another service resiliently?**
"`RestClient` with connect and read timeouts, retries with backoff only for idempotent calls, and a circuit breaker (Resilience4j) so a slow dependency doesn't exhaust threads. Correlation IDs are propagated for tracing. If the call doesn't need to be synchronous, I'd publish an event to a queue instead. That's the pattern I know from Kafka at EPAM, and SQS/SNS on AWS." More in [java-microservices.md](java-microservices.md).

---

## ⭐ Real STAR story: OneHome Favorites / Sentiments (EPAM)
> Rafael's real feature. Call it **"our backend service"**. Don't say it was Spring. Facts below are confirmed. Anything in *italics + [confirm]* is a suggested follow-up answer, so say it only if true, or frame it as "how I'd harden it".

**S, Situation:** OneHome is one of the top-5 home-search apps in the US. Consumers and their real-estate agents needed a shared way to mark and review properties.
**T, Task:** Build the Favorites/sentiments feature end to end.
**A, Action:**
- **4 sentiments**: **like** and **dislike** are set by the consumer, **recommend** and **exclude** are set by the agent. Both the consumer and the agent see all 4 tabs.
- **UI**: a page with a **map plus 4 tabs**. Each tab is an **independent component** built from **shared components** (list, property card, map integration), so the four views reuse one implementation.
- **API**: **a single endpoint that filters by sentiment type** (e.g. `GET …/favorites?sentiment=LIKE`), not four endpoints.
- **Data**: stored in **Elasticsearch**, populated from **Kafka events**, because the **source of truth is Matrix**, an external MLS provider.
- **Two-way sync**: on every sentiment change, our backend service **sends the update back to Matrix** so both systems stay in sync.
**R, Result:** consumers and agents collaborate on one consistent set of 4 sentiment lists, shown on the map and in tabs. **[Add a real outcome if you have one: usage, adoption, fewer support tickets, performance.]**

### Likely follow-ups (model answers)
**"Why one endpoint with a filter instead of four?"**
"The four sentiments are the same resource, a favourite with a type, so one endpoint keeps the contract small: `sentiment` is a query parameter validated against an enum, plus pagination. The front end reuses one data hook for all four tabs. Adding a fifth sentiment is a new enum value, not a new endpoint. Authorisation still applies per sentiment: only agents can set recommend and exclude, only consumers can set like and dislike."

**"Why Elasticsearch and not just a relational table?"**
"Two reasons: filtering and the map. Elasticsearch is built for fast filtered queries over many fields (sentiment, user, agent, price, beds, status) and has native **geo queries** (`geo_bounding_box` for the visible map area, `geo_distance`, geo aggregations for clustering pins). The data originates in Matrix and arrives as events anyway, so a search-optimised read model fed from Kafka fits well. It's a CQRS-style read side."

**"How do you make the Kafka consumer safe against duplicates and replays?"**
"Kafka is at-least-once, so the consumer must be **idempotent**. The cleanest way is an **upsert with a deterministic document ID**, e.g. `userId + listingId` (or `userId + listingId + sentiment`, depending on the model). Re-processing the same event overwrites the same document instead of creating duplicates. For ordering, events for the same key go to the same partition (partition key = listing or user), and an event version or timestamp lets the consumer skip stale updates (external versioning in Elasticsearch, or compare-and-skip)." *[confirm which of these you actually used]*

**"What if the sync back to Matrix fails?"**
"Matrix is external, so failures are expected: timeouts, rate limits, outages. The user's action shouldn't fail because Matrix is down. I'd **retry with exponential backoff and jitter** for transient errors, make the call idempotent so retries are safe, and after N attempts send it to a **dead-letter queue/topic** with alerting, plus a replay path once Matrix recovers. Monitoring on DLQ depth and sync error rate goes to PagerDuty. Also a reconciliation job, because Matrix is the source of truth, so the Kafka feed eventually corrects any drift." *[confirm what was in place vs what you'd add]*

**"Isn't there a race between your write to Matrix and the Kafka event coming back?"**
"Yes, that's the classic two-way-sync problem. Options: treat Matrix as the source of truth and apply updates only from the event stream (the UI updates optimistically), or version the records so an older event can't overwrite a newer local change. The key is one clear owner per field and idempotent, version-aware updates." *[confirm how it was handled]*

**"How did you test it?"**
"Component tests for the shared tab components and the sentiment filter, tests for the endpoint's filtering and permissions, and tests for the consumer's idempotency (same event twice gives one document). It all ran in the pipeline with our 80% coverage gate." *[adjust to what was actually tested]*

**Spring translation (if they ask "how would this look in Spring?")**
```java
@GetMapping("/api/v1/favorites")
public Page<FavoriteResponse> list(@RequestParam Sentiment sentiment, Pageable pageable,
                                   @AuthenticationPrincipal Jwt user) {
    return favorites.find(user.getSubject(), sentiment, pageable);     // enum binding gives 400 on bad values
}

@KafkaListener(topics = "matrix.favorites")
public void on(FavoriteEvent e) {
    es.index(i -> i.index("favorites").id(e.userId() + ":" + e.listingId())   // deterministic id = upsert
                   .document(FavoriteDoc.from(e)));
}
```

---

## 3. Traps and gotchas
- Saying "`@Service` adds behaviour". It doesn't: it's semantic. Only `@Repository` adds exception translation.
- Self-calls, `private` and `final` methods bypass proxies, so `@Transactional`, `@Cacheable`, `@Async` and `@PreAuthorize` silently do nothing there.
- Returning entities from controllers leads to `LazyInitializationException`, infinite JSON recursion on bidirectional relations, and leaked fields.
- Mutable fields in a singleton bean (e.g. a `List` cache without synchronisation) are a race condition.
- Forgetting `spring-boot-starter-validation` means `@Valid` silently does nothing.
- `@ComponentScan` only scans the main class's package and below. A bean in a sibling package won't be found.
- Exposing Actuator `env` or `heapdump` publicly leaks secrets.
- `javax.validation` imports in Boot 3 won't compile. They're `jakarta.validation`.
- Circular dependencies fail at startup by default since Boot 2.6. Fix the design rather than enabling them.
- Don't claim production depth you don't have. Say "I've done X; for Y I'd approach it like this".
