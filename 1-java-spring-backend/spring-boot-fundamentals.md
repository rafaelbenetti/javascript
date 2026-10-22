# Spring and Spring Boot: The Theory Before the Code

This primer covers the ideas behind Spring and Spring Boot, without any code. Read it before you write your first application, so the framework's behavior makes sense when you see it. Each section ends with a link to the file that goes deeper. The full map of files is in [spring-boot.md](spring-boot.md).

---

## 1. What Spring Is at Its Foundation

Spring is a framework for building Java applications. At its core it doesn't do web pages or databases. It does one thing: it **manages the objects your application is made of** and how they connect to each other. Everything else in the Spring ecosystem is built on that core.

- **Inversion of Control (IoC)**: instead of each piece of code creating the objects it needs, you describe what the application consists of, and the framework creates and connects the parts. The part of Spring that does this is the **IoC container**, also called the **application context**.
- **Beans**: every object the container manages is a bean. It's an ordinary object; what makes it a bean is that Spring is responsible for it. A bean's **scope** decides how many instances exist, and the default is one shared instance.
- **Dependency injection (DI)**: when one component needs another, it declares the need and the container supplies it. That gives loose coupling, easy testing with fakes, and dependencies stated in the open.
- **Lifecycle and proxies**: the container takes each bean through a fixed sequence from creation to shutdown. Along the way it may wrap the bean in an invisible **proxy** that adds behavior such as transactions, caching or security checks. This idea is called **aspect-oriented programming (AOP)**, and it explains many "why didn't this work?" surprises.
- **The ecosystem**: modules for the web, data, security, batch, messaging and distributed systems all share the same container and programming model.

→ Deeper: [core concepts, scopes, and the bean lifecycle](java-spring-boot-essentials.md#1-core-concepts)

---

## 2. What Spring Boot Adds on Top

Plain Spring is powerful but needs setup: choosing compatible library versions, wiring infrastructure, and running a web server. **Spring Boot is not a replacement for Spring.** It's a layer that removes that setup work.

- **Auto-configuration**: Boot looks at the libraries present, your settings, and the beans you've defined, and configures the infrastructure you're likely to need. It **backs off** when you define something yourself.
- **Starters**: one curated dependency bundle per capability, on top of a tested set of compatible versions.
- **Embedded server**: the application contains its own web server and runs as one self-contained package, which suits containers and the cloud.
- **Opinionated defaults**: server, logging, JSON and port all work immediately, and every default can be changed.
- **Production-ready features**: health checks, metrics and operational endpoints come built in.

→ Deeper: [how auto-configuration works](java-spring-boot-essentials.md#how-auto-configuration-works-internally) · [build and packaging](java-spring-boot-essentials.md#build-and-packaging)

---

## 3. The Main Capabilities, in One Line Each

- **Request pipeline**: a request passes through filters, then interceptors, then method-level aspects before your logic runs. Other frameworks call this middleware. → [Request pipeline](java-spring-boot-essentials.md#request-pipeline-filters-interceptors-and-aspects)
- **Web and REST**: HTTP requests are mapped to handlers, bodies are converted to and from JSON, input is validated, and errors get one consistent shape. The classic model uses one thread per request, and a reactive model exists for very high concurrency. → [MVC vs WebFlux vs virtual threads](java-spring-boot-essentials.md#mvc-vs-webflux-vs-virtual-threads)
- **Security**: a dedicated filter chain answers "who are you?" (authentication) and "what may you do?" (authorization). → [spring-security.md](spring-security.md)
- **Data access**: repositories, mapping objects to tables, and transactions that make a group of operations all-or-nothing. → [jpa-hibernate-transactions.md](jpa-hibernate-transactions.md)
- **Observability**: health, metrics, tracing and logs that let operators see inside the running application. → [Observability](java-spring-boot-essentials.md#observability)
- **Configuration**: settings live outside the code, in layers with a defined order of precedence, grouped into profiles per environment, with secrets kept out of source control. → [Configuration and profiles](java-spring-boot-essentials.md#configuration-and-profiles)
- **Testing**: fast tests of single layers and fewer full-application tests. → [spring-boot-testing.md](spring-boot-testing.md)
- **Distributed systems**: service discovery, gateways, central config and resilience through Spring Cloud. → [java-microservices.md](java-microservices.md)

---

## 4. Spring Boot vs. Plain Spring

| Concern | Plain Spring | Spring Boot |
|---|---|---|
| Setup | Manual configuration of infrastructure | Auto-configured, sensible defaults |
| Dependencies | Choose and align versions yourself | Starters plus a managed, compatible version set |
| Server | Install an external server and deploy to it | Embedded server, single runnable package |
| Time to first app | Hours | Minutes |
| Production readiness | Build monitoring yourself | Actuator included |
| Configuration | Scattered, often verbose | Centralized, externalized, profile-based |
| Flexibility | Full control | Full control, since every default can be overridden |

**The bottom line:** Spring Boot gives you the same power as Spring with far less ceremony. You only have to touch what's different about *your* application.

---

## 5. What to Understand Before Touching Code

1. **Java fundamentals**: classes, interfaces, inheritance, annotations as metadata, exceptions, and collections.
2. **The IoC and DI mindset**: you declare what a component needs and the framework provides it.
3. **Beans, scopes, and lifecycle**: who creates an object, how many copies exist, and when it starts and stops.
4. **Proxies and AOP**: behavior such as transactions is added around your code, and a call inside the same object bypasses it.
5. **Convention over configuration**: learn the defaults first, then override them deliberately.
6. **Layered architecture**: controllers, services and repositories, each depending only on the layer below.
7. **HTTP and REST basics**: methods, status codes, headers, JSON, and statelessness.
8. **Databases and transactions**: SQL fundamentals, relationships, and what atomicity means.
9. **Security fundamentals**: authentication versus authorization, and how sessions and tokens work.
10. **Build tools**: Maven or Gradle manage dependencies and produce the runnable package.
11. **Externalized configuration**: the same build is configured differently per environment, and secrets are never in code.
12. **Testing philosophy**: unit tests for logic, integration tests for wiring, and why DI makes both easier.

With these ideas in place, Spring's behavior stops feeling like magic: it's a container building and connecting your components, wrapping them with useful behavior, and configuring the infrastructure around them. When you're ready for depth, continue with [java-spring-boot-essentials.md](java-spring-boot-essentials.md).
