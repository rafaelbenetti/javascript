# 🟢 Node.js Prep — Top 20 Interview Q&A

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
- Event loop phases: **timers → I/O → poll → check → close**.
- While one request runs, others wait in a queue until resources are free.

---

### 3) How is Node.js single-threaded but handles many requests?

- JS execution = single thread.
- I/O tasks = offloaded to **libuv’s thread pool**.
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
- **ESM** → `import/export`, async, modern (native in Node 12+).
- Today → prefer ESM, but many packages still ship in CJS.

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

- **Clustering** → one worker per CPU core.
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
