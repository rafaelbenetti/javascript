# Java 8 → 11 → 17 → 21: What Matters Day to Day

> Group 1 · Priority HIGH · Prep guide Q18 · Status: new file
> The JD lists Java 8/11/21: expect "what changed?" and "what would you use?"

## Say it in 30 seconds
"Java 8 brought the functional style: lambdas, streams, `Optional` and `java.time`. 11 was the next LTS, with `var` (from 10), the new `HttpClient` and string helpers. 17 is the baseline for Spring Boot 3: records for DTOs, sealed classes, text blocks, switch expressions and pattern matching for `instanceof`. 21 adds virtual threads, which make blocking I/O cheap so a normal Spring MVC service scales like a reactive one, plus pattern matching for switch, record patterns and sequenced collections. Coming from TypeScript, records feel like readonly types and sealed interfaces plus switch patterns feel like discriminated unions."

LTS versions: **8, 11, 17, 21, 25** (Sept 2025). Spring Boot 3 requires **17+**.

---

## 1. Core concepts by version

### Java 8 (2014): the big one
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
- **`==` vs `equals`**: reference vs value. If you override `equals`, you **must** override `hashCode` (HashMap contract). Records do both for you.
- **Immutability**: `final` fields, no setters, defensive copies, `List.copyOf`. String is immutable.
- **Collections**: `ArrayList` (index O(1)), `LinkedList` (rarely better), `HashMap` (O(1) average, not ordered), `LinkedHashMap` (insertion order), `TreeMap` (sorted, O(log n)), `ConcurrentHashMap` (thread-safe without a global lock), `HashSet`.
- **Exceptions**: checked (`IOException`: must declare or handle) vs unchecked (`RuntimeException`). Spring favours unchecked. Use try-with-resources for `AutoCloseable`.
- **Generics**: type erasure (no `new T()`, no runtime generic type). Bounded wildcards: PECS, "producer extends, consumer super" (`List<? extends Number>` to read).
- **Concurrency basics**: `synchronized`, `volatile` (visibility), `AtomicInteger`, `ExecutorService`, `CompletableFuture`, and immutability as the easiest thread safety.
- **Memory**: heap (objects, GC: G1 is the default, ZGC for low latency) vs stack (frames, locals). `OutOfMemoryError` vs `StackOverflowError`.
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
