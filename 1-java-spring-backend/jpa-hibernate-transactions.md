# JPA / Hibernate and Transactions (Spring Data JPA, Hibernate 6)

> Group 1 · Priority HIGH · Prep guide Q17 · Status: new file

## Say it in 30 seconds
"JPA is the spec and Hibernate is the implementation. Entities map to tables, and Spring Data gives me repositories with derived queries. The two things that bite in production are fetching and transactions. Relations should be lazy, and when I list parents with their children I fetch them in one query with `JOIN FETCH` or an `@EntityGraph`, otherwise I get the N+1 problem. `@Transactional` goes on the service layer. It works through a proxy, so self-calls bypass it, and by default it rolls back only on unchecked exceptions. I've used ORMs heavily (Drizzle on Benwer Cars), and the same N+1 and transaction concerns apply."

---

## 1. Core concepts

### Entities and relations
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
- **Persistence context** = first-level cache plus change tracking, per transaction (per `EntityManager`).
- States: **transient** (new, unknown) → **managed** (loaded or persisted, changes auto-flushed) → **detached** (context closed) → **removed**.
- **Dirty checking**: changing a managed entity inside a transaction is enough. Hibernate issues the `UPDATE` on flush or commit, with no `save()` needed.

### Spring Data JPA
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
Accessing a lazy relation after the transaction or session has closed (e.g. in the controller or during Jackson serialisation). **Fix:** fetch what you need in the service, inside the transaction, and map to a DTO there. `spring.jpa.open-in-view` is **true by default** (Boot logs a warning). It hides the problem by keeping the session open during view rendering, which causes surprise queries and holds DB connections longer. Many teams set it to `false`.

### `@Transactional`
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
- **Optimistic** (`@Version`): `UPDATE ... WHERE id=? AND version=?`. On conflict you get `OptimisticLockException` → retry or return 409. Best for low-contention web apps.
- **Pessimistic**: `@Lock(LockModeType.PESSIMISTIC_WRITE)` → `SELECT ... FOR UPDATE`. For hot rows such as stock counters.

### Schema migrations
Use Flyway (`db/migration/V1__init.sql`) or Liquibase. Never use `ddl-auto=update` in production. Use `validate` or `none`.

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
