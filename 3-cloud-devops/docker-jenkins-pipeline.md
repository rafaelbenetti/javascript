# Docker + Jenkins Pipeline for React + Spring Boot (→ ECR/ECS)

> Group 3 · Priority MEDIUM · Prep guide Q23 · Status: new file
> Real experience: Jenkins pipelines at CWI and EPAM (80% coverage gate). Docker on Benwer Cars.

## Say it in 30 seconds
"I containerise Spring Boot with a multi-stage Dockerfile: build with a JDK image, run on a slim JRE image as a non-root user, with Spring Boot layered jars so dependency layers cache well. The React app is built in Node and served from S3 and CloudFront, or nginx if containerised. The Jenkins declarative pipeline runs frontend and backend tests in parallel with coverage gates, then static analysis and dependency scans, builds the image tagged with the git SHA, pushes it to ECR, deploys to ECS, runs smoke tests, and promotes the same image to production after approval. I've run Jenkins pipelines since CWI, and at EPAM ours enforces an 80% coverage gate."

---

## 1. Docker core concepts
- **Image** = layered, read-only filesystem plus metadata. **Container** = a running instance (process with namespaces and cgroups). **Registry** = ECR / Docker Hub.
- **Layers** are cached in instruction order, so put rarely-changing steps (dependencies) **before** frequently-changing ones (source).
- **Multi-stage builds**: build tools stay out of the final image, so it's smaller and has less attack surface.
- `CMD` vs `ENTRYPOINT`: ENTRYPOINT is the executable and CMD supplies default args. Use exec form (`["java", "-jar"]`) so signals (SIGTERM) reach the JVM for graceful shutdown.
- `.dockerignore`: `node_modules`, `target`, `.git`, `.env`.
- Docker Compose for local dev (app + MySQL + LocalStack).

### Spring Boot Dockerfile (multi-stage, layered)
```dockerfile
# ---- build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -q dependency:go-offline            # cached unless pom.xml changes
COPY src src
RUN ./mvnw -q package -DskipTests              # tests ran in an earlier pipeline stage
RUN java -Djarmode=tools -jar target/*.jar extract --layers --launcher --destination extracted   # Boot 3.3+ (older: -Djarmode=layertools extract)

# ---- runtime ----
FROM eclipse-temurin:21-jre
RUN useradd --system --uid 1001 spring
USER spring
WORKDIR /app
COPY --from=build /app/extracted/dependencies/ ./
COPY --from=build /app/extracted/spring-boot-loader/ ./
COPY --from=build /app/extracted/snapshot-dependencies/ ./
COPY --from=build /app/extracted/application/ ./
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```
- Alternatives: `./mvnw spring-boot:build-image` (Cloud Native Buildpacks, no Dockerfile) or Jib.
- The JVM is container-aware (it reads cgroup limits), so size the heap with `MaxRAMPercentage`.
- Health check: ECS/ALB checks `/actuator/health`. In-container `HEALTHCHECK` is optional.

### React Dockerfile (when containerised instead of S3)
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf   # try_files $uri /index.html; cache headers
```
Remember that front-end env vars are baked in at build time and are public.

### Image hygiene
Pin base image versions (or digests), use minimal bases (JRE, distroless, alpine with care), run as non-root, scan images (ECR/Inspector, Trivy), never bake secrets into layers (they persist in history; use BuildKit `--secret`), and tag with the git SHA.

---

## 2. Jenkins core concepts
- **Controller** (schedules, UI) and **agents** (run builds: static nodes, Docker or Kubernetes/ECS ephemeral agents). Don't build on the controller.
- **Pipeline as code**: a `Jenkinsfile` in the repo. **Declarative** (structured, preferred) vs **scripted** (Groovy, flexible).
- **Multibranch pipeline**: one job per branch or PR, triggered by webhooks.
- **Credentials plugin**: secrets injected with `withCredentials`/`credentials()` and masked in logs. AWS access through an IAM role on the agent is better than stored keys.
- **Shared libraries**: reusable steps across repos (`@Library('ci-lib') _`).
- **Plugins**: JUnit (test reports), JaCoCo/Coverage, SonarQube (quality gate with `waitForQualityGate`), Docker Pipeline, Pipeline: AWS Steps, Slack.

### Declarative Jenkinsfile: React + Spring Boot → ECR → ECS
```groovy
pipeline {
  agent { label 'docker' }
  options { timestamps(); timeout(time: 30, unit: 'MINUTES'); disableConcurrentBuilds() }
  environment {
    AWS_REGION = 'eu-west-1'
    ECR_REPO   = '123456789012.dkr.ecr.eu-west-1.amazonaws.com/listing-api'
    IMAGE_TAG  = "${env.GIT_COMMIT.take(12)}"
  }
  stages {
    stage('Test') {
      parallel {
        stage('Frontend') {
          steps {
            dir('web') {
              sh 'npm ci'
              sh 'npm run lint && npx tsc --noEmit'
              sh 'npm test -- --coverage --ci'          // Jest coverageThreshold fails the build below 80%
            }
          }
        }
        stage('Backend') {
          steps { dir('api') { sh './mvnw -B verify' } } // unit + Testcontainers ITs + jacoco:check
          post  { always { junit 'api/target/surefire-reports/*.xml, api/target/failsafe-reports/*.xml' } }
        }
      }
    }
    stage('Quality & Security') {
      steps {
        withSonarQubeEnv('sonar') { sh 'cd api && ./mvnw -B sonar:sonar' }
        timeout(time: 5, unit: 'MINUTES') { waitForQualityGate abortPipeline: true }
        sh 'cd web && npm audit --audit-level=high'
      }
    }
    stage('Build & Push Image') {
      when { branch 'main' }
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO%/*}
          docker build -t $ECR_REPO:$IMAGE_TAG api
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }
    stage('Deploy UAT') {
      when { branch 'main' }
      steps {
        sh './ci/deploy-ecs.sh uat $IMAGE_TAG'          // new task-def revision + update-service + wait services-stable
        sh './ci/deploy-web.sh uat'                     // s3 sync + CloudFront invalidation
        sh 'npx playwright test --project=smoke'
      }
    }
    stage('Deploy PROD') {
      when { branch 'main' }
      steps {
        input message: 'Deploy to production?', ok: 'Deploy'
        sh './ci/deploy-ecs.sh prod $IMAGE_TAG'         // same image as UAT: build once, promote
        sh './ci/deploy-web.sh prod'
      }
    }
  }
  post {
    failure { slackSend channel: '#releases', message: "❌ ${env.JOB_NAME} #${env.BUILD_NUMBER}" }
    success { slackSend channel: '#releases', message: "✅ ${env.JOB_NAME} ${IMAGE_TAG}" }
  }
}
```
`deploy-ecs.sh` in essence: `aws ecs describe-task-definition` → swap the image → `register-task-definition` → `aws ecs update-service --task-definition <new>` → `aws ecs wait services-stable`. The ECS deployment circuit breaker rolls back automatically on failure.

### Rollback
- ECS: redeploy the previous task-definition revision (the previous SHA image is still in ECR), or let the circuit breaker roll back. Blue/green: shift traffic back.
- Front end: re-upload the previous build's `index.html` (hashed assets are still in S3).
- DB: forward-fix with a new migration. Expand/contract makes the app rollback safe.

---

## 3. Interview questions (spoken model answers)

**Q: Describe your CI/CD experience with Jenkins.**
"I've worked with Jenkins pipelines since CWI, where I **[set up and ran pipelines: add specifics]**, and at EPAM, where our pipelines run tests with an 80% coverage gate. I also built AI agent skills that automate much of release prep: Veracode remediation, Jira tickets and PRs, UAT deploys and production investigation. A pipeline I'd design for this stack is parallel front-end and back-end tests with coverage gates, a Sonar quality gate and dependency scanning, a Docker image tagged by commit and pushed to ECR, deploys to UAT with smoke tests, then manual approval and the same image to production with automatic rollback."

**Q: How do you make Docker images small and secure?**
"Multi-stage builds so the runtime has only a JRE and the app, Spring Boot layered jars for caching, pinned minimal base images, a non-root user, no secrets in layers, `.dockerignore`, and vulnerability scanning in ECR or with Trivy in the pipeline."

**Q: How do you keep pipelines fast?**
"Parallel stages, dependency caching (Maven repo, npm cache, Docker layer cache), running only affected tests where possible, ephemeral agents, and pushing slow suites (full E2E) to nightly or post-deploy stages. Fast feedback is the point of CI."

**Q: Declarative vs scripted pipelines?**
"Declarative has a fixed structure (stages, post, when, options), is easier to read and lint, and is the default. Scripted is free-form Groovy for complex logic, and you can embed `script {}` blocks in declarative when needed. Shared libraries keep repeated logic DRY across repos."

**Q: How do you handle secrets in Jenkins and Docker?**
"Jenkins Credentials with `withCredentials` (masked in logs), or better an IAM role on the agent for AWS. Never in the Jenkinsfile, image layers or build args. At runtime, ECS injects them from Secrets Manager."

**Q: What happens on `docker build` cache misses?**
"Every instruction after the first changed layer rebuilds. That's why dependency manifests are copied and installed before the source code: a code change then reuses the cached dependency layer."

---

## 4. Traps and gotchas
- `COPY . .` before installing dependencies means every code change reinstalls everything.
- Running as root in the container.
- Shell-form `ENTRYPOINT java -jar app.jar`: PID 1 is the shell, so SIGTERM never reaches the JVM and there's no graceful shutdown.
- `-Xmx` hard-coded larger than the container memory limit gets the container OOM-killed. Use `MaxRAMPercentage`.
- `latest` tags in production.
- Building on the Jenkins controller.
- `npm install` instead of `npm ci` in CI.
- Secrets passed with `--build-arg` are visible in image history.
