# 🌱 Spring (Java) Prep — Index + Interview Q&A

> Group 1 · Priority HIGH
> This file is the index and the short spoken answers. Each answer links to the one file that explains the topic in depth.

## Where everything lives

| File | Its one job |
|---|---|
| [spring-boot-fundamentals.md](spring-boot-fundamentals.md) | Code-free primer: read this first |
| [java-spring-boot-essentials.md](java-spring-boot-essentials.md) | Core concepts: IoC, DI, stereotypes, scopes, bean lifecycle and proxies, auto-configuration, configuration and profiles, build and packaging, request pipeline, REST and errors, MVC vs WebFlux, observability, the NestJS bridge, and the OneHome STAR story |
| [spring-security.md](spring-security.md) | Authentication, authorization, the filter chain, JWT, passwords, sessions vs tokens, CORS, CSRF, method security, ownership |
| [jpa-hibernate-transactions.md](jpa-hibernate-transactions.md) | Entities, persistence context, Spring Data, N+1, `@Transactional` rules, locking, migrations |
| [spring-boot-testing.md](spring-boot-testing.md) | Unit tests, slices, Testcontainers, integration tests, coverage gates |
| [java-microservices.md](java-microservices.md) | Microservices, Spring Cloud, sagas, resilience, tracing across services |

## Say it in 1 minute
"Spring Boot is Spring with the decisions already made: auto-configuration, starters, and an embedded server, so the service is one jar. The IoC container creates the beans and wires them through the constructor, which keeps dependencies visible and lets a unit test pass fakes. A request comes through the security filter chain, a thin RestController that validates a DTO, a transactional service, and a Spring Data JPA repository. Errors are mapped once, in a RestControllerAdvice that returns ProblemDetail. Boot 3 needs Java 17 or newer and the jakarta namespace. My day-to-day backend is NestJS: modules, dependency injection, decorators, and guards. The end-to-end example I use is OneHome Favorites and sentiments, one endpoint filtered by sentiment, an Elasticsearch read model fed by Kafka, and a sync back to the external MLS. The STAR write-up is in the essentials notes."

### Current versions (Oct 2026)
- **Spring Boot 3.x** requires **Java 17+** and Jakarta EE (`javax.*` → `jakarta.*`). Spring Boot 4 / Spring Framework 7 were released in Nov 2025, but most production code you'll meet is 3.x.
- Java 21 LTS brings virtual threads (Boot 3.2+).

---

## ❓ Top 20 Questions & Answers

### 1) What is the difference between Spring and Spring Boot?
Spring is the framework: the IoC container plus modules for web, data, security and more. Spring Boot is an opinionated layer on top that removes setup work: auto-configuration that registers sensible beans based on the classpath and backs off when you define your own, starters with a managed set of compatible versions, an embedded server, and Actuator. Modern plain Spring is configured in Java too, so the real difference isn't XML versus annotations. It's that with Boot you only configure what's different about your application. → [Auto-configuration internals](java-spring-boot-essentials.md#how-auto-configuration-works-internally)

### 2) Explain Dependency Injection (DI).
A class declares what it needs, and the container supplies it, instead of the class creating its own collaborators. Constructor injection is preferred: dependencies are explicit and `final`, the object is never half-built, and a unit test can pass mocks directly. Setter injection suits optional dependencies. Field injection hides dependencies and should be avoided. → [IoC and DI](java-spring-boot-essentials.md#ioc-and-di)

### 3) What is Inversion of Control (IoC)?
The principle that object creation and wiring move from your code to the container. The `ApplicationContext` scans for bean definitions at startup, creates singletons in dependency order, and caches them, so later requests reuse the same instances. → [IoC and DI](java-spring-boot-essentials.md#ioc-and-di)

### 4) What are Spring Boot Starters?
Dependency bundles, one per capability, such as web, data JPA, validation, security, OAuth2 resource server, Actuator and test. A starter contains no logic. It puts libraries on the classpath, and auto-configuration reacts to them. That's why forgetting the validation starter means `@Valid` is silently ignored. → [Build and packaging](java-spring-boot-essentials.md#build-and-packaging)

### 5) What are Spring Boot Actuators?
Production endpoints for health (with liveness and readiness for load balancer and container probes), info, metrics and Prometheus. Expose only an explicit list, secure the management endpoints separately, and never expose env or heapdump publicly. → [Observability](java-spring-boot-essentials.md#observability)

### 6) Explain Spring Profiles.
A profile is a named layer of configuration, such as dev or prod, activated with `SPRING_PROFILES_ACTIVE`. The recommended approach is profile-specific property files, `application-prod.yml`, so every environment runs the same beans with different values. `@Profile` on a bean is reserved for the rare case where a whole implementation must change, such as a fake mail sender locally. → [Configuration and profiles](java-spring-boot-essentials.md#configuration-and-profiles)

### 7) What are the bean scopes?
Singleton (the default, one per container, so it must be stateless or thread-safe), prototype (a new instance per injection or lookup), and the web scopes request, session and application. → [Scopes](java-spring-boot-essentials.md#scopes)

### 8) `@Component` vs `@Service` vs `@Repository` vs `@Controller`?
All four register a bean. `@Component` is generic, `@Service` is a semantic label with no extra behaviour, `@Repository` adds translation of persistence exceptions into `DataAccessException`, and `@Controller` marks the web layer. → [Stereotypes](java-spring-boot-essentials.md#stereotypes)

### 9) How does Spring Boot handle embedded servers?
Tomcat by default, with Jetty and Undertow as options. The server runs inside the application process, started from `main`, so the app is one executable jar run with `java -jar`. That makes it container-friendly: one Dockerfile, deployed to ECS or Kubernetes. → [Build and packaging](java-spring-boot-essentials.md#build-and-packaging)

### 10) How does Spring Security work?
It's a chain of servlet filters in front of the DispatcherServlet. A filter authenticates the request and stores the result in the SecurityContext. URL rules and method security then authorize it, and failures become 401 or 403 before any controller runs. In Spring Security 6 you configure it with a `SecurityFilterChain` bean. → [spring-security.md](spring-security.md)

### 11) What is Spring Data JPA?
An abstraction over JPA and Hibernate. You write a repository interface and Spring generates the implementation at startup: derived queries from method names, `@Query` for JPQL or native SQL, entity graphs, projections and paging. → [Spring Data JPA](jpa-hibernate-transactions.md#spring-data-jpa)

### 12) How does Spring handle transactions?
Declaratively with `@Transactional` on service methods, applied by a proxy. Know propagation (REQUIRED joins or creates, REQUIRES_NEW runs independently), isolation, that only unchecked exceptions roll back by default, and that self-calls and private methods bypass the proxy. → [`@Transactional` rules](jpa-hibernate-transactions.md#transactional) · [why self-calls skip the proxy](java-spring-boot-essentials.md#bean-lifecycle-and-proxies)

### 13) What is AOP in Spring?
Aspect-oriented programming applies a cross-cutting concern, such as transactions, caching, security or logging, to many methods without repeating it. Spring AOP is proxy-based, so it only applies to calls that enter through the proxy. Key terms: aspect, pointcut, join point, advice. → [Bean lifecycle and proxies](java-spring-boot-essentials.md#bean-lifecycle-and-proxies)

### 14) What are the types of advice?
Before, after returning, after throwing, after (finally), and around. Around wraps the call and can act on both the result and the exception, which is why transactions use it. → [AOP in one paragraph](java-spring-boot-essentials.md#bean-lifecycle-and-proxies)

### 15) How does Spring Boot handle configuration?
It merges property sources into one `Environment`, highest first: command-line args, Java system properties, OS env vars, profile-specific files outside the jar, profile-specific files inside the jar, application files outside the jar, application files inside the jar, `@PropertySource`, defaults. Bind groups of settings to a typed `@ConfigurationProperties` record, and keep secrets in env vars or a secrets manager. → [Configuration and profiles](java-spring-boot-essentials.md#configuration-and-profiles)

### 16) How does Spring Boot support microservices?
Boot makes each service a small self-contained jar with health checks and metrics. Spring Cloud adds discovery (Eureka or Consul), a gateway, central config and Resilience4j. On AWS, platform features often replace the Spring Cloud pieces: ECS Service Connect or an ALB for discovery, API Gateway for routing, SSM or Secrets Manager for config. Resilience4j and tracing stay in the code. → [java-microservices.md](java-microservices.md)

### 17) `@RestController` vs `@Controller`?
`@Controller` returns a view name to render. `@RestController` is `@Controller` plus `@ResponseBody`, so return values are serialised to JSON by a message converter. → [Stereotypes](java-spring-boot-essentials.md#stereotypes)

### 18) How do you handle exceptions?
One `@RestControllerAdvice` with `@ExceptionHandler` methods that map specific exceptions to statuses and return `ProblemDetail` (RFC 9457), plus a last-resort handler that logs and hides internals. The front end then has one error shape. → [Global error handling](java-spring-boot-essentials.md#global-error-handling-spring-6-problemdetail-rfc-9457)

### 19) How do you secure REST APIs with JWT?
Use the OAuth2 resource-server support instead of a hand-written filter. It fetches the issuer's JWKS, verifies the signature, checks exp and iss, and you add an audience check. The result goes into the SecurityContext, and nothing decodes the token again. → [JWT and OAuth2 resource servers](spring-security.md#4-jwt-and-oauth2-resource-servers)

### 20) What are production best practices?
Actuator health and metrics, externalized config and secrets, HTTPS and Spring Security, containers, structured JSON logs with trace ids, timeouts on every outbound call, graceful shutdown, Flyway migrations with `ddl-auto=validate`, a sized connection pool, and dependency scanning in CI. → [Observability](java-spring-boot-essentials.md#observability) · [Other features](java-spring-boot-essentials.md#other-features-worth-knowing)

---

## More questions

### 21) How do you validate input?
`spring-boot-starter-validation` + `@Valid @RequestBody` on a record DTO with `@NotBlank`, `@Size`, `@Positive`, `@Email`. Failures throw `MethodArgumentNotValidException` → 400 with field errors. The check runs in the argument resolver, before your method, so a bad body never reaches the service. Use `@Validated` on the class for `@PathVariable`/`@RequestParam` constraints. It's the same idea as NestJS `ValidationPipe` + class-validator. → [A REST endpoint end to end](java-spring-boot-essentials.md#a-rest-endpoint-end-to-end)

### 22) Why DTOs instead of returning entities?
Decouple the API from the schema, avoid leaking fields, avoid `LazyInitializationException` and JSON recursion, and allow different read and write shapes. Java `record`s make them one line.

### 23) What is the N+1 problem?
Loading N parents and then lazily loading a relation on each one gives N extra queries. Fix with `JOIN FETCH` / `@EntityGraph`, batch fetching, or DTO projections, and remember `@ManyToOne` is EAGER by default. → [The N+1 problem](jpa-hibernate-transactions.md#the-n1-problem)

### 24) What is `LazyInitializationException`?
Touching a lazy relation after the session closed, typically during JSON serialisation. Fetch inside the transactional service and map to DTOs. Open-in-view hides it, and many teams disable it. → [jpa-hibernate-transactions.md](jpa-hibernate-transactions.md#lazyinitializationexception)

### 25) How do you test Spring Boot apps?
JUnit 5 + Mockito for services with no Spring context, `@WebMvcTest` for controllers, `@DataJpaTest` with Testcontainers for queries, a few `@SpringBootTest` flows, and a JaCoCo gate in Jenkins. → [spring-boot-testing.md](spring-boot-testing.md)

### 26) What changed in Spring Boot 3?
Java 17 baseline, `javax` → `jakarta` (the Java EE packages moved; old `javax.persistence` imports do not compile), Spring Security 6 (`SecurityFilterChain` only, the adapter class was removed), ProblemDetail support, Micrometer Observation/Tracing (Sleuth replaced), GraalVM native images, `RestClient` (3.2), virtual threads (3.2), `@ServiceConnection`/Docker Compose support (3.1). Boot 4 exists. Most code you'll be shown is still 3.x.

### 27) Virtual threads in Spring?
`spring.threads.virtual.enabled=true` (Boot 3.2+, Java 21) runs each request on a cheap virtual thread that unmounts while it blocks on I/O. Good for I/O-bound services, not CPU work, and the DB pool stays the limit. → [MVC vs WebFlux vs virtual threads](java-spring-boot-essentials.md#mvc-vs-webflux-vs-virtual-threads)

### 28) How does your NestJS experience transfer?
NestJS modules, providers, constructor DI, `@Controller`/`@Get`, DTO + `ValidationPipe`, exception filters, guards and interceptors map 1:1 to Spring's configuration/beans, constructor injection, `@RestController`/`@GetMapping`, `@Valid` DTOs, `@RestControllerAdvice`, Security filters/`@PreAuthorize` and HandlerInterceptor/AOP. → [NestJS ↔ Spring bridge](java-spring-boot-essentials.md#nestjs--spring-bridge-your-strongest-card)

### 29) Filter vs interceptor vs aspect?
Filters run at the server level for HTTP-wide concerns, interceptors run inside Spring MVC and know the handler, and aspects wrap bean methods regardless of how they were called. → [Request pipeline](java-spring-boot-essentials.md#request-pipeline-filters-interceptors-and-aspects)

### 30) What's the bean lifecycle?
Definition, instantiation, injection, Aware callbacks, post-processors, `@PostConstruct`, proxy creation, use, `@PreDestroy`. → [Bean lifecycle and proxies](java-spring-boot-essentials.md#bean-lifecycle-and-proxies)

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
