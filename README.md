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

## 2. React frontend ([folder](2-react-frontend/))
- [accessibility-responsive.md](2-react-frontend/accessibility-responsive.md): WCAG 2.2 AA, semantic HTML, ARIA rules, focus management, mobile-first CSS, container queries, responsive images, Core Web Vitals
- [frontend-build-tooling-webpack-eslint.md](2-react-frontend/frontend-build-tooling-webpack-eslint.md): Webpack loaders/plugins, code splitting, tree shaking, caching, Vite, ESLint flat config, npm/semver/npm ci
- [headless-cms-react.md](2-react-frontend/headless-cms-react.md): Headless CMS with React: content modelling, typed fetching, component map, caching and webhooks, preview, XSS
- [pre-processors.md](2-react-frontend/pre-processors.md): Corrected former PRE-PROCESSORS.md: SCSS Q&A updated to modern Sass (@use, math.div, sass:color) plus CSS Modules and BEM
- [react-testing-jest-rtl.md](2-react-frontend/react-testing-jest-rtl.md): Jest + RTL: query priority, userEvent, findBy/waitFor, MSW, providers, coverage gate, flaky-test tips
- [react.md](2-react-frontend/react.md): Corrected former REACT.md: 40 React Q&A with fixes (props re-render, Pages vs App Router) plus React 19, Compiler and the OneHome perf story
- [typescript.md](2-react-frontend/typescript.md): Corrected former TYPESCRIPT.md: 20 TS Q&A with fixes (never exhaustiveness, real template literal types) plus React + TS

## 3. Cloud & DevOps ([folder](3-cloud-devops/))
- [aws-fullstack-services.md](3-cloud-devops/aws-fullstack-services.md): Each JD AWS service in depth, GCP↔AWS bridge table, reference architecture, model answers
- [aws.md](3-cloud-devops/aws.md): Reworked former AWS.md: retargeted from Vanguard to the Applica stack (CloudFront, S3, Beanstalk, ECS/ECR, Lambda, SQS/SNS, Aurora) with honest GCP bridge
- [ci-cd.md](3-cloud-devops/ci-cd.md): Corrected former CI-CD.md: broken image fixed, Jenkins→ECR→ECS pipeline, quality gates, AI release-agent story, DORA
- [docker-jenkins-pipeline.md](3-cloud-devops/docker-jenkins-pipeline.md): Multi-stage Spring Boot and React Dockerfiles, declarative Jenkinsfile (tests, gates, ECR, ECS, approval), rollback
- [observability-newrelic-splunk.md](3-cloud-devops/observability-newrelic-splunk.md): Logs/metrics/traces, SLOs, New Relic APM and NRQL, Splunk SPL, CloudWatch, alerting, on-call flow

## 4. Architecture & security ([folder](4-architecture-security/))
- [architecture-patterns.md](4-architecture-security/architecture-patterns.md): Corrected former ARCHITECTURE-PATTERNS.md: examples moved to React/Spring/ECS/SQS/Aurora, Java outbox and hexagonal, resilience patterns, Favorites CQRS example
- [jwt.md](4-architecture-security/jwt.md): Corrected former JWT.md: fixed Angular functional interceptor, 401 + pinned algorithms in Express, React and Spring examples
- [owasp.md](4-architecture-security/owasp.md): Corrected former OWASP.md: updated to OWASP Top 10:2025, real SQL-injection example and fixes, Spring/React angle
- [security-data-privacy.md](4-architecture-security/security-data-privacy.md): Secure SDLC, React + Spring security checklist, GDPR essentials, privacy engineering, breach and erasure answers
- [storage-security.md](4-architecture-security/storage-security.md): Corrected former STORAGE-SECURITY.md: HttpOnly cookies are server-only, cookie attribute table, OIDC + PKCE, RBAC + ownership

## Not yet reorganised
- [ANGULAR.md](ANGULAR.md)
- [JAVASCRIPT-ECMAScript.md](JAVASCRIPT-ECMAScript.md)
- [JAVASCRIPT-QUESTIONS.md](JAVASCRIPT-QUESTIONS.md)
- [JAVASCRIPT.md](JAVASCRIPT.md)
- [LEADERSHIP.md](LEADERSHIP.md)
- [NEXTJS.md](NEXTJS.md)
- [NODEJS.md](NODEJS.md)
- [OVERVIEW.md](OVERVIEW.md)
- [RxJS.md](RxJS.md)

## Code snippets
- [src/](src/): small runnable ES5/ES2015 snippets (hoisting, scope, closures, `this`, prototypes)
