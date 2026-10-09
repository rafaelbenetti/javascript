# JavaScript / Fullstack interview study notes

Personal study notes for full-stack interviews: JavaScript, TypeScript, React, Java/Spring Boot, AWS, DevOps, architecture and security.
Every topic file starts with a **Say it in 1 minute** summary, then core concepts with short code, interview Q&A and traps.

## 1. Java & Spring backend ([folder](1-java-spring-backend/))
- [java-8-to-21-features.md](1-java-spring-backend/java-8-to-21-features.md): Java 8/11/17/21 features (streams, records, sealed, pattern matching, virtual threads) plus core Java
- [java-spring-boot-essentials.md](1-java-spring-backend/java-spring-boot-essentials.md): DI/IoC, REST endpoint with validation and ProblemDetail, Spring Security 6, config, NestJS ↔ Spring mapping
- [jpa-hibernate-transactions.md](1-java-spring-backend/jpa-hibernate-transactions.md): Entities, lazy vs eager, N+1 fixes, LazyInitializationException, @Transactional rules, locking, migrations
- [mysql-aurora-sql-performance.md](1-java-spring-backend/mysql-aurora-sql-performance.md): Indexes, EXPLAIN, sargable queries, keyset pagination, InnoDB isolation and locking, Aurora MySQL
- [rest-api-design.md](1-java-spring-backend/rest-api-design.md): Resources, verbs, status codes, ProblemDetail, pagination, idempotency keys, versioning, OpenAPI, CORS
- [spring-boot-testing.md](1-java-spring-backend/spring-boot-testing.md): JUnit 5, Mockito, @WebMvcTest, @DataJpaTest, Testcontainers with @ServiceConnection, JaCoCo gate
- [spring-boot.md](1-java-spring-backend/spring-boot.md): Spring Q&A on scopes, Security 6, transactions, and ProblemDetail, plus validation, DTOs, N+1, testing, Boot 3, and the NestJS bridge

## 2. React frontend ([folder](2-react-frontend/))
- [accessibility-responsive.md](2-react-frontend/accessibility-responsive.md): WCAG 2.2 AA, semantic HTML, ARIA rules, focus management, mobile-first CSS, container queries, responsive images, Core Web Vitals
- [frontend-build-tooling-webpack-eslint.md](2-react-frontend/frontend-build-tooling-webpack-eslint.md): Webpack loaders/plugins, code splitting, tree shaking, caching, Vite, ESLint flat config, npm/semver/npm ci
- [headless-cms-react.md](2-react-frontend/headless-cms-react.md): Headless CMS with React: content modelling, typed fetching, component map, caching and webhooks, preview, XSS
- [pre-processors.md](2-react-frontend/pre-processors.md): SCSS Q&A on modern Sass (@use, math.div, sass:color) plus CSS Modules and BEM
- [react-testing-jest-rtl.md](2-react-frontend/react-testing-jest-rtl.md): Jest + RTL: query priority, userEvent, findBy/waitFor, MSW, providers, coverage gate, flaky-test tips
- [react.md](2-react-frontend/react.md): React Q&A on props and re-renders, Pages vs App Router, React 19, the Compiler, and the OneHome performance story
- [typescript.md](2-react-frontend/typescript.md): TypeScript Q&A on never exhaustiveness and template literal types, plus React with TypeScript

## 3. Cloud & DevOps ([folder](3-cloud-devops/))
- [aws-fullstack-services.md](3-cloud-devops/aws-fullstack-services.md): Each JD AWS service in depth, GCP↔AWS bridge table, reference architecture, model answers
- [aws.md](3-cloud-devops/aws.md): Applica stack (CloudFront, S3, Beanstalk, ECS/ECR, Lambda, SQS/SNS, Aurora) with an honest GCP bridge
- [ci-cd.md](3-cloud-devops/ci-cd.md): Jenkins→ECR→ECS pipeline, quality gates, the AI release-agent story, and DORA
- [docker-jenkins-pipeline.md](3-cloud-devops/docker-jenkins-pipeline.md): Multi-stage Spring Boot and React Dockerfiles, declarative Jenkinsfile (tests, gates, ECR, ECS, approval), rollback
- [observability-newrelic-splunk.md](3-cloud-devops/observability-newrelic-splunk.md): Logs/metrics/traces, SLOs, New Relic APM and NRQL, Splunk SPL, CloudWatch, alerting, on-call flow

## 4. Architecture & security ([folder](4-architecture-security/))
- [architecture-patterns.md](4-architecture-security/architecture-patterns.md): React, Spring, ECS, SQS, and Aurora examples, a Java outbox, hexagonal architecture, resilience patterns, and the Favorites CQRS example
- [jwt.md](4-architecture-security/jwt.md): Angular functional interceptor, 401 responses with pinned algorithms in Express, plus React and Spring examples
- [owasp.md](4-architecture-security/owasp.md): OWASP Top 10:2025, a SQL-injection example, and the Spring and React angle
- [security-data-privacy.md](4-architecture-security/security-data-privacy.md): Secure SDLC, React + Spring security checklist, GDPR essentials, privacy engineering, breach and erasure answers
- [storage-security.md](4-architecture-security/storage-security.md): HttpOnly cookies are server-only, a cookie attribute table, OIDC with PKCE, and RBAC plus ownership

## 5. JavaScript & Node fundamentals ([folder](5-js-node-fundamentals/))
- [adobe-analytics-target-video.md](5-js-node-fundamentals/adobe-analytics-target-video.md): Data layer, Adobe Analytics and the Web SDK (Mixpanel bridge), Target A/B without flicker, consent, and HLS/DASH video
- [javascript-ecmascript.md](5-js-node-fundamentals/javascript-ecmascript.md): ES2015–ES2025 feature tour (padStart, classes, generators, flatMap)
- [javascript-questions.md](5-js-node-fundamentals/javascript-questions.md): Core JavaScript Q&A (TDZ, hoisting, the event loop) plus ES2023–25 and output puzzles
- [javascript.md](5-js-node-fundamentals/javascript.md): JavaScript basics (dynamic typing, JIT, the event loop, hoisting and the TDZ, closures, prototypes, currying and partial application)
- [leadership.md](5-js-node-fundamentals/leadership.md): 30 team-lead Q&A plus a STAR table tying them to your real stories
- [nodejs.md](5-js-node-fundamentals/nodejs.md): Node event-loop phases, the libuv thread pool versus network I/O, ESM and require(esm), and the NestJS to Spring bridge
- [overview.md](5-js-node-fundamentals/overview.md): Team-lead tech primer beside the leadership Q&A: trunk-based branching, the test pyramid and the testing trophy, observability pillars and OpenTelemetry, and DORA metrics

## 6. Frontend frameworks extras ([folder](6-frontend-frameworks-extras/))
- [angular.md](6-frontend-frameworks-extras/angular.md): Standalone by default (v19), `@if`/`@for`, functional interceptors and guards, the signals timeline, zoneless new apps in v21, OnPush by default and Signal Forms in v22. Not the Applica stack
- [nextjs.md](6-frontend-frameworks-extras/nextjs.md): App Router and Pages Router, Server Components, Server Actions, `getServerSideProps` on the Pages Router, caching in Next 15, and Cache Components in 16 and 16.4
- [rxjs.md](6-frontend-frameworks-extras/rxjs.md): RxJS 7 (v8 is not stable), `toPromise` deprecated for `firstValueFrom` and `lastValueFrom`, imports from `rxjs`, and signal interop with `toSignal` and `toObservable`
