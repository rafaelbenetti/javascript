# Java + Spring Boot Essentials (Spring Boot 3.x, Java 21)

> Group 1 · Priority HIGH · Prep guide Q14–16 · Status: new file

## Say it in 30 seconds
"Spring Boot is Spring with auto-configuration, starters and an embedded server, so a service is one runnable jar. The core is the IoC container: I declare beans with `@Service`, `@Repository` and `@RestController`, and inject them through the constructor. A request goes through a thin controller that validates a DTO, a service that holds the business logic and the transaction, and a Spring Data repository. Errors are mapped once in a `@RestControllerAdvice` that returns `ProblemDetail`. My daily backend is NestJS, which copies this model (modules, providers, DI, decorators, guards), so Spring feels familiar. **[Your real Spring example: service, endpoint, what you changed]**."

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
"React and TypeScript are my strongest area, but I've worked on Java/Spring Boot services. At EPAM: **[your real example: which service, what you added (endpoint, DTO, validation, query), how you tested it]**. At Luxoft I integrated front-ends with Java and C# REST APIs. My day-to-day backend is NestJS, which is deliberately modelled on Spring (modules, DI, decorators, guards, filters), so the mental model carries over directly. On Benwer Cars I built the whole backend myself in NestJS/Fastify with Postgres." *Don't inflate years.*

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
