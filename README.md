# JavaScript / Fullstack interview study notes

Personal study notes for full-stack interviews: JavaScript, TypeScript, React, Java/Spring Boot, AWS, DevOps, architecture and security.
Every topic file starts with a **Say it in 30 seconds** summary, then core concepts with short code, interview Q&A and traps.
Files that came from the original notes were corrected in place: changes are marked **✏️ FIXED** / **➕ ADDED** and each file has a changelog at the top.

## 1. Java & Spring backend ([folder](1-java-spring-backend/))
- [java-8-to-21-features.md](1-java-spring-backend/java-8-to-21-features.md): Java 8/11/17/21 features (streams, records, sealed, pattern matching, virtual threads) plus core Java
- [java-spring-boot-essentials.md](1-java-spring-backend/java-spring-boot-essentials.md): DI/IoC, REST endpoint with validation and ProblemDetail, Spring Security 6, config, NestJS ↔ Spring mapping
- [jpa-hibernate-transactions.md](1-java-spring-backend/jpa-hibernate-transactions.md): Entities, lazy vs eager, N+1 fixes, LazyInitializationException, @Transactional rules, locking, migrations
- [mysql-aurora-sql-performance.md](1-java-spring-backend/mysql-aurora-sql-performance.md): Indexes, EXPLAIN, sargable queries, keyset pagination, InnoDB isolation and locking, Aurora MySQL
- [rest-api-design.md](1-java-spring-backend/rest-api-design.md): Resources, verbs, status codes, ProblemDetail, pagination, idempotency keys, versioning, OpenAPI, CORS
- [spring-boot-testing.md](1-java-spring-backend/spring-boot-testing.md): JUnit 5, Mockito, @WebMvcTest, @DataJpaTest, Testcontainers with @ServiceConnection, JaCoCo gate
- [spring-boot.md](1-java-spring-backend/spring-boot.md): Corrected former SPRING-BOOT.md: 20 Spring Q&A with fixes (scopes, Security 6, transactions, ProblemDetail) plus 8 added questions

## Not yet reorganised
- [ANGULAR.md](ANGULAR.md)
- [ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)
- [AWS.md](AWS.md)
- [CI-CD.md](CI-CD.md)
- [JAVASCRIPT-ECMAScript.md](JAVASCRIPT-ECMAScript.md)
- [JAVASCRIPT-QUESTIONS.md](JAVASCRIPT-QUESTIONS.md)
- [JAVASCRIPT.md](JAVASCRIPT.md)
- [JWT.md](JWT.md)
- [LEADERSHIP.md](LEADERSHIP.md)
- [NEXTJS.md](NEXTJS.md)
- [NODEJS.md](NODEJS.md)
- [OVERVIEW.md](OVERVIEW.md)
- [OWASP.md](OWASP.md)
- [PRE-PROCESSORS.md](PRE-PROCESSORS.md)
- [REACT.md](REACT.md)
- [RxJS.md](RxJS.md)
- [STORAGE-SECURITY.md](STORAGE-SECURITY.md)
- [TYPESCRIPT.md](TYPESCRIPT.md)

## Code snippets
- [src/](src/): small runnable ES5/ES2015 snippets (hoisting, scope, closures, `this`, prototypes)
