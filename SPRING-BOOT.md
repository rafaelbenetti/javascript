# 🌱 Spring (Java) Prep — Overview + Top 20 Interview Q&A

---

## 📖 Quick Overview

- **Spring Framework** → Java framework for building enterprise apps.
- **Spring Boot** → opinionated extension of Spring for **rapid development** with minimal configuration.

### 🔹 Core Features

- **Dependency Injection (DI)** → Inversion of Control (IoC) container.
- **Aspect-Oriented Programming (AOP)** → cross-cutting concerns (logging, security).
- **Spring MVC** → Model-View-Controller web apps.
- **Spring Data JPA** → data access layer.
- **Spring Security** → authentication, authorization, JWT, OAuth2.
- **Spring Boot Starters** → pre-configured dependencies.
- **Spring Actuator** → production monitoring endpoints.
- **Spring Cloud** → microservices, service discovery, config server, circuit breakers.

### 🔹 Benefits

- Loose coupling via DI.
- Convention over configuration.
- Huge ecosystem.
- Cloud-native & microservice friendly.

---

## ❓ Top 20 Questions & Answers

### 1) What is the difference between Spring and Spring Boot?

- **Spring** → full framework, lots of XML/Java config.
- **Spring Boot** → simplifies setup with auto-configuration, embedded server (Tomcat/Jetty), opinionated defaults.

---

### 2) Explain Dependency Injection (DI) in Spring.

- Design pattern → objects depend on abstractions, not implementations.
- Spring container injects dependencies via:
  - **Constructor Injection** (preferred).
  - **Setter Injection**.
  - **Field Injection** (not recommended).

---

### 3) What is Inversion of Control (IoC) in Spring?

- Principle where object creation is delegated to container instead of hard-coding with `new`.
- Managed by **ApplicationContext** in Spring.

---

### 4) What are Spring Boot Starters?

- Pre-built dependency descriptors for common use cases.
- Example: `spring-boot-starter-web` (Tomcat, MVC, JSON).  
  👉 Save time, reduce boilerplate config.

---

### 5) What are Spring Boot Actuators?

- Provide production-ready endpoints for health, metrics, logging.
- Example: `/actuator/health`, `/actuator/metrics`.

---

### 6) Explain Spring Profiles.

- Allow environment-specific beans/configs (`dev`, `test`, `prod`).
- Example:

```java
@Profile("dev")
@Bean
public DataSource devDataSource() { ... }
```

---

### 7) What are the different types of bean scopes in Spring?

- **singleton** (default) → one per container.
- **prototype** → new instance per request.
- **request** → per HTTP request.
- **session** → per HTTP session.
- **application** → per ServletContext lifecycle.

---

### 8) What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?

- All are **stereotype annotations** → register beans.
- `@Component` → generic bean.
- `@Service` → business logic.
- `@Repository` → data access layer, adds exception translation.
- `@Controller` → MVC controller.

---

### 9) How does Spring Boot handle embedded servers?

- By default → **Tomcat**.
- Also supports Jetty, Undertow.
- No need for WAR deployment → just run `java -jar app.jar`.

---

### 10) How does Spring Security work?

- Handles authentication & authorization.
- Integrates with JWT, OAuth2, LDAP.
- Uses **filters** in security chain.
- Example: `UsernamePasswordAuthenticationFilter`.

---

### 11) What is Spring Data JPA?

- Abstraction over JPA/Hibernate.
- Provides `CrudRepository`, `JpaRepository`.
- Supports query methods like:

```java
List<User> findByLastName(String lastName);
```

---

### 12) How does Spring handle transactions?

- With `@Transactional`.
- Supports propagation (REQUIRED, REQUIRES_NEW, etc.) and isolation levels.

---

### 13) What is AOP in Spring?

- Aspect-Oriented Programming → separate cross-cutting concerns.
- Example: Logging, Security, Caching.
- Key concepts: Aspect, JoinPoint, Advice, Pointcut.

---

### 14) What are the different types of advice in Spring AOP?

- **Before** → runs before method.
- **After Returning** → after method returns.
- **After Throwing** → after exception.
- **Around** → wraps method execution.

---

### 15) How does Spring Boot handle configuration?

- YAML or `application.properties`.
- Config precedence: command line > env vars > properties file > defaults.

---

### 16) How does Spring Boot support microservices?

- Via **Spring Cloud**:
  - Eureka (service discovery).
  - API Gateway (routing).
  - Config Server (central config).
  - Resilience4J (circuit breaker).

---

### 17) What is the difference between RestController and Controller?

- `@Controller` → returns view (HTML/JSP).
- `@RestController` = `@Controller + @ResponseBody` → returns JSON/XML.

---

### 18) How does Spring Boot handle exception handling?

- With `@ControllerAdvice` + `@ExceptionHandler`.
- Example:

```java
@ControllerAdvice
class GlobalExceptionHandler {
   @ExceptionHandler(Exception.class)
   ResponseEntity<String> handle(Exception ex) { ... }
}
```

---

### 19) How do you secure REST APIs with JWT in Spring Boot?

- Filter intercepts request → extracts JWT from header → validates.
- On success → Authentication object placed in SecurityContext.

---

### 20) What are common Spring Boot production best practices?

- Use Actuator for monitoring.
- Externalize configs.
- Secure endpoints with HTTPS & Spring Security.
- Containerize (Docker, K8s).
- Enable centralized logging (ELK, Splunk).

---
