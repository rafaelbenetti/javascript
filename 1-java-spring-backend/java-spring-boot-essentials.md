# Java + Spring Boot Essentials (Spring Boot 3.x, Java 21)

> Group 1 · Priority HIGH · Prep guide Q14–16 · Status: new file

## Say it in 30 seconds
"Spring Boot is Spring with auto-configuration, starters and an embedded server, so a service is one runnable jar. The core is the IoC container: I declare beans with `@Service`, `@Repository` and `@RestController`, and inject them through the constructor. A request goes through a thin controller that validates a DTO, a service that holds the business logic and the transaction, and a Spring Data repository. Errors are mapped once in a `@RestControllerAdvice` that returns `ProblemDetail`. My daily backend is NestJS, which copies this model (modules, providers, DI, decorators, guards), so Spring feels familiar. A real example of my full-stack work: the OneHome Favorites/sentiments feature, with one filtered endpoint, an Elasticsearch read model fed by Kafka, and sync back to an external MLS (story below)."

---

## 1. Core concepts

### IoC and DI
- **IoC**: the container (`ApplicationContext`) creates objects (beans) and wires their dependencies, so your code doesn't call `new` for collaborators.
- **DI styles**: constructor (preferred), setter (optional deps), field `@Autowired` (avoid: hides dependencies, can't be `final`, harder to unit test).
- With a single constructor, `@Autowired` isn't needed.

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

### Stereotypes and config
| Annotation | Meaning |
|---|---|
| `@Component` | Generic bean |
| `@Service` | Business logic (semantic only) |
| `@Repository` | Data access, plus translation of persistence exceptions to `DataAccessException` |
| `@Controller` / `@RestController` | Web layer. `@RestController` = `@Controller` + `@ResponseBody` (returns JSON) |
| `@Configuration` + `@Bean` | Explicit factory methods, for third-party objects you can't annotate |

- **Scopes**: `singleton` (default, one per container, so it **must be stateless/thread-safe**), `prototype` (new instance on every injection/`getBean`), `request`, `session`, `application` (web).
- **`@SpringBootApplication`** = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` (scans its own package and below).
- **Auto-configuration**: conditional beans (`@ConditionalOnClass`, `@ConditionalOnMissingBean`). Add `spring-boot-starter-data-jpa` plus a driver and you get a `DataSource`, `EntityManagerFactory` and transaction manager. Your own bean overrides the default.

### Configuration and profiles
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
- Activate a profile with `SPRING_PROFILES_ACTIVE=prod`. Precedence, roughly: command-line args > OS env vars > profile-specific files > `application.yml` > defaults.
- Secrets come from env, Secrets Manager or SSM, never from the repo.

### A REST endpoint end to end
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
`spring.mvc.problemdetails.enabled=true` makes Spring's own exceptions use ProblemDetail too.

### Layering
`Controller` (HTTP, validation, mapping) → `Service` (business rules, `@Transactional`) → `Repository` (`JpaRepository<Listing, Long>`). Controllers stay thin.

### Spring Security (Boot 3 style)
```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())                  // OK for stateless bearer-token APIs only
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/actuator/health", "/api/v1/public/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))   // validates JWT via issuer JWKS
            .build();
    }
}
// method level: @PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.name")
```
- `WebSecurityConfigurerAdapter` is **gone** (removed in Spring Security 6). You declare a `SecurityFilterChain` bean.
- Security is a chain of servlet filters that runs **before** the `DispatcherServlet`.

### Production bits
- **Actuator**: `/actuator/health` (liveness/readiness for ECS or ALB health checks), `/metrics`, `/prometheus`. Expose only what's needed.
- **Calling other services**: `RestClient` (Spring 6.1+, synchronous, fluent) or `WebClient` (reactive). `RestTemplate` is in maintenance mode. Always set timeouts.
- **Virtual threads (Java 21)**: `spring.threads.virtual.enabled=true` (Boot 3.2+) runs request handling on virtual threads. It helps blocking I/O-heavy services.
- **Boot 3 baseline**: Java 17+, Jakarta EE 9+ (`javax.*` became `jakarta.*`), Micrometer observation and tracing. Spring Boot 4 / Framework 7 (Nov 2025) exist. Know that, but most codebases are on 3.x.

### NestJS ↔ Spring bridge (your strongest card)
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
"Embedded Tomcat accepts it. The Spring Security filter chain authenticates it, for example by validating a JWT. The `DispatcherServlet` finds the handler method, message converters (Jackson) deserialise the body, and validation runs. The controller calls the service, which runs inside a transaction and uses the repository. The result is serialised back to JSON. If anything throws, the `@RestControllerAdvice` turns it into a consistent ProblemDetail response."

**Q: How do you handle errors consistently?**
"Domain exceptions like `NotFoundException` or `ConflictException` are thrown from the service and mapped once in a `@RestControllerAdvice` to 404, 409, and 400 for validation errors with per-field messages, using ProblemDetail. There's a catch-all 500 that logs with a correlation ID and never leaks stack traces. The front end then has one error shape to handle."

**Q: Bean scopes and thread safety?**
"Singleton by default, so one instance serves all concurrent requests. Beans must be stateless or use thread-safe state. Prototype gives a new instance per injection, and request/session scopes exist for web."

**Q: How do you secure a Spring Boot API?**
"A `SecurityFilterChain` bean: stateless, and the OAuth2 resource server validates JWTs against the identity provider's keys. URL rules plus `@PreAuthorize` for method-level checks, and ownership checks in the service to prevent broken access control. CSRF can be disabled only because it's a bearer-token API. With cookie sessions I'd keep it. Plus input validation, parameterised queries, and dependency scanning in CI. At EPAM I've worked on Veracode findings remediation."

**Q: How do you call another service resiliently?**
"`RestClient` with connect and read timeouts, retries with backoff only for idempotent calls, and a circuit breaker (Resilience4j) so a slow dependency doesn't exhaust threads. Correlation IDs are propagated for tracing. If the call doesn't need to be synchronous, I'd publish an event to a queue instead. That's the pattern I know from Kafka at EPAM, and SQS/SNS on AWS."

---

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
- Returning entities from controllers leads to `LazyInitializationException`, infinite JSON recursion on bidirectional relations, and leaked fields.
- Mutable fields in a singleton bean (e.g. a `List` cache without synchronisation) are a race condition.
- Forgetting `spring-boot-starter-validation` means `@Valid` silently does nothing.
- `@ComponentScan` only scans the main class's package and below. A bean in a sibling package won't be found.
- Disabling CSRF on a cookie-session app is a real vulnerability. It's fine only for stateless token APIs.
- `javax.validation` imports in Boot 3 won't compile. They're `jakarta.validation`.
- Circular dependencies fail at startup by default since Boot 2.6. Fix the design rather than enabling them.
- Don't claim production depth you don't have. Say "I've done X; for Y I'd approach it like this".
