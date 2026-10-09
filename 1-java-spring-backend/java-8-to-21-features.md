# Java 8 → 11 → 17 → 21: What Matters Day to Day

> Group 1 · Priority HIGH · Prep guide Q18 · Status: new file
> The JD lists Java 8/11/21: expect "what changed?" and "what would you use?"

## Say it in 1 minute
"If someone asks what changed from Java 8 to 21, I talk about what I would actually use. Java 8 is the functional baseline: lambdas, streams, Optional, and java.time. 11 is the next long-term release I still meet, with var from 10, the new HttpClient, and string helpers. 17 is what Spring Boot 3 sits on: records for DTOs, sealed classes, text blocks, switch expressions, and pattern matching for instanceof. 21 adds virtual threads, so blocking I/O gets cheap and a normal Spring MVC service can scale without a reactive rewrite, plus switch patterns, record patterns, and sequenced collections. The long-term releases are 8, 11, 17, 21, and 25 from September 2025, and Boot 3 needs 17 or newer. Coming from TypeScript, records feel like readonly types, and sealed types with switch patterns feel like discriminated unions."

---

## 1. Core concepts by version

### Java 8 (2014): the big one
Lambdas are how you pass behaviour without an anonymous class. The compiler binds them once (`invokedynamic`), it doesn't allocate a new class per call. A stream does nothing until a terminal operation (`collect`, `toList`): `filter` and `map` only describe the pipeline, and it can be consumed once. `Optional` makes "no row" a type instead of a null you forget. `java.time` replaced `Date` because `Date` was mutable and mixed an instant with a calendar. `CompletableFuture` is a Promise: `thenApply` maps, `thenCompose` flattens, `allOf` waits for all.

```java
// Lambdas + method references
listings.sort(Comparator.comparing(Listing::price).thenComparing(Listing::title));

// Streams: declarative collection processing (lazy, single-use)
Map<String, Double> avgPriceByCity = listings.stream()
    .filter(l -> l.status() == Status.ACTIVE)
    .collect(Collectors.groupingBy(Listing::city, Collectors.averagingDouble(l -> l.price().doubleValue())));

List<String> titles = listings.stream().map(Listing::title).distinct().sorted().toList(); // toList(): Java 16

// Optional: an explicit "may be absent" return type
String ownerName = repo.findById(id)
    .map(Listing::owner).map(Owner::name)
    .orElseThrow(() -> new NotFoundException("Listing " + id));

// java.time: immutable, thread-safe (replaces Date/Calendar)
Instant now = Instant.now();
LocalDate checkIn = LocalDate.of(2026, 10, 9);
ZonedDateTime madrid = now.atZone(ZoneId.of("Europe/Madrid"));
Duration timeout = Duration.ofSeconds(2);
```
- Functional interfaces: `Function<T,R>`, `Predicate<T>`, `Supplier<T>`, `Consumer<T>`, `BiFunction`. Any single-abstract-method interface works (`@FunctionalInterface`).
- **Default methods** in interfaces.
- `CompletableFuture` for async composition (`thenApply`, `thenCompose`, `allOf`). It's like Promise chains.

### Java 9–11
`var` is still static. The compiler fills in the type, and you can't later assign a different one. `List.of` exists so a shared constant can't be mutated by accident. The JDK `HttpClient` covers simple calls that used to need a library, including async and HTTP/2. The module system (JPMS) hides JDK internals. Most Spring apps don't write modules, but they feel Java 11's other change: JAXB and the other Java EE APIs left the JDK and have to be real dependencies.

```java
var listings = new ArrayList<Listing>();          // var: local type inference (10), still statically typed
List<String> immutable = List.of("a", "b");       // immutable factories (9): List/Set/Map.of
"  text ".isBlank(); " x ".strip(); "a\nb".lines(); "ab".repeat(3);   // String helpers (11)

HttpClient client = HttpClient.newHttpClient();   // standard HTTP client (11), sync + async, HTTP/2
HttpResponse<String> res = client.send(
    HttpRequest.newBuilder(URI.create("https://api.example.com")).build(),
    HttpResponse.BodyHandlers.ofString());
```
- **Module system** (JPMS, 9). Rarely used in app code.
- 11 removed the Java EE modules (JAXB, JAX-WS) from the JDK, which broke old apps on migration.

### Java 12–17
A record is a final class the compiler fills in: constructor, accessors, `equals`, `hashCode` and `toString`, all from the components. That's a TypeScript readonly type with value equality, and it's the wrong tool for a JPA entity because the fields are final and there's no no-arg constructor for Hibernate. A switch expression returns a value and does not fall through. A sealed interface lists the types that may implement it, so pattern matching can be exhaustive the way a discriminated union plus `never` is in TypeScript.

```java
// Records (16): immutable data carriers: constructor, accessors, equals/hashCode/toString generated
public record ListingResponse(Long id, String title, BigDecimal price) {
    public ListingResponse {                         // compact constructor for validation
        Objects.requireNonNull(title);
    }
}

// Text blocks (15)
String sql = """
    SELECT id, title FROM listing
    WHERE city = ? AND price < ?
    """;

// Switch expressions (14): no fall-through, returns a value
int days = switch (plan) {
    case MONTHLY -> 30;
    case YEARLY -> 365;
    default -> throw new IllegalArgumentException();
};

// Pattern matching for instanceof (16)
if (event instanceof BookingCreated bc) { notify(bc.userId()); }

// Sealed classes (17): closed hierarchy
public sealed interface PaymentResult permits Paid, Declined, Pending {}
public record Paid(String txId) implements PaymentResult {}
public record Declined(String reason) implements PaymentResult {}
public record Pending() implements PaymentResult {}
```
Also: helpful NullPointerExceptions (14) that name exactly which variable was null.

### Java 21 (LTS, 2023)
A virtual thread is a JVM object, not an OS thread. A small pool of carrier threads runs them. When the virtual thread blocks in JDBC or HTTP, the JVM unmounts it and the carrier runs something else, which is why ordinary blocking Spring MVC can take a lot of concurrent calls without WebFlux.

```java
// Pattern matching for switch + record patterns: exhaustive over a sealed type (no default needed)
String message = switch (result) {
    case Paid(String txId)       -> "Paid " + txId;
    case Declined(String reason) -> "Declined: " + reason;
    case Pending p               -> "Pending";
};

// Virtual threads: millions of cheap threads, blocking I/O no longer wastes an OS thread
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    var price = executor.submit(() -> pricingClient.fetch(id));
    var photos = executor.submit(() -> photoClient.fetch(id));
    return new Details(price.get(), photos.get());
}
// Spring Boot 3.2+: spring.threads.virtual.enabled=true

// Sequenced collections
list.getFirst(); list.getLast(); list.reversed();
```
- Virtual threads are **for I/O-bound** work (HTTP calls, DB). They give no speed-up for CPU-bound work.
- Pitfalls: **pinning**. Before Java 24, blocking inside `synchronized` pinned the carrier thread. Java 24 (JEP 491) fixed it for `synchronized`, but native calls still pin. Also, `ThreadLocal`-heavy code multiplies memory, and you shouldn't pool virtual threads.
- Preview features in 21 (don't over-claim): string templates (later withdrawn), structured concurrency, scoped values.

### Java 22–25 (be aware only)
Java 25 is the new LTS (Sept 2025). It includes unnamed variables `_` (final in 22), Stream gatherers (24), scoped values final (25), compact source files and instance `main` (25), and module import declarations (25).

---

## 2. Core Java fundamentals they may probe
- **`==` vs `equals`**: `==` compares references (or primitive values). `equals` is the value comparison you define. `HashMap` buckets by `hashCode`, then checks `equals` inside the bucket. Two objects that are equal but hash differently will not be found. Records generate both from the components.
- **Generics**: the compiler checks `List<String>`, then erases it to `List` in the bytecode. That's why you can't write `new T()` or ask a `List` at runtime what its element type was. PECS (`? extends` when you read, `? super` when you write) is how you accept a list of a subtype without breaking that check.
- **Memory**: objects and arrays live on the heap. The GC (G1 by default, ZGC when you need short pauses) reclaims ones with no remaining references. Stack frames hold locals and die when the method returns. An infinite recursion is `StackOverflowError`. A list that grows without bound is `OutOfMemoryError`.
- **Immutability**: `final` fields, no setters, defensive copies, `List.copyOf`. String is immutable. If nothing can change after construction, you can share the object across request threads without a lock. A getter that returns your internal `ArrayList` lets the caller mutate your state. Return `List.copyOf` or an unmodifiable view.
- **Collections**: `ArrayList` is a growable array, so index access is O(1) and inserting in the middle shifts elements. `HashMap` buckets by `hashCode` and does not keep order. `ConcurrentHashMap` locks per bin rather than the whole map, which is the one to use for a cache on a singleton bean. `LinkedList` is almost never the win people expect.
- **Exceptions**: a checked exception is part of the signature, so every caller must handle or declare it. Spring uses unchecked exceptions so a service method isn't a chain of `throws`. try-with-resources calls `close()` even when the body throws, which is how a JDBC connection or a stream doesn't leak.
- **Concurrency basics**: `synchronized` makes one thread the owner of a block and flushes its writes. `volatile` only guarantees visibility of that one variable, not a larger update. `AtomicInteger` is a lock-free read-modify-write. An `ExecutorService` is a pool of platform threads. Immutability is the easiest thread safety, because there's nothing to publish halfway written.
- **`BigDecimal` for money**, never `double`. Compare with `compareTo`, not `equals` (`2.0` vs `2.00`).

---

## 3. Interview questions (spoken model answers)

**Q: What changed from Java 8 to 21 that you'd actually use?**
"Day to day: records for DTOs, which replace Lombok-heavy classes. Switch expressions and pattern matching, which make branching on types safe, and with sealed interfaces the compiler checks I handled every case, like a TypeScript discriminated union with a `never` check. `var` for readability, text blocks for SQL and JSON in tests. And in 21, virtual threads, so a classic blocking Spring MVC service can handle very high concurrency without going reactive."

**Q: What are virtual threads and when would you use them?**
"They're lightweight threads managed by the JVM rather than the OS. When one blocks on I/O, it's unmounted and the carrier thread does other work. So thread-per-request with simple blocking code scales to huge concurrency. They're ideal for I/O-bound services calling databases and APIs, not for CPU-heavy work. In Boot 3.2+ it's one property. Watch for pinning, ThreadLocal-heavy libraries, and the fact that the database connection pool becomes the real limit."

**Q: Streams: when not to use them?**
"Streams are great for transform, filter and group. I avoid them for simple loops with side effects, when I need checked exceptions inside the lambda, or in hot paths where a plain loop is clearer or faster. Streams are lazy and single-use, and `parallelStream` is rarely a good idea in a web server because it uses the shared ForkJoin pool."

**Q: `Optional`: how should it be used?**
"As a return type for 'might not exist', like `findById`, chained with `map` and `orElseThrow`. Not for fields, parameters or collections (return an empty list instead), and never call `get()` without checking."

**Q: Migrating Java 8 → 17/21: risks?**
"Removed Java EE modules (JAXB etc.) must be added as dependencies. For Spring Boot 3 there's the `javax` → `jakarta` namespace change. Old libraries using internal JDK APIs break under strong encapsulation. Build plugins need updating. I'd upgrade dependencies first, run the full test suite, use OpenRewrite recipes for the mechanical changes, and roll out service by service."

**Q: Records vs Lombok?**
"Records are built into the language: immutable, concise and with value semantics, perfect for DTOs and events. They can't be JPA entities (no no-arg constructor, final fields), so entities stay regular classes."

---

## 4. Traps and gotchas
- `var` isn't dynamic typing. The type is inferred at compile time and fixed.
- `List.of()` is immutable, so `add()` throws `UnsupportedOperationException`. It also rejects nulls.
- `Stream.toList()` (16) returns an unmodifiable list, but `Collectors.toList()` doesn't guarantee that.
- `Optional.of(null)` throws NPE. Use `ofNullable`.
- `BigDecimal.equals` compares scale too. Use `compareTo`.
- Don't claim virtual threads make CPU work faster.
- Java 21 string templates were a preview and were later removed. Don't present them as a feature.
- `HashMap` iteration order isn't guaranteed.
