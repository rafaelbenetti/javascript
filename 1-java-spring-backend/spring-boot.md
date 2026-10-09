# 🌱 Spring (Java) Prep — Overview + Top 20 Interview Q&A

> Group 1 · Priority HIGH
> Deep dives: `java-spring-boot-essentials.md`, `jpa-hibernate-transactions.md`, `spring-boot-testing.md`

## Say it in 1 minute
"Spring Boot is Spring with the decisions already made: auto-configuration, starters, and an embedded server, so the service is one jar. The IoC container creates the beans and wires them through the constructor, which keeps dependencies visible and lets a unit test pass fakes. A request comes through the security filter chain, a thin RestController that validates a DTO, a transactional service, and a Spring Data JPA repository. Errors are mapped once, in a RestControllerAdvice that returns ProblemDetail. Boot 3 needs Java 17 or newer and the jakarta namespace. My day-to-day backend is NestJS: modules, dependency injection, decorators, and guards. The end-to-end example I use is OneHome Favorites and sentiments, one endpoint filtered by sentiment, an Elasticsearch read model fed by Kafka, and a sync back to the external MLS. The STAR write-up is in the essentials notes."

---

## 📖 Quick Overview

- **Spring Framework** → Java framework for building enterprise apps.
- **Spring Boot** → opinionated extension of Spring for **rapid development** with minimal configuration.

### 🔹 Core Features

- **Dependency Injection (DI)** → Inversion of Control (IoC) container.
- **Aspect-Oriented Programming (AOP)** → cross-cutting concerns (logging, security, **transactions: `@Transactional` is implemented with AOP proxies**).
- **Spring MVC** → Model-View-Controller web apps (**for APIs: `@RestController` returning JSON**).
- **Spring Data JPA** → data access layer (**Hibernate is the default JPA provider**).
- **Spring Security** → authentication, authorization, JWT, OAuth2.
- **Spring Boot Starters** → pre-configured dependencies.
- **Spring Actuator** → production monitoring endpoints.
- **Spring Cloud** → microservices, service discovery, config server, circuit breakers.

### 🔹 Benefits

- Loose coupling via DI.
- Convention over configuration.
- Huge ecosystem.
- Cloud-native & microservice friendly.

### 🔹 Current versions (Oct 2026)
- **Spring Boot 3.x** requires **Java 17+** and Jakarta EE (`javax.*` → `jakarta.*`). Spring Boot 4 / Spring Framework 7 were released in Nov 2025, but most production code you'll meet is 3.x.
- Java 21 LTS → virtual threads (`spring.threads.virtual.enabled=true`, Boot 3.2+).

---

## ❓ Top 20 Questions & Answers

### 1) What is the difference between Spring and Spring Boot?

- **Spring** → full framework, lots of XML/Java config.
- **Spring Boot** → simplifies setup with auto-configuration, embedded server (Tomcat/Jetty), opinionated defaults.
- Auto-config is conditional (`@ConditionalOnClass`, `@ConditionalOnMissingBean`). Define your own bean and Boot's default backs off. Boot reads a list of auto-configuration classes and skips any whose condition fails, which is why adding a starter "just works" and why your own `DataSource` bean replaces Boot's.

---

### 2) Explain Dependency Injection (DI) in Spring.

- Design pattern → objects depend on abstractions, not implementations.
- Spring container injects dependencies via:
  - **Constructor Injection** (preferred).
  - **Setter Injection**.
  - **Field Injection** (not recommended).
- **Why constructor:** `final` fields, explicit dependencies, the object is never half-initialised, easy to unit test with mocks, and too many params is a visible smell. With one constructor, `@Autowired` is optional.
- **How:** the container looks at the constructor parameter types, finds the matching beans, and calls `new` for you. NestJS provider construction is the same lookup.

```java
@Service
public class ListingService {
    private final ListingRepository repo;
    public ListingService(ListingRepository repo) { this.repo = repo; }
}
```

---

### 3) What is Inversion of Control (IoC) in Spring?

- Principle where object creation is delegated to container instead of hard-coding with `new`.
- Managed by **ApplicationContext** in Spring.
- **How:** at startup the context scans the main class's package, registers bean definitions, then creates singletons in dependency order and caches them. Later requests call methods on those same instances. They are not constructed per request.

---

### 4) What are Spring Boot Starters?

- Pre-built dependency descriptors for common use cases.
- Example: `spring-boot-starter-web` (Tomcat, MVC, JSON).
  👉 Save time, reduce boilerplate config.
- Others to name: `-data-jpa`, `-validation` (needed for `@Valid`!), `-security`, `-oauth2-resource-server`, `-actuator`, `-test`.
- A starter is a POM, not a framework. It pulls libraries onto the classpath, and auto-configuration reacts to those classes being present. Without `spring-boot-starter-validation` there is no validator bean, so `@Valid` is silently ignored.

---

### 5) What are Spring Boot Actuators?

- Provide production-ready endpoints for health, metrics, logging.
- Example: `/actuator/health`, `/actuator/metrics`.
- Liveness and readiness probes (`/actuator/health/liveness`, `/readiness`) feed ECS/ALB health checks. Expose only what's needed (`management.endpoints.web.exposure.include=health,info,prometheus`) and never expose `env`/`heapdump` publicly. They are beans like any other endpoint, secured separately from the API so a public health check doesn't reveal the environment.

---

### 6) Explain Spring Profiles.

- Allow environment-specific beans/configs (`dev`, `test`, `prod`).
- Example:

```java
@Profile("dev")
@Bean
public DataSource devDataSource() { ... }
```
- Activate with `SPRING_PROFILES_ACTIVE=prod`. Prefer profile-specific property files (`application-prod.yml`) over many `@Profile` beans. Boot builds one `Environment` from layered property sources. The profile file is a higher layer than `application.yml`, and an env var beats both. Beans annotated `@Profile` are not even registered unless that profile is active.

---

### 7) What are the different types of bean scopes in Spring?

- **singleton** (default) → one per container. **Must be stateless/thread-safe, because the instance is cached and every request thread calls it.** NestJS providers are singletons by default for the same reason.
- **prototype** → new instance **every time it's injected or requested from the container (`getBean`)**.
- **request** → per HTTP request.
- **session** → per HTTP session.
- **application** → per ServletContext lifecycle.

---

### 8) What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?

- All are **stereotype annotations** → register beans.
- `@Component` → generic bean.
- `@Service` → business logic. **(semantic only, no extra behaviour)**
- `@Repository` → data access layer, adds exception translation. That translation is a proxy around the bean: vendor SQL exceptions become Spring's `DataAccessException` before they reach the service.
- `@Controller` → MVC controller.

---

### 9) How does Spring Boot handle embedded servers?

- By default → **Tomcat**.
- Also supports Jetty, Undertow.
- No need for WAR deployment → just run `java -jar app.jar`.
- That makes it container-friendly: one Dockerfile, deployed to ECS or Elastic Beanstalk. The starter registers a servlet container inside the process. `main` starts it. There is no external Tomcat unpacking a WAR.

---

### 10) How does Spring Security work?

- Handles authentication & authorization.
- Integrates with JWT, OAuth2, LDAP.
- Uses **filters** in security chain (**servlet filters that run before the `DispatcherServlet`**).
- Example: `UsernamePasswordAuthenticationFilter`.
- In Spring Security 6 (Boot 3), `WebSecurityConfigurerAdapter` **no longer exists**. You declare a `SecurityFilterChain` bean:

```java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
        .csrf(c -> c.disable())   // only for stateless bearer-token APIs
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a
            .requestMatchers("/actuator/health").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .build();
}
```
- Method security: `@EnableMethodSecurity` + `@PreAuthorize("hasRole('ADMIN')")`. Still check resource **ownership** in the service (broken access control is OWASP 2025 #1).
- On success the filter stores an `Authentication` on the thread (`SecurityContextHolder`). `@PreAuthorize` reads that. It does not parse the header again. A Nest guard that attaches `req.user` is the same hand-off.

---

### 11) What is Spring Data JPA?

- Abstraction over JPA/Hibernate.
- Provides `CrudRepository`, `JpaRepository`.
- Supports query methods like:

```java
List<User> findByLastName(String lastName);
```
- Also `@Query` (JPQL/native), `@EntityGraph`, projections (records), `Pageable`. See Q23 for N+1.
- There is no implementation class in your code. At startup Spring Data parses the method name into a query and builds a JDK proxy that runs it. `@Query` skips the parser.

---

### 12) How does Spring handle transactions?

- With `@Transactional`.
- Supports propagation (REQUIRED, REQUIRES_NEW, etc.) and isolation levels.
  - **How the proxy works:** Boot subclasses the service (CGLIB). The subclass starts the transaction, calls your method, then commits or rolls back. `this.other()` and `private` methods run on the real object and skip that subclass.
  - Put it on the **service layer**.
  - It's **proxy-based**: `this.method()` self-invocation and `private` methods **bypass** it.
  - Rollback by default only on **unchecked** exceptions. Checked exceptions commit unless `rollbackFor = Exception.class`. Swallowed exceptions mean no rollback.
  - `@Transactional(readOnly = true)` for reads.
  - `REQUIRED` (default) joins or creates. `REQUIRES_NEW` suspends the outer one and commits independently (audit log).
  - MySQL InnoDB default isolation = REPEATABLE READ.
  - No remote HTTP calls inside a transaction.

---

### 13) What is AOP in Spring?

- Aspect-Oriented Programming → separate cross-cutting concerns.
- Example: Logging, Security, Caching.
- Key concepts: Aspect, JoinPoint, Advice, Pointcut.
- Spring AOP is proxy-based (JDK dynamic proxies for interfaces, CGLIB otherwise; Boot prefers class proxies). A join point here is a method call that enters through the proxy. `@Transactional`, `@Cacheable` and `@Async` are around-advice on that call, which is why a self-call never triggers them.

---

### 14) What are the different types of advice in Spring AOP?

- **Before** → runs before method.
- **After Returning** → after method returns.
- **After Throwing** → after exception.
- **After (finally)** → runs regardless of outcome.
- **Around** → wraps method execution. This is the one `@Transactional` uses: it can decide to commit or roll back after it sees the return or the exception. The others can't.

---

### 15) How does Spring Boot handle configuration?

- YAML or `application.properties`.
- Precedence, highest first (simplified): **command-line args > Java system properties > OS environment variables > profile-specific files (`application-prod.yml`) > `application.yml` > `@PropertySource` > defaults.** Files outside the jar override packaged ones.
- Bind config to a typed `@ConfigurationProperties` record instead of scattering `@Value`. Secrets come from env vars, Secrets Manager or SSM, never Git. Boot flattens those sources into one `Environment` before creating beans, then binds a prefix onto the record and can fail startup if a required value is missing. That's stricter than reading `process.env` in a few controllers and noticing the typo later.

---

### 16) How does Spring Boot support microservices?

- Via **Spring Cloud**:
  - Eureka (service discovery).
  - API Gateway (routing).
  - Config Server (central config).
  - Resilience4J (circuit breaker).
- On AWS these are often replaced by platform features: **ECS Service Connect / Cloud Map or an ALB** for discovery, **API Gateway / ALB** for routing, **SSM Parameter Store / Secrets Manager** for config. Resilience4j stays useful in code. Async communication goes through **SQS/SNS** (or Kafka). Tracing uses Micrometer Tracing / OpenTelemetry. Spring Cloud is a library set, not something Boot turns on by itself. On this stack the platform already does discovery and config, so don't describe Eureka as the default.

---

### 17) What is the difference between RestController and Controller?

- `@Controller` → returns view (HTML/JSP).
- `@RestController` = `@Controller + @ResponseBody` → returns JSON/XML.
- `@ResponseBody` tells the `DispatcherServlet` to run the return value through an `HttpMessageConverter` (Jackson) instead of treating the string as a view name. Without it, `"listings"` would look for a template called `listings`.

---

### 18) How does Spring Boot handle exception handling?

- Use `@RestControllerAdvice` (= `@ControllerAdvice` + `@ResponseBody`) + `@ExceptionHandler`, returning **`ProblemDetail`** (RFC 9457, Spring 6). Map **specific** exceptions to specific statuses, and keep a catch-all `Exception` handler last that logs and hides internals.
- The `DispatcherServlet` catches the exception and asks the advice for the most specific handler. ProblemDetail is one JSON shape (`type`, `title`, `status`, `detail`) so the React app parses errors in one place, the way a Nest exception filter does.

```java
@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException ex) {
        var pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setProperty("errors", ex.getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage()).toList());
        return pd;
    }
    @ExceptionHandler(Exception.class)
    ProblemDetail fallback(Exception ex) {
        log.error("Unhandled", ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
    }
}
```

---

### 19) How do you secure REST APIs with JWT in Spring Boot?

- Filter intercepts request → extracts JWT from header → validates.
- On success → Authentication object placed in SecurityContext.
- Don't hand-roll the JWT filter. Use the **OAuth2 Resource Server** (`spring-boot-starter-oauth2-resource-server`) with `spring.security.oauth2.resourceserver.jwt.issuer-uri=...`. It fetches the IdP's JWKS, verifies the signature and `exp`/`iss`, and maps claims to authorities. Validate `aud` too, and pin the algorithms. The result is an `Authentication` on the thread. Later code reads that. It does not decode the token again.

---

### 20) What are common Spring Boot production best practices?

- Use Actuator for monitoring.
- Externalize configs.
- Secure endpoints with HTTPS & Spring Security.
- Containerize (Docker, K8s). **(or ECS on AWS)**
- Enable centralized logging (ELK, Splunk).
- Structured JSON logs with trace IDs. Timeouts on every outbound call. Graceful shutdown (`server.shutdown=graceful`). Flyway migrations with `ddl-auto=validate`. Connection-pool sizing (HikariCP). Dependency scanning in CI.

---

## More questions

### 21) How do you validate input?
`spring-boot-starter-validation` + `@Valid @RequestBody` on a record DTO with `@NotBlank`, `@Size`, `@Positive`, `@Email`. Failures throw `MethodArgumentNotValidException` → 400 with field errors. The check runs in the argument resolver, before your method, so a bad body never reaches the service. Use `@Validated` on the class for `@PathVariable`/`@RequestParam` constraints. It's the same idea as NestJS `ValidationPipe` + class-validator.

### 22) Why DTOs instead of returning entities?
Decouple the API from the schema, avoid leaking fields, avoid `LazyInitializationException` and JSON recursion, and allow different read and write shapes. Jackson walking an entity graph will initialise lazy proxies if the session is still open, and recurse on a bidirectional relation. A record DTO is a flat value with none of that machinery. Java `record`s make them one line.

### 23) What is the N+1 problem?
Loading N parents and then lazily loading a relation on each one gives N extra queries. Each touch initialises that row's proxy with its own SELECT, because the first query never fetched those columns. Fix with `JOIN FETCH` / `@EntityGraph`, batch fetching, or DTO projections. Watch out for collection fetch joins plus pagination (in-memory paging). Note that `@ManyToOne` is EAGER by default, so set it LAZY. → `jpa-hibernate-transactions.md`

### 24) What is `LazyInitializationException`?
Touching a lazy relation after the session closed (e.g. during JSON serialisation). The proxy still holds the id, but the session it would query is gone, so it throws instead of running SQL. Fetch inside the transactional service and map to DTOs. `spring.jpa.open-in-view` is true by default and hides it by keeping the session open for the whole request, and many teams disable it.

### 25) How do you test Spring Boot apps?
JUnit 5 + Mockito for services, with no Spring context. `@WebMvcTest` drives the `DispatcherServlet` in memory for status codes and JSON. `@DataJpaTest` runs repository queries and rolls the transaction back. `@SpringBootTest` boots the real auto-config, so use it sparingly. Testcontainers MySQL with `@ServiceConnection`. `@MockitoBean` replaces the deprecated `@MockBean` (Boot 3.4+). JaCoCo gate in Jenkins. → `spring-boot-testing.md`

### 26) What changed in Spring Boot 3?
Java 17 baseline, `javax` → `jakarta` (the Java EE packages moved; old `javax.persistence` imports do not compile), Spring Security 6 (`SecurityFilterChain` only, the adapter class was removed), ProblemDetail support, Micrometer Observation/Tracing (Sleuth replaced), GraalVM native images, `RestClient` (3.2), virtual threads (3.2), `@ServiceConnection`/Docker Compose support (3.1). Boot 4 exists. Most code you'll be shown is still 3.x.

### 27) Virtual threads in Spring?
`spring.threads.virtual.enabled=true` (Boot 3.2+, Java 21). Tomcat handles each request on a virtual thread. When JDBC blocks, the JVM unmounts that virtual thread and the carrier OS thread runs another request. It's for I/O-bound services, not CPU work, and the DB pool becomes the real limit because each query still needs a real connection.

### 28) How does your NestJS experience transfer?
NestJS modules, providers, constructor DI, `@Controller`/`@Get`, DTO + `ValidationPipe`, exception filters, guards and interceptors map 1:1 to Spring's configuration/beans, constructor injection, `@RestController`/`@GetMapping`, `@Valid` DTOs, `@RestControllerAdvice`, Security filters/`@PreAuthorize` and HandlerInterceptor/AOP. The request still enters a guard, a validation step, a controller and one error filter. Only the annotations change. → Table in `java-spring-boot-essentials.md`.

---

## Traps and gotchas
- `@Transactional` on private methods or self-calls does nothing.
- Checked exceptions don't roll back by default.
- `@ManyToOne` is EAGER by default.
- Mutable state in singleton beans is a race condition.
- Missing `spring-boot-starter-validation` means `@Valid` is silently ignored.
- `javax.*` imports don't work on Boot 3.
- Disabling CSRF is only OK for stateless token APIs.
- Mentioning `WebSecurityConfigurerAdapter` or `@MockBean` as current dates you. Use `SecurityFilterChain` / `@MockitoBean`.
