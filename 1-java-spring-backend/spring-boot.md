# 🌱 Spring (Java) Prep — Overview + Top 20 Interview Q&A

> Group 1 · Corrected and expanded version of the former `SPRING-BOOT.md` · Priority HIGH
> Legend: **✏️ FIXED** = original text corrected · **➕ ADDED** = new content · unmarked = original (lightly formatted)
> Deep dives: `java-spring-boot-essentials.md`, `jpa-hibernate-transactions.md`, `spring-boot-testing.md`

## What was fixed (changelog)
1. **Q7 scopes**: "prototype → new instance per request" was ambiguous. It means per injection/`getBean()`. Per HTTP request is the `request` scope.
2. **Q10/Q19 Security**: updated to Spring Security 6 / Boot 3 (`SecurityFilterChain` bean, `oauth2ResourceServer().jwt()`). `WebSecurityConfigurerAdapter` was removed.
3. **Q12 transactions**: expanded with proxy behaviour, self-invocation, rollback rules, `readOnly` and propagation.
4. **Q15 config precedence**: made more precise.
5. **Q16 microservices**: added the AWS-native alternatives to Eureka/Config Server.
6. **Q18 exceptions**: switched to `@RestControllerAdvice` + `ProblemDetail`, with specific handlers before the catch-all.
7. **➕ Added** Q21–Q28: validation, DTO vs entity, JPA/N+1, `LazyInitializationException`, testing, Boot 3 baseline, virtual threads, the NestJS bridge.
8. **➕ Added** a "Say it in 30 seconds" summary and a traps section.

---

## ➕ Say it in 30 seconds
"Spring Boot is Spring plus auto-configuration, starters and an embedded server, so a service is one jar. The IoC container wires beans via constructor injection. A request flows through the security filter chain to a thin `@RestController` that validates a DTO, a `@Transactional` service, and a Spring Data JPA repository. Errors are mapped once with `@RestControllerAdvice` and ProblemDetail. Boot 3 needs Java 17+ and uses `jakarta.*`. My day-to-day backend is NestJS, which mirrors Spring's modules, DI, decorators and guards. My best end-to-end example is OneHome's Favorites/sentiments feature (one endpoint filtered by sentiment, Elasticsearch fed by Kafka, sync back to the external MLS). The STAR story is in `java-spring-boot-essentials.md`."

---

## 📖 Quick Overview

- **Spring Framework** → Java framework for building enterprise apps.
- **Spring Boot** → opinionated extension of Spring for **rapid development** with minimal configuration.

### 🔹 Core Features

- **Dependency Injection (DI)** → Inversion of Control (IoC) container.
- **Aspect-Oriented Programming (AOP)** → cross-cutting concerns (logging, security, **➕ transactions: `@Transactional` is implemented with AOP proxies**).
- **Spring MVC** → Model-View-Controller web apps (**➕ for APIs: `@RestController` returning JSON**).
- **Spring Data JPA** → data access layer (**➕ Hibernate is the default JPA provider**).
- **Spring Security** → authentication, authorization, JWT, OAuth2.
- **Spring Boot Starters** → pre-configured dependencies.
- **Spring Actuator** → production monitoring endpoints.
- **Spring Cloud** → microservices, service discovery, config server, circuit breakers.

### 🔹 Benefits

- Loose coupling via DI.
- Convention over configuration.
- Huge ecosystem.
- Cloud-native & microservice friendly.

### ➕ 🔹 Current versions (Oct 2026)
- **Spring Boot 3.x** requires **Java 17+** and Jakarta EE (`javax.*` → `jakarta.*`). Spring Boot 4 / Spring Framework 7 were released in Nov 2025, but most production code you'll meet is 3.x.
- Java 21 LTS → virtual threads (`spring.threads.virtual.enabled=true`, Boot 3.2+).

---

## ❓ Top 20 Questions & Answers

### 1) What is the difference between Spring and Spring Boot?

- **Spring** → full framework, lots of XML/Java config.
- **Spring Boot** → simplifies setup with auto-configuration, embedded server (Tomcat/Jetty), opinionated defaults.
- **➕** Auto-config is conditional (`@ConditionalOnClass`, `@ConditionalOnMissingBean`). Define your own bean and Boot's default backs off.

---

### 2) Explain Dependency Injection (DI) in Spring.

- Design pattern → objects depend on abstractions, not implementations.
- Spring container injects dependencies via:
  - **Constructor Injection** (preferred).
  - **Setter Injection**.
  - **Field Injection** (not recommended).
- **➕ Why constructor:** `final` fields, explicit dependencies, the object is never half-initialised, easy to unit test with mocks, and too many params is a visible smell. With one constructor, `@Autowired` is optional.

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

---

### 4) What are Spring Boot Starters?

- Pre-built dependency descriptors for common use cases.
- Example: `spring-boot-starter-web` (Tomcat, MVC, JSON).
  👉 Save time, reduce boilerplate config.
- **➕** Others to name: `-data-jpa`, `-validation` (needed for `@Valid`!), `-security`, `-oauth2-resource-server`, `-actuator`, `-test`.

---

### 5) What are Spring Boot Actuators?

- Provide production-ready endpoints for health, metrics, logging.
- Example: `/actuator/health`, `/actuator/metrics`.
- **➕** Liveness and readiness probes (`/actuator/health/liveness`, `/readiness`) feed ECS/ALB health checks. Expose only what's needed (`management.endpoints.web.exposure.include=health,info,prometheus`) and never expose `env`/`heapdump` publicly.

---

### 6) Explain Spring Profiles.

- Allow environment-specific beans/configs (`dev`, `test`, `prod`).
- Example:

```java
@Profile("dev")
@Bean
public DataSource devDataSource() { ... }
```
- **➕** Activate with `SPRING_PROFILES_ACTIVE=prod`. Prefer profile-specific property files (`application-prod.yml`) over many `@Profile` beans.

---

### 7) What are the different types of bean scopes in Spring?

- **singleton** (default) → one per container. **➕ Must be stateless/thread-safe, because it's shared by all requests.**
- **✏️ FIXED** **prototype** → new instance **every time it's injected or requested from the container (`getBean`)**. *(Original said "per request", which is easy to confuse with HTTP request.)*
- **request** → per HTTP request.
- **session** → per HTTP session.
- **application** → per ServletContext lifecycle.

---

### 8) What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?

- All are **stereotype annotations** → register beans.
- `@Component` → generic bean.
- `@Service` → business logic. **➕ (semantic only, no extra behaviour)**
- `@Repository` → data access layer, adds exception translation.
- `@Controller` → MVC controller.

---

### 9) How does Spring Boot handle embedded servers?

- By default → **Tomcat**.
- Also supports Jetty, Undertow.
- No need for WAR deployment → just run `java -jar app.jar`.
- **➕** That makes it container-friendly: one Dockerfile, deployed to ECS or Elastic Beanstalk.

---

### 10) How does Spring Security work?

- Handles authentication & authorization.
- Integrates with JWT, OAuth2, LDAP.
- Uses **filters** in security chain (**➕ servlet filters that run before the `DispatcherServlet`**).
- Example: `UsernamePasswordAuthenticationFilter`.
- **✏️ FIXED: configuration style.** In Spring Security 6 (Boot 3), `WebSecurityConfigurerAdapter` **no longer exists**. You declare a `SecurityFilterChain` bean:

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
- **➕** Method security: `@EnableMethodSecurity` + `@PreAuthorize("hasRole('ADMIN')")`. Still check resource **ownership** in the service (broken access control is OWASP 2025 #1).

---

### 11) What is Spring Data JPA?

- Abstraction over JPA/Hibernate.
- Provides `CrudRepository`, `JpaRepository`.
- Supports query methods like:

```java
List<User> findByLastName(String lastName);
```
- **➕** Also `@Query` (JPQL/native), `@EntityGraph`, projections (records), `Pageable`. See Q23 for N+1.

---

### 12) How does Spring handle transactions?

- With `@Transactional`.
- Supports propagation (REQUIRED, REQUIRES_NEW, etc.) and isolation levels.
- **✏️ FIXED / expanded** (the original was too thin for a Java interview):
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
- **➕** Spring AOP is proxy-based (JDK dynamic proxies for interfaces, CGLIB otherwise). That's why `@Transactional`, `@Cacheable` and `@Async` don't work on self-calls.

---

### 14) What are the different types of advice in Spring AOP?

- **Before** → runs before method.
- **After Returning** → after method returns.
- **After Throwing** → after exception.
- **➕ After (finally)** → runs regardless of outcome.
- **Around** → wraps method execution.

---

### 15) How does Spring Boot handle configuration?

- YAML or `application.properties`.
- **✏️ FIXED (more precise)** Precedence, highest first (simplified): **command-line args > Java system properties > OS environment variables > profile-specific files (`application-prod.yml`) > `application.yml` > `@PropertySource` > defaults.** Files outside the jar override packaged ones.
- **➕** Bind config to a typed `@ConfigurationProperties` record instead of scattering `@Value`. Secrets come from env vars, Secrets Manager or SSM, never Git.

---

### 16) How does Spring Boot support microservices?

- Via **Spring Cloud**:
  - Eureka (service discovery).
  - API Gateway (routing).
  - Config Server (central config).
  - Resilience4J (circuit breaker).
- **✏️ FIXED / context.** On AWS these are often replaced by platform features: **ECS Service Connect / Cloud Map or an ALB** for discovery, **API Gateway / ALB** for routing, **SSM Parameter Store / Secrets Manager** for config. Resilience4j stays useful in code. Async communication goes through **SQS/SNS** (or Kafka). Tracing uses Micrometer Tracing / OpenTelemetry.

---

### 17) What is the difference between RestController and Controller?

- `@Controller` → returns view (HTML/JSP).
- `@RestController` = `@Controller + @ResponseBody` → returns JSON/XML.

---

### 18) How does Spring Boot handle exception handling?

- **✏️ FIXED.** Use `@RestControllerAdvice` (= `@ControllerAdvice` + `@ResponseBody`) + `@ExceptionHandler`, returning **`ProblemDetail`** (RFC 9457, Spring 6). Map **specific** exceptions to specific statuses, and keep a catch-all `Exception` handler last that logs and hides internals. *(The original only had a catch-all `Exception` → `ResponseEntity<String>`, which turns every error into the same response and can leak messages.)*

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
- **✏️ FIXED / modernised.** Don't hand-roll the JWT filter. Use the **OAuth2 Resource Server** (`spring-boot-starter-oauth2-resource-server`) with `spring.security.oauth2.resourceserver.jwt.issuer-uri=...`. It fetches the IdP's JWKS, verifies the signature and `exp`/`iss`, and maps claims to authorities. Validate `aud` too, and pin the algorithms.

---

### 20) What are common Spring Boot production best practices?

- Use Actuator for monitoring.
- Externalize configs.
- Secure endpoints with HTTPS & Spring Security.
- Containerize (Docker, K8s). **➕ (or ECS on AWS)**
- Enable centralized logging (ELK, Splunk).
- **➕** Structured JSON logs with trace IDs. Timeouts on every outbound call. Graceful shutdown (`server.shutdown=graceful`). Flyway migrations with `ddl-auto=validate`. Connection-pool sizing (HikariCP). Dependency scanning in CI.

---

## ➕ Added questions

### 21) How do you validate input?
`spring-boot-starter-validation` + `@Valid @RequestBody` on a record DTO with `@NotBlank`, `@Size`, `@Positive`, `@Email`. Failures throw `MethodArgumentNotValidException` → 400 with field errors. Use `@Validated` on the class for `@PathVariable`/`@RequestParam` constraints. It's the same idea as NestJS `ValidationPipe` + class-validator.

### 22) Why DTOs instead of returning entities?
Decouple the API from the schema, avoid leaking fields, avoid `LazyInitializationException` and JSON recursion, and allow different read and write shapes. Java `record`s make DTOs one line.

### 23) What is the N+1 problem?
Loading N parents and then lazily loading a relation on each one gives N extra queries. Fix with `JOIN FETCH` / `@EntityGraph`, batch fetching, or DTO projections. Watch out for collection fetch joins plus pagination (in-memory paging). Note that `@ManyToOne` is EAGER by default, so set it LAZY. → `jpa-hibernate-transactions.md`

### 24) What is `LazyInitializationException`?
Touching a lazy relation after the session closed (e.g. during JSON serialisation). Fetch inside the transactional service and map to DTOs. `spring.jpa.open-in-view` is true by default and hides it, and many teams disable it.

### 25) How do you test Spring Boot apps?
JUnit 5 + Mockito for services. `@WebMvcTest` + MockMvc for controllers. `@DataJpaTest` for repositories. `@SpringBootTest` for full flows. Testcontainers MySQL with `@ServiceConnection`. `@MockitoBean` replaces the deprecated `@MockBean` (Boot 3.4+). JaCoCo gate in Jenkins. → `spring-boot-testing.md`

### 26) What changed in Spring Boot 3?
Java 17 baseline, `javax` → `jakarta`, Spring Security 6 (`SecurityFilterChain` only), ProblemDetail support, Micrometer Observation/Tracing (Sleuth replaced), GraalVM native images, `RestClient` (3.2), virtual threads (3.2), `@ServiceConnection`/Docker Compose support (3.1).

### 27) Virtual threads in Spring?
`spring.threads.virtual.enabled=true` (Boot 3.2+, Java 21). Tomcat handles each request on a virtual thread, so blocking JDBC or HTTP calls stop tying up OS threads. It's for I/O-bound services, and the DB pool becomes the real limit.

### 28) How does your NestJS experience transfer?
NestJS modules, providers, constructor DI, `@Controller`/`@Get`, DTO + `ValidationPipe`, exception filters, guards and interceptors map 1:1 to Spring's configuration/beans, constructor injection, `@RestController`/`@GetMapping`, `@Valid` DTOs, `@RestControllerAdvice`, Security filters/`@PreAuthorize` and HandlerInterceptor/AOP. → Table in `java-spring-boot-essentials.md`.

---

## ➕ Traps and gotchas
- `@Transactional` on private methods or self-calls does nothing.
- Checked exceptions don't roll back by default.
- `@ManyToOne` is EAGER by default.
- Mutable state in singleton beans is a race condition.
- Missing `spring-boot-starter-validation` means `@Valid` is silently ignored.
- `javax.*` imports don't work on Boot 3.
- Disabling CSRF is only OK for stateless token APIs.
- Mentioning `WebSecurityConfigurerAdapter` or `@MockBean` as current dates you. Use `SecurityFilterChain` / `@MockitoBean`.
