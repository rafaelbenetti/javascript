# REST API Design (for a React ↔ Spring Boot product)

> Group 1 · Priority MEDIUM · Prep guide Q16, Q20 · Status: new file

## Say it in 30 seconds
"I design APIs contract-first around resources: plural nouns, HTTP verbs with their real semantics, correct status codes, and one consistent error format (ProblemDetail). GET, PUT and DELETE are idempotent. For POSTs that create money-moving or duplicate-prone things I use an idempotency key. Lists are paginated, filterable and sortable. I version through the URL or a header and only make additive changes within a version. The contract lives in OpenAPI, and on Benwer Cars I generated typed TypeScript clients from it, so a backend change that broke the front end failed at compile time instead of in production."

---

## 1. Core concepts

### Resources and verbs
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
- **2xx**: 200 OK, 201 Created, 202 Accepted (async processing started), 204 No Content.
- **3xx**: 301/308 permanent, 302/307 temporary, 304 Not Modified (ETag cache hit).
- **4xx**: 400 Bad Request (malformed or validation), **401 Unauthorized (not authenticated)**, **403 Forbidden (authenticated but not allowed)**, 404 Not Found, 405 Method Not Allowed, 409 Conflict (version or duplicate), 412 Precondition Failed (If-Match), 415 Unsupported Media Type, 422 Unprocessable Content (semantically invalid; some teams use it for validation), 429 Too Many Requests (+ `Retry-After`).
- **5xx**: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.

### Error format: ProblemDetail (RFC 9457, `application/problem+json`)
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
- **Offset** (`page`, `size`): simple, and you get page numbers. But it's slow on deep pages (`OFFSET 100000` scans) and unstable when data changes.
- **Cursor/keyset** (`?after=eyJpZCI6MTIzfQ&limit=20`): `WHERE (price, id) > (?, ?) ORDER BY price, id LIMIT 20`. Fast and stable, ideal for infinite scroll. You lose "jump to page 37".
- Return metadata: `{ "items": [...], "page": 0, "size": 20, "totalElements": 512 }` or `{ "items": [...], "nextCursor": "..." }`. Avoid expensive `COUNT(*)` on huge tables if it isn't needed.

### Idempotency keys for POST
```http
POST /api/v1/payments
Idempotency-Key: 6f1c2a9e-...
```
The server stores the key with the result, and a retry with the same key returns the stored result instead of charging twice. This is essential when clients and gateways retry on timeouts (the same pattern Stripe uses; you integrated Stripe on Benwer Cars).

### Concurrency: ETag / If-Match
`GET` returns `ETag: "v7"`. `PUT` sends `If-Match: "v7"`, and if someone changed the resource in between, the server returns 412. This maps naturally to a JPA `@Version`.

### Versioning
- URL (`/api/v1/...`): explicit and easy to route and cache. It's the most common choice.
- Header or media type (`Accept: application/vnd.app.v2+json`): cleaner URLs, but harder to debug.
- Rules: **additive changes are non-breaking** (new optional fields or endpoints). Removing or renaming fields or changing types is breaking, so you need a new version plus a deprecation period (`Deprecation`/`Sunset` headers). Clients must ignore unknown fields (Jackson: `FAIL_ON_UNKNOWN_PROPERTIES=false` is Boot's default).

### Caching
`Cache-Control: public, max-age=60` for public GETs (CloudFront can cache them), `private, no-store` for user data. Use `ETag` + `If-None-Match` to get 304s. Never cache authenticated responses at a shared CDN without a cache key that includes auth.

### Contract-first with OpenAPI
- Write the spec first (or generate it from Spring with `springdoc-openapi`) and review it in the PR.
- Generate clients (`openapi-generator`, `openapi-typescript`) so the React app gets typed calls. Breaking changes surface in CI.
- Lint for breaking changes (`oasdiff`, Spectral).

### CORS and security basics
- CORS is a **browser** protection: the server declares allowed origins (`@CrossOrigin` or a global `CorsConfigurationSource` in Spring Security). Preflight `OPTIONS` happens for non-simple requests. Never use `*` with credentials.
- Authenticate every request (bearer JWT or session cookie). Authorise **per resource**: check that the user owns listing 42 (BOLA/IDOR, the #1 API risk in the OWASP API Top 10).
- Rate limiting (429), request size limits, input validation, no sensitive data in URLs (it ends up in logs).

### REST vs GraphQL vs gRPC vs async
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

## 3. Traps and gotchas
- Returning 200 with `{ "error": ... }` in the body. Use real status codes.
- 500 for validation errors. That's a client error (400/422).
- Treating PATCH as idempotent, or retrying POSTs without an idempotency key.
- Exposing database IDs and entity shapes 1:1, which couples the API to the schema.
- `OFFSET` pagination on millions of rows.
- `Access-Control-Allow-Origin: *` with credentials. Browsers reject it, and it's insecure anyway.
- Authorising only by role and not by ownership (IDOR).
- Putting tokens or PII in query strings.
