# JPA / Hibernate and Transactions (Spring Data JPA, Hibernate 6)

> Group 1 · Priority HIGH · Prep guide Q17 · Status: new file

## Say it in 1 minute
"JPA is the specification, and Hibernate is the implementation. Entities map onto tables, and Spring Data turns a method name into a query. The two things that hurt in production are fetching and transactions. I keep associations lazy, and when a screen needs parents with their children I load them in one query with JOIN FETCH or an EntityGraph. Otherwise each parent fires another select and you get the N+1 problem. @Transactional belongs on the service. Spring applies it with a proxy, so a call from inside the same class skips it, and by default only unchecked exceptions roll the work back. I have lived with the same questions on Benwer Cars using Drizzle: the ORM does not pick the query plan or the transaction boundary for you."

---

## 1. Core concepts

### Entities and relations
Hibernate reads these annotations into a metamodel: table, columns, foreign key. A lazy association is not loaded with the parent. Hibernate gives you a proxy (a subclass) whose target is empty until you touch it, and that first getter runs a SELECT through the open session. That's why fetch type matters, and why a `record` can't be an entity: Hibernate needs a no-arg constructor and a class it can subclass. A record is the right shape for the DTO you return instead.

```java
@Entity
@Table(name = "listing")
public class Listing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)   // MySQL AUTO_INCREMENT
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)       // default for @ManyToOne is EAGER: override it!
    @JoinColumn(name = "owner_id")
    private Owner owner;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();             // @OneToMany default is LAZY

    @Version                                                    // optimistic locking
    private Long version;

    protected Listing() {}                                      // JPA needs a no-arg constructor
}
```
- **Fetch defaults**: `@ManyToOne` and `@OneToOne` are **EAGER**. `@OneToMany` and `@ManyToMany` are **LAZY**. Best practice is to make everything LAZY and fetch explicitly per use case.
- `mappedBy` marks the non-owning side. The owning side has the foreign key (`@JoinColumn`).
- Entities shouldn't be Java `record`s (they need mutability, a no-arg constructor and proxies). Records are perfect for DTOs and projections.

### Persistence context and entity states
The persistence context is an identity map for one transaction. Load listing 42 twice and you get the same Java instance, which is how Hibernate avoids a second SELECT and how two copies of the row can't drift inside the unit of work. On flush it compares fields with the snapshot taken at load time and writes an UPDATE only for what changed, so `save()` is unnecessary while the entity is managed. When the transaction ends the context closes and the objects are detached: they still hold data, but they no longer track changes or lazy loads. A Node ORM session or a Drizzle transaction is the same boundary, just with less hidden snapshotting.

- **Persistence context** = first-level cache plus change tracking, per transaction (per `EntityManager`).
- States: **transient** (new, unknown) → **managed** (loaded or persisted, changes auto-flushed) → **detached** (context closed) → **removed**.
- **Dirty checking**: changing a managed entity inside a transaction is enough. Hibernate issues the `UPDATE` on flush or commit, with no `save()` needed.

### Spring Data JPA
You write an interface and no implementation. At startup Spring Data parses method names (`findByOwnerIdAndPriceLessThan`) into a query and creates a JDK proxy that runs it. `@Query` skips the parser and uses your JPQL. Derived methods are the equivalent of a thin query-builder call in Drizzle, with the method name as the query.

```java
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByOwnerIdAndPriceLessThan(Long ownerId, BigDecimal max);   // derived query

    @Query("select l from Listing l join fetch l.owner where l.city = :city")     // JPQL, named param
    List<Listing> findByCityWithOwner(@Param("city") String city);

    @EntityGraph(attributePaths = {"owner", "photos"})
    Optional<Listing> findWithDetailsById(Long id);

    Page<ListingSummary> findByCity(String city, Pageable pageable);              // interface/record projection
}
public record ListingSummary(Long id, String title, BigDecimal price) {}
```

### The N+1 problem
The first query loaded listings without the owner columns. Each `getOwner()` initialises that listing's proxy with its own `SELECT ... WHERE id = ?`, because the persistence context can't invent a row it never fetched. You see it as the same statement repeated in the SQL log. ORMs in Node, including Drizzle if you query relations in a loop, do the same thing.

```java
List<Listing> listings = repo.findAll();          // 1 query
listings.forEach(l -> l.getOwner().getName());    // +N queries, one per listing (lazy load)
```
**Spot it:** SQL logging (`spring.jpa.show-sql` or `logging.level.org.hibernate.SQL=DEBUG`), Hibernate statistics, APM (New Relic shows many identical queries per transaction), and tests that assert a query count.
**Fix it:**
1. `JOIN FETCH` in JPQL, or `@EntityGraph`, gives one query.
2. **Batch fetching**: `hibernate.default_batch_fetch_size=50` (or `@BatchSize`) turns N queries into N/50 `IN (...)` queries.
3. **DTO projection**: select only the columns you need. That's often best for list endpoints.
**Caveat:** `JOIN FETCH` of a collection combined with pagination makes Hibernate paginate **in memory** (warning HHH90003004 / HHH000104). Paginate the IDs first, then fetch by IDs, or use batch fetching. Fetching two `List` collections at once throws `MultipleBagFetchException`.

### `LazyInitializationException`
The lazy proxy remembers the session that loaded it. After commit that session is closed, so the proxy has nowhere to send the SELECT and throws. It usually shows up when Jackson serialises an entity in the controller and touches a relation you didn't fetch. **Fix:** fetch what you need in the service, inside the transaction, and map to a DTO there. `spring.jpa.open-in-view` is **true by default** (Boot logs a warning). It binds the session for the whole request, which hides the exception by letting Jackson run queries during rendering, and it holds a connection until the response is done. Many teams set it to `false`.

### `@Transactional`
Boot proxies the service with a subclass (CGLIB). The proxy starts a transaction, calls your method, then commits, or rolls back. A call written as `this.other()`, or a `private` method, hits the real object and never enters the proxy, so no transaction starts. Nest interceptors have the same hole: they only see calls that come in from outside the class.

```java
@Service
public class BookingService {
    @Transactional                                     // atomic: all or nothing
    public Booking book(Long listingId, Long userId) {
        Listing l = listings.findById(listingId).orElseThrow(NotFoundException::new);
        l.markBooked();                                // dirty checking -> UPDATE at commit
        return bookings.save(new Booking(l, userId));
    }

    @Transactional(readOnly = true)                    // read path: no dirty checking, flush mode manual
    public ListingResponse get(Long id) { ... }
}
```
Rules to know cold:
- **Proxy-based (AOP).** Only calls **coming through the proxy** are transactional. A `this.otherMethod()` self-invocation **bypasses** it, and so do `private` methods (and `final` ones under CGLIB).
- **Rollback**: by default only on **unchecked** exceptions (`RuntimeException`, `Error`). Checked exceptions **commit** unless you set `@Transactional(rollbackFor = Exception.class)`.
- Catching an exception inside the method and swallowing it means no rollback.
- **Propagation**: `REQUIRED` (default: join existing or create), `REQUIRES_NEW` (suspend outer, independent commit, e.g. audit log), `MANDATORY`, `SUPPORTS`, `NOT_SUPPORTED`, `NEVER`, `NESTED` (savepoint).
- **Isolation**: `READ_UNCOMMITTED` < `READ_COMMITTED` < `REPEATABLE_READ` (**MySQL InnoDB default**) < `SERIALIZABLE`. Postgres defaults to READ_COMMITTED.
- Put it on the **service** layer, not controllers. Keep transactions short, and **no remote HTTP calls inside a transaction**: they hold a DB connection and can't be rolled back.
- Spring Data repository methods are already transactional individually (reads are `readOnly`).

### Concurrency control
Optimistic locking doesn't block the other user. The version from when you loaded the row is added to the `UPDATE`'s `WHERE`, and if someone else already incremented it, zero rows change and Hibernate throws. Pessimistic locking takes the InnoDB row lock up front so the second transaction waits. Use optimistic unless the row is hot, like a stock counter.

- **Optimistic** (`@Version`): `UPDATE ... WHERE id=? AND version=?`. On conflict you get `OptimisticLockException` → retry or return 409. Best for low-contention web apps.
- **Pessimistic**: `@Lock(LockModeType.PESSIMISTIC_WRITE)` → `SELECT ... FOR UPDATE`. For hot rows such as stock counters.

### Schema migrations
Flyway (or Liquibase) stores applied versions in a history table and runs any new `V*.sql` in order at startup, so every environment applies the same steps. `ddl-auto=update` lets Hibernate invent DDL from the entities, which can widen or drop a column you didn't mean to ship. `validate` only checks that the schema matches the metamodel and refuses to boot if it doesn't. In production the scripts live in `db/migration/` and `ddl-auto` stays `validate` or `none`.

---

## 2. Interview questions (spoken model answers)

**Q: What is the N+1 problem and how do you fix it?**
"You load N parents with one query, then touching a lazy relation on each one fires one more query per row, so N+1 round trips. I spot it with SQL logs or APM traces showing the same query repeated. I fix it per use case: `JOIN FETCH` or `@EntityGraph` when I need the relation, batch fetching as a global safety net, or a DTO projection for list endpoints. I'm careful with fetch-joining collections plus pagination, because Hibernate then paginates in memory. It's the same problem I've seen with ORMs in Node, like Drizzle: the fix is always to fetch what the screen needs in as few queries as possible."

**Q: Lazy vs eager?**
"Lazy loads on first access. Eager always loads, even when you don't need it, and that cascades into huge joins or extra queries. I default everything to lazy (remembering that `@ManyToOne` is eager by default) and fetch explicitly per query."

**Q: Explain `@Transactional`. What are the pitfalls?**
"It wraps the method in a transaction through a Spring proxy: begin, commit, or rollback on an unchecked exception. Pitfalls: self-invocation and private methods bypass the proxy. Checked exceptions commit by default unless you set `rollbackFor`. Swallowing an exception prevents rollback. Long transactions with remote calls inside hold connections. I use `readOnly = true` for reads, and `REQUIRES_NEW` only for things that must persist even if the outer transaction fails, like an audit record."

**Q: What's `LazyInitializationException`?**
"Touching a lazy relation outside an open session, typically while Jackson serialises an entity in the controller. The proper fix is fetching what you need inside the transactional service and returning DTOs. Open-in-view hides it but costs connections and causes hidden queries, so I'd rather turn it off."

**Q: How do you handle two users updating the same record?**
"Optimistic locking with a `@Version` column. The second update fails with an optimistic lock exception, and I return 409 Conflict so the UI can reload or merge. For very hot rows I'd use a pessimistic `SELECT ... FOR UPDATE` or an atomic `UPDATE ... SET stock = stock - 1 WHERE stock > 0`."

**Q: JPQL vs native queries vs projections?**
"Derived queries for simple filters. JPQL for joins and fetch control, since it's portable and works on entities. Native SQL for database-specific features or heavy reporting queries. Projections (records or interfaces) when I only need a few columns, which is faster and avoids loading managed entities."

**Q: Your experience?**
"Most of my hands-on ORM work is in Node: Drizzle with Postgres on Benwer Cars, where I owned the schema, migrations and queries. In Java: **[your real JPA/Hibernate example, if any; otherwise say you've read and changed repository/entity code and know the concepts]**."

---

## 3. Traps and gotchas
- `@ManyToOne` default EAGER. Interviewers love this one.
- `findById` inside a loop is N+1 too.
- `equals/hashCode` on entities: don't use the generated `id` naively (it's null before persist), and don't include lazy collections. Use a business key or an id-based implementation that handles null.
- `CascadeType.REMOVE`/`ALL` on `@ManyToMany` can delete shared rows.
- `@Transactional` on a `private` method silently does nothing.
- `save()` on a managed entity is unnecessary. Dirty checking already handles it.
- `ddl-auto=update` in prod: never.
- Bulk `@Modifying @Query("update ...")` bypasses the persistence context, so stale entities can remain. Use `clearAutomatically = true`.
- Lombok `@Data` on entities generates `equals/hashCode/toString` over relations, which leads to lazy loads and stack overflows.
