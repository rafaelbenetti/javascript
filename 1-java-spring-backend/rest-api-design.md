# REST API Design (for a React ↔ Spring Boot product)

> Group 1 · Priority MEDIUM · Prep guide Q16, Q20 · Status: new file

## Say it in 1 minute
"I design APIs contract-first, around resources. Paths are plural nouns, the HTTP method carries the meaning, and the status code says what happened. Errors share one shape, ProblemDetail, so the front end parses them in one place. GET, PUT, and DELETE are idempotent. POST is not, so anything that can be retried gets an idempotency key. Lists are paginated, filterable, and sortable, and I use a keyset once offset would get deep. I version with the URL or a header, and inside a version I only add fields. The contract lives in OpenAPI. On Benwer Cars I generated typed TypeScript clients from that spec, so a breaking change failed the front-end build. From EPAM: OneHome has four favourite sentiments, and I exposed one endpoint filtered by type instead of four near-duplicate routes."

---

## 1. Core concepts

### Resources and verbs
The verb is a promise to caches, browsers and retries. GET is safe, so CloudFront may store it. PUT and DELETE are idempotent, so doing them twice leaves one result. POST is neither, which is why a timed-out "create payment" is dangerous without an idempotency key. Nest or Express will happily POST everything. The contract is what makes the React client predictable. Paths are nouns because the verb is already in the method.

| Action | Request | Success status |
|---|---|---|
| List | `GET /api/v1/listings?city=malaga&page=0&size=20&sort=price,asc` | 200 |
| Read | `GET /api/v1/listings/42` | 200 (404 if missing) |
| Create | `POST /api/v1/listings` | **201 Created** + `Location` header |
| Replace | `PUT /api/v1/listings/42` | 200 / 204 |
| Partial update | `PATCH /api/v1/listings/42` | 200 / 204 |
| Delete | `DELETE /api/v1/listings/42` | 204 (repeat → 204 or 404, still idempotent in effect) |
| Sub-resource | `GET /api/v1/listings/42/photos` | 200 |
| Action that isn't CRUD | `POST /api/v1/bookings/7/cancel` | 200 / 202 |

- **Safe** = no side effects (GET, HEAD, OPTIONS). **Idempotent** = repeating it has the same effect (GET, PUT, DELETE, HEAD, OPTIONS). **POST and PATCH aren't idempotent by default.**
- Use nouns, not verbs (`/listings`, not `/getListings`). Lowercase kebab-case paths, consistent camelCase JSON.

### Status codes to know cold
The status is the machine-readable result. The body is detail. 401 versus 403 tells the UI whether to send the user to login or to show "not allowed". 201 plus a `Location` header gives the new URL without the client parsing the body. 202 means "accepted, not finished", which is the right answer when the work goes to a queue.

- **2xx**: 200 OK, 201 Created, 202 Accepted (async processing started), 204 No Content.
- **3xx**: 301/308 permanent, 302/307 temporary, 304 Not Modified (ETag cache hit).
- **4xx**: 400 Bad Request (malformed or validation), **401 Unauthorized (not authenticated)**, **403 Forbidden (authenticated but not allowed)**, 404 Not Found, 405 Method Not Allowed, 409 Conflict (version or duplicate), 412 Precondition Failed (If-Match), 415 Unsupported Media Type, 422 Unprocessable Content (semantically invalid; some teams use it for validation), 429 Too Many Requests (+ `Retry-After`).
- **5xx**: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.

### Error format: ProblemDetail (RFC 9457, `application/problem+json`)
One JSON shape means the React error handler is written once. Spring builds it in a `@RestControllerAdvice`. `traceId` should be the same id as the log line, so support can jump from the toast to the trace. A Nest exception filter that always returns `{ statusCode, message }` is the same idea with a different schema.

```json
{
  "type": "https://api.example.com/problems/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "2 fields are invalid",
  "instance": "/api/v1/listings",
  "errors": [{ "field": "price", "message": "must be greater than 0" }],
  "traceId": "4bf92f3577b34da6"
}
```

### Pagination
Offset asks the database to count and skip, so page 5000 reads everything before it. Keyset says "rows after this sort key", which is an index range. Spring's `Pageable` is offset. A cursor is usually an opaque encoding of the last `(price, id)` so the client can't change the sort by editing the token.

- **Offset** (`page`, `size`): simple, and you get page numbers. But it's slow on deep pages (`OFFSET 100000` scans) and unstable when data changes.
- **Cursor/keyset** (`?after=eyJpZCI6MTIzfQ&limit=20`): `WHERE (price, id) > (?, ?) ORDER BY price, id LIMIT 20`. Fast and stable, ideal for infinite scroll. You lose "jump to page 37".
- Return metadata: `{ "items": [...], "page": 0, "size": 20, "totalElements": 512 }` or `{ "items": [...], "nextCursor": "..." }`. Avoid expensive `COUNT(*)` on huge tables if it isn't needed.

### Idempotency keys for POST
The server stores the key with the response, usually behind a unique constraint. The first request performs the charge and saves both. A retry with the same key returns the saved response and does not call the payment provider again. The key is unique per operation, not one key per user forever. It's the same idea as an idempotent Kafka consumer that upserts a deterministic document id.

```http
POST /api/v1/payments
Idempotency-Key: 6f1c2a9e-...
```
The server stores the key with the result, and a retry with the same key returns the stored result instead of charging twice. This is essential when clients and gateways retry on timeouts (the same pattern Stripe uses; you integrated Stripe on Benwer Cars).

### Concurrency: ETag / If-Match
The ETag is a fingerprint of the version, often the JPA `@Version` or a hash of the body. `If-Match` makes the write conditional: the `UPDATE` includes that version, and 412 means someone else committed first. It's optimistic locking expressed as HTTP, so the client can reload instead of silently overwriting.

`GET` returns `ETag: "v7"`. `PUT` sends `If-Match: "v7"`, and if someone changed the resource in between, the server returns 412. This maps naturally to a JPA `@Version`.

### Versioning
A URL version is a Spring `@RequestMapping("/api/v1")` and a cache key you can see in the logs. Clients must ignore unknown JSON fields, which is Jackson's default, so adding an optional field is not a new version. Removing or renaming one is, and the old version stays until metrics show its traffic is gone. A header version is cleaner in the path and harder to curl.

- URL (`/api/v1/...`): explicit and easy to route and cache. It's the most common choice.
- Header or media type (`Accept: application/vnd.app.v2+json`): cleaner URLs, but harder to debug.
- Rules: **additive changes are non-breaking** (new optional fields or endpoints). Removing or renaming fields or changing types is breaking, so you need a new version plus a deprecation period (`Deprecation`/`Sunset` headers). Clients must ignore unknown fields (Jackson: `FAIL_ON_UNKNOWN_PROPERTIES=false` is Boot's default).

### Caching
`Cache-Control` tells shared caches what they may store. `public, max-age=60` is a catalog page CloudFront can keep. `private, no-store` is a user's bookings. `ETag` plus `If-None-Match` lets the client ask "has this changed?" and get a 304 with an empty body when it hasn't. A shared CDN must not cache an authenticated response unless the cache key includes the identity, or one user receives another's payload.

### Contract-first with OpenAPI
The spec is the agreement the React app compiles against. `springdoc-openapi` can generate it from the controllers, or you write it first and generate the server interfaces. `openapi-typescript` turns it into types, so a renamed field fails `tsc` in CI. That's what caught breaks on Benwer Cars, instead of a runtime error in the browser.

- Write the spec first (or generate it from Spring with `springdoc-openapi`) and review it in the PR.
- Generate clients (`openapi-generator`, `openapi-typescript`) so the React app gets typed calls. Breaking changes surface in CI.
- Lint for breaking changes (`oasdiff`, Spectral).

### CORS and security basics
The browser enforces CORS, not Spring. A cross-origin `POST` with `Content-Type: application/json` is not a "simple" request, so the browser first sends `OPTIONS` and only proceeds if the response allows that origin and method. `CorsConfigurationSource` is what answers it. `*` together with cookies is rejected by the browser, because any site could then make a credentialed call. Server-to-server calls never preflight. Authorisation is a separate step: a valid JWT does not mean this user owns listing 42.

- CORS is a **browser** protection: the server declares allowed origins (`@CrossOrigin` or a global `CorsConfigurationSource` in Spring Security). Preflight `OPTIONS` happens for non-simple requests. Never use `*` with credentials.
- Authenticate every request (bearer JWT or session cookie). Authorise **per resource**: check that the user owns listing 42 (BOLA/IDOR, the #1 API risk in the OWASP API Top 10).
- Rate limiting (429), request size limits, input validation, no sensitive data in URLs (it ends up in logs).

### REST vs GraphQL vs gRPC vs async
REST is the default because HTTP caches and every client already speak it. GraphQL pays off when one screen would otherwise call five endpoints and still get fields it doesn't render. The cost is per-field authorisation and a DataLoader so resolvers don't N+1. gRPC is a compact contract between services and a poor fit for browsers. If the user doesn't need the result in this HTTP call, publish to SQS or Kafka and return 202 so the request thread isn't waiting on the work.

- **REST**: simple, cacheable, universal. The default for public and front-end APIs.
- **GraphQL**: a client-shaped query, so no over or under-fetching across complex UIs. But caching is harder, N+1 needs DataLoader, and authorisation is per field.
- **gRPC**: binary and fast, good for service-to-service, poor for browsers.
- **Async events (SQS/SNS/Kafka)**: when the caller doesn't need an immediate answer. Return 202 and process in the background.

---

## 2. Interview questions (spoken model answers)

**Q: How do you design a good REST API?**
"Contract-first in OpenAPI, reviewed with the front end. Resource-oriented URLs, verbs with proper semantics, correct status codes (201 with Location on create, 404 vs 403 vs 401 used correctly) and a single error format. Paginated, filterable lists. Validation at the edge. Additive evolution with explicit versioning. Then generated typed clients for the React app. On Benwer Cars I used OpenAPI-generated typed clients, so contract breaks show up as compile errors instead of runtime bugs."

**Q: PUT vs PATCH vs POST?**
"PUT replaces the whole resource at a known URL and is idempotent. PATCH changes part of it and isn't guaranteed idempotent. POST creates or triggers an action, and the server picks the ID. To make POST retries safe, I add an idempotency key."

**Q: 401 vs 403?**
"401 means we don't know who you are: missing or invalid credentials, so log in again. 403 means we know who you are but you're not allowed. For resources a user mustn't even know exist, returning 404 instead of 403 avoids leaking that they exist."

**Q: How do you handle breaking changes?**
"Avoid them: add fields, don't rename or remove them. If one is unavoidable, I ship v2 alongside v1, migrate consumers, track usage of v1 through logs and metrics, announce a sunset date, then remove it. Contract tests or OpenAPI diff checks in CI catch accidental breaks."

**Q: Offset or cursor pagination?**
"Offset for admin tables where users jump to page N and the data is small. Cursor or keyset for feeds, search results and infinite scroll on large tables. It uses the index, is stable while data changes, and doesn't degrade on deep pages. For listing search on a big real-estate catalogue I'd go with keyset."

**Q: How would the React app consume this?**
"Typed client generated from OpenAPI, server state in React Query (caching, dedupe, invalidation after mutations, optimistic updates for things like favourites), errors mapped from ProblemDetail to field errors in forms, and retries only on idempotent requests."

---

---

## ⭐ Real STAR story (API-design angle): OneHome Favorites / Sentiments (EPAM)
> Rafael's real feature. Call it **"our backend service"**. Don't say it was Spring. Facts below are confirmed. Anything in *italics + [confirm]* is a suggested follow-up answer, so say it only if true, or frame it as "how I'd harden it".

**S, Situation:** OneHome is one of the top-5 home-search apps in the US. Consumers and their real-estate agents needed a shared way to mark and review properties.
**T, Task:** Build the Favorites/sentiments feature end to end.
**A, Action:**
- **4 sentiments**: **like** and **dislike** are set by the consumer, **recommend** and **exclude** are set by the agent. Both the consumer and the agent see all 4 tabs.
- **UI**: a page with a **map plus 4 tabs**. Each tab is an **independent component** built from **shared components** (list, property card, map integration), so the four views reuse one implementation.
- **API**: **a single endpoint that filters by sentiment type** (e.g. `GET …/favorites?sentiment=LIKE`), not four endpoints.
- **Data**: stored in **Elasticsearch**, populated from **Kafka events**, because the **source of truth is Matrix**, an external MLS provider.
- **Two-way sync**: on every sentiment change, our backend service **sends the update back to Matrix** so both systems stay in sync.
**R, Result:** consumers and agents collaborate on one consistent set of 4 sentiment lists, shown on the map and in tabs. **[Add a real outcome if you have one: usage, adoption, fewer support tickets, performance.]**

### Likely follow-ups (model answers)
**"Why one endpoint with a filter instead of four?"**
"The four sentiments are the same resource, a favourite with a type, so one endpoint keeps the contract small: `sentiment` is a query parameter validated against an enum, plus pagination. The front end reuses one data hook for all four tabs. Adding a fifth sentiment is a new enum value, not a new endpoint. Authorisation still applies per sentiment: only agents can set recommend and exclude, only consumers can set like and dislike."

**"Why Elasticsearch and not just a relational table?"**
"Two reasons: filtering and the map. Elasticsearch is built for fast filtered queries over many fields (sentiment, user, agent, price, beds, status) and has native **geo queries** (`geo_bounding_box` for the visible map area, `geo_distance`, geo aggregations for clustering pins). The data originates in Matrix and arrives as events anyway, so a search-optimised read model fed from Kafka fits well. It's a CQRS-style read side."

**"How do you make the Kafka consumer safe against duplicates and replays?"**
"Kafka is at-least-once, so the consumer must be **idempotent**. The cleanest way is an **upsert with a deterministic document ID**, e.g. `userId + listingId` (or `userId + listingId + sentiment`, depending on the model). Re-processing the same event overwrites the same document instead of creating duplicates. For ordering, events for the same key go to the same partition (partition key = listing or user), and an event version or timestamp lets the consumer skip stale updates (external versioning in Elasticsearch, or compare-and-skip)." *[confirm which of these you actually used]*

**"What if the sync back to Matrix fails?"**
"Matrix is external, so failures are expected: timeouts, rate limits, outages. The user's action shouldn't fail because Matrix is down. I'd **retry with exponential backoff and jitter** for transient errors, make the call idempotent so retries are safe, and after N attempts send it to a **dead-letter queue/topic** with alerting, plus a replay path once Matrix recovers. Monitoring on DLQ depth and sync error rate goes to PagerDuty. Also a reconciliation job, because Matrix is the source of truth, so the Kafka feed eventually corrects any drift." *[confirm what was in place vs what you'd add]*

**"Isn't there a race between your write to Matrix and the Kafka event coming back?"**
"Yes, that's the classic two-way-sync problem. Options: treat Matrix as the source of truth and apply updates only from the event stream (the UI updates optimistically), or version the records so an older event can't overwrite a newer local change. The key is one clear owner per field and idempotent, version-aware updates." *[confirm how it was handled]*

**"How did you test it?"**
"Component tests for the shared tab components and the sentiment filter, tests for the endpoint's filtering and permissions, and tests for the consumer's idempotency (same event twice gives one document). It all ran in the pipeline with our 80% coverage gate." *[adjust to what was actually tested]*

**Spring translation (if they ask "how would this look in Spring?")**
```java
@GetMapping("/api/v1/favorites")
public Page<FavoriteResponse> list(@RequestParam Sentiment sentiment, Pageable pageable,
                                   @AuthenticationPrincipal Jwt user) {
    return favorites.find(user.getSubject(), sentiment, pageable);     // enum binding gives 400 on bad values
}

@KafkaListener(topics = "matrix.favorites")
public void on(FavoriteEvent e) {
    es.index(i -> i.index("favorites").id(e.userId() + ":" + e.listingId())   // deterministic id = upsert
                   .document(FavoriteDoc.from(e)));
}
```

---

## 3. Traps and gotchas
- Returning 200 with `{ "error": ... }` in the body. Use real status codes.
- 500 for validation errors. That's a client error (400/422).
- Treating PATCH as idempotent, or retrying POSTs without an idempotency key.
- Exposing database IDs and entity shapes 1:1, which couples the API to the schema.
- `OFFSET` pagination on millions of rows.
- `Access-Control-Allow-Origin: *` with credentials. Browsers reject it, and it's insecure anyway.
- Authorising only by role and not by ownership (IDOR).
- Putting tokens or PII in query strings.
