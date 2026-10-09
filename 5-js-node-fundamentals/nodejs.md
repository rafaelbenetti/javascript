# 🟢 Node.js Prep — Top 20 Interview Q&A

> Group 5 · Priority LOW–MEDIUM (bridge for backend talk: NestJS ≈ Spring)

## Say it in 1 minute
"Node runs JavaScript on V8, and libuv gives it an event loop plus non-blocking I/O, so one thread can hold thousands of connections as long as CPU work does not block it. That kind of work goes to worker threads or to another service. Network I/O uses the operating system and does not sit on the libuv thread pool. The file system, dns.lookup, and some crypto calls do, which is the distinction I like to be able to draw. On the backend I have mostly used NestJS, and it is structured the way Spring is: modules, providers with constructor injection, controllers, validation pipes, guards, and exception filters. That is why Spring Boot feels familiar. I built the Benwer Cars backend that way, NestJS and Postgres through Drizzle **[confirm scope]**. The habits carry over: a thin controller, validation at the boundary, and no heavy synchronous work on the request path."


---

## 📖 Quick Overview

- **Node.js** = JavaScript runtime on **V8 engine**, built for **non-blocking I/O**.
- **Single-threaded, event-driven** → excellent for APIs, real-time apps, streaming.
- Uses **libuv** for async ops, thread pool, event loop.
- Key concepts: **Event loop, Streams, Buffers, Modules, Middleware, Clusters, Workers**.

---

## ❓ Top 20 Questions & Answers

### 1) What is Node.js and why is it popular?

- Runtime for executing JS outside the browser, built on **V8 engine**.
- Uses **non-blocking I/O**, making it ideal for scalable, I/O-heavy apps.
- Popular because: **same language on frontend/backend**, large **npm ecosystem**, great for **real-time apps** (chat, games).

---

### 2) Explain the Event Loop in Node.js.

- Node.js runs JS in a **single thread** but uses the **event loop** (via libuv) to manage concurrency.
- **timers** (`setTimeout`/`setInterval`) → **pending callbacks** (some deferred system errors) → idle/prepare (internal) → **poll** (retrieve new I/O events, run I/O callbacks; may block here waiting) → **check** (`setImmediate`) → **close callbacks** (`socket.on('close')`). Between each callback, `process.nextTick` queue then promise microtasks are drained.
- while one request **awaits I/O**, the loop serves other requests. Concurrency is the default. What blocks *everyone* is long **synchronous** work (big JSON.parse, sync crypto, tight loops, `fs.readFileSync` in a handler).

---

### 3) How is Node.js single-threaded but handles many requests?

- JS execution = single thread.
- **network I/O** (sockets, HTTP, DB drivers) uses the OS's async mechanisms (**epoll/kqueue/IOCP**), with no threads per request. **libuv's thread pool** (default **4**, `UV_THREADPOOL_SIZE`) is only for things the OS can't do asynchronously: **file system**, `dns.lookup`, **crypto** (pbkdf2, scrypt, randomBytes), **zlib**.
- Results are queued back → allows concurrency without multi-threaded JS.

---

### 4) What are Streams in Node.js?

- Streams let you handle data **chunk by chunk** instead of loading it all.
- Types: **Readable**, **Writable**, **Duplex**, **Transform**.
- Example:

```js
fs.createReadStream("big.txt").pipe(process.stdout);
```

- Benefits: **memory-efficient**, **faster** for large data.

---

### 5) What are Buffers in Node.js?

- **Temporary memory storage** for binary data.
- Used when dealing with streams, TCP, file system.
- Example:

```js
const buf = Buffer.from("Hi");
console.log(buf[0]); // 72
```

---

### 6) What is middleware in Express.js?

- Functions with signature `(req, res, next)`.
- Process requests before final handler → logging, auth, validation.
- Example:

```js
app.use((req, res, next) => {
  console.log(req.url);
  next();
});
```

---

### 7) What is the difference between CommonJS and ES Modules?

- **CommonJS (CJS)** → `require()`, synchronous, older default.
- **ESM** → `import/export`, statically analysable, async loading. Unflagged in Node 12.17/13.2, stable since **14**. Enable via `"type": "module"` or `.mjs`.
- Today → prefer ESM, but many packages still ship in CJS.
-  Interop: ESM can `import` CJS. **Node 22+ (and 20.19+) can `require()` synchronous ESM**, which ends most dual-package pain.

---

### 8) How do you handle errors in Node.js?

- **Callbacks** → error-first `(err, result)`.
- **Promises** → `.catch()`.
- **Async/await** → `try/catch`.  
  👉 Always handle rejections — unhandled promise rejections crash Node.js since v15.

---

### 9) What is process.nextTick() vs setImmediate()?

- `process.nextTick()` → runs **before event loop continues** (microtask).
- `setImmediate()` → runs at **check phase** (next cycle).
- Use `nextTick` for urgent work, `setImmediate` for deferring.

---

### 10) What are worker threads and child processes?

- **Worker Threads** → true parallelism in JS (useful for CPU-heavy tasks).
- **Child Processes** → spawn OS processes (`spawn`, `exec`, `fork`).
- Both offload expensive work away from main event loop.

---

### 11) How do you secure a Node.js application?

- Validate & sanitize inputs.
- Use `helmet` for secure headers.
- Store secrets in env vars.
- Rate limiting & request size limits.
- Prefer `HttpOnly`, `Secure` cookies for JWTs.

---

### 12) What is CORS and how is it handled in Node.js?

- **Cross-Origin Resource Sharing** = allows/disallows requests from other domains.
- Handled via headers:

```js
app.use(cors({ origin: "https://example.com" }));
```

---

### 13) How do you scale Node.js applications?

- **Clustering** → one worker per CPU core.  (Built-in `cluster` module, or PM2. In containers, prefer one process per container and scale the number of containers/tasks on ECS/Kubernetes.)
- **Load balancing** → distribute traffic across instances.
- **Horizontal scaling** → Docker, Kubernetes, AWS ECS/EKS.

---

### 14) What is PM2 and why use it?

- **Process manager** for Node.js.
- Handles clustering, restarts on crash, monitoring, logs.
- Example: `pm2 start app.js -i max` (run on all cores).

---

### 15) What is an EventEmitter?

- Core Node.js pub/sub mechanism.
- Example:

```js
const EventEmitter = require("events");
const emitter = new EventEmitter();
emitter.on("msg", (d) => console.log(d));
emitter.emit("msg", "Hello");
```

---

### 16) What are common use cases for Node.js?

- REST & GraphQL APIs.
- Real-time apps (chat, games, notifications).
- CLI tools.
- Serverless functions (AWS Lambda).
- Microservices.

---

### 17) How do you test Node.js apps?

- **Unit**: Jest, Mocha, Jasmine.
- **Integration**: Supertest with Express.
- **E2E**: Cypress, Playwright.

---

### 18) How do you handle large file uploads in Node.js?

- Use **streams** (`multer`, `busboy`).
- Avoid loading full file in memory.
- Store in disk, S3, or DB.

---

### 19) What is the difference between Express and NestJS?

- **Express** → minimal, unopinionated, fast to prototype.
- **NestJS** → opinionated, TypeScript-first, modular, built-in DI, great for large/BFF projects.

---

### 20) When should you _not_ use Node.js?

- Avoid for **CPU-heavy apps** (e.g., ML, video encoding).
- Best for **I/O-heavy** tasks (APIs, chat apps, streaming).  
  👉 For CPU work, offload to workers or other services.

---

### 21) What's current in Node (2025–26)?
- LTS lines: **Node 22** and **Node 24** (even versions become LTS; odd ones are short-lived).
- Built-ins that replace dependencies: global **`fetch`**/`WebSocket`, **`node:test`** test runner, `--watch`, `--env-file=.env`, permission model (`--permission`).
- **Native TypeScript type-stripping**: `node app.ts` runs TS by erasing types (unflagged in Node 23.6/22.18+). It doesn't type-check, and it doesn't support enums/namespaces without a flag (hence TS's `--erasableSyntaxOnly`).

### 22) NestJS ↔ Spring Boot (your bridge)
| NestJS | Spring Boot |
|---|---|
| `@Module` | `@Configuration` / component scan |
| `@Injectable()` provider + constructor DI | `@Service` bean + constructor injection |
| `@Controller('listings')`, `@Get(':id')` | `@RestController`, `@GetMapping("/{id}")` |
| DTO + `ValidationPipe` (class-validator) | record DTO + `@Valid` (Bean Validation) |
| Exception filter | `@RestControllerAdvice` |
| Guard | Spring Security / `@PreAuthorize` |
| Interceptor | `HandlerInterceptor` / AOP |
| `ConfigModule` | `@ConfigurationProperties` + profiles |

### 23) Tell me about a Node backend you built. (real)
"Benwer Cars: a NestJS backend with Postgres through Drizzle (I owned the schema, migrations and queries), Stripe payments, S3, Docker, and OpenAPI-generated typed clients for the front end." **[confirm: your exact role/team size, the HTTP adapter (Express or Fastify), and scale/outcome numbers]**

### 24) Kafka consumer in Node: what matters?
At-least-once delivery means idempotent handlers (upsert with a deterministic key), commit offsets after successful processing, a retry topic plus DLQ for poison messages, and alerts on consumer lag. Same lessons as the OneHome Favorites feature (Kafka → Elasticsearch, sync back to Matrix). See `../1-java-spring-backend/java-spring-boot-essentials.md`. *[confirm which parts of the Favorites consumer ran on Node vs another stack before saying it]*

---

## Traps and gotchas
- `fs.readFileSync`, sync crypto or giant `JSON.parse` in a request handler blocks every user.
- Unhandled promise rejections crash the process (since v15). Always `await`/`catch`.
- `process.nextTick` recursion starves the event loop.
- Raising `UV_THREADPOOL_SIZE` doesn't speed up HTTP calls (they don't use the pool).
- Memory leaks from global caches and listeners (`MaxListenersExceededWarning`).
- Mixing CJS/ESM incorrectly (`__dirname` doesn't exist in ESM: use `import.meta.dirname`, Node 20.11+).

---
