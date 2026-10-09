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
- [assets/](4-architecture-security/assets/): Diagrams for session-cookie vs JWT authorization flows
- [jwt.md](4-architecture-security/jwt.md): Corrected former JWT.md: fixed Angular functional interceptor, 401 + pinned algorithms in Express, React and Spring examples
- [owasp.md](4-architecture-security/owasp.md): Corrected former OWASP.md: updated to OWASP Top 10:2025, real SQL-injection example and fixes, Spring/React angle
- [security-data-privacy.md](4-architecture-security/security-data-privacy.md): Secure SDLC, React + Spring security checklist, GDPR essentials, privacy engineering, breach and erasure answers
- [storage-security.md](4-architecture-security/storage-security.md): Corrected former STORAGE-SECURITY.md: HttpOnly cookies are server-only, cookie attribute table, OIDC + PKCE, RBAC + ownership

## 5. JavaScript & Node fundamentals ([folder](5-js-node-fundamentals/))
- [adobe-analytics-target-video.md](5-js-node-fundamentals/adobe-analytics-target-video.md): ➕ Data layer, Adobe Analytics/Web SDK (Mixpanel bridge), Target A/B without flicker, consent, HLS/DASH video
- [assets/](5-js-node-fundamentals/assets/): Diagrams used by javascript.md (single thread, sync/async, callback queue)
- [javascript-ecmascript.md](5-js-node-fundamentals/javascript-ecmascript.md): ✏️ Corrected: ES2015–ES2025 feature tour with fixed examples (padStart, classes, generators, flatMap)
- [javascript-questions.md](5-js-node-fundamentals/javascript-questions.md): ✏️ Corrected: 40 core JS Q&A (TDZ, hoisting, event loop, ES2022 fixes) + ES2023–25 and output puzzles
- [javascript.md](5-js-node-fundamentals/javascript.md): ✏️ Corrected: JS basics (dynamic typing, JIT, event loop, hoisting/TDZ, closures, prototypes, currying vs partial application)
- [leadership.md](5-js-node-fundamentals/leadership.md): 30 team-lead Q&A plus a STAR table tying them to your real stories
- [nodejs.md](5-js-node-fundamentals/nodejs.md): ✏️ Corrected: Node event loop phases, libuv thread pool vs network I/O, ESM/require(esm), NestJS ↔ Spring bridge
- [overview.md](5-js-node-fundamentals/overview.md): ✏️ Corrected former other/overview.md (team-lead tech primer, kept beside the leadership Q&A): trunk-based branching, test pyramid vs trophy, observability pillars and OpenTelemetry, DORA metrics
- [src/](5-js-node-fundamentals/src/): Small runnable ES5/ES2015 snippets (hoisting, scope, closures, `this`, prototypes)

## 6. Frontend frameworks extras ([folder](6-frontend-frameworks-extras/))
- [angular.md](6-frontend-frameworks-extras/angular.md): ✏️ Corrected former other/angular.md: standalone-by-default (v19), `@if`/`@for`, functional interceptors and guards, signals timeline, zoneless (default for new apps in v21), OnPush-by-default and Signal Forms (v22). Not the Applica stack
- [nextjs.md](6-frontend-frameworks-extras/nextjs.md): ✏️ Corrected former other/nextjs.md: App Router vs Pages Router, Server Components, Server Actions, `getServerSideProps` marked legacy, caching in Next 15 and Cache Components in 16/16.4
- [rxjs.md](6-frontend-frameworks-extras/rxjs.md): ✏️ Corrected former other/rxjs.md: RxJS 7 (v8 is not stable), `toPromise` deprecated for `firstValueFrom`/`lastValueFrom`, imports from `rxjs`, signal interop (`toSignal`/`toObservable`)
