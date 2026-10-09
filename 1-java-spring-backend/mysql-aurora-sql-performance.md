# MySQL / Aurora: SQL and Query Performance

> Group 1 · Priority MEDIUM · Prep guide Q25 · Status: new file
> Honest framing: Rafael's production SQL is mainly PostgreSQL (Benwer Cars with Drizzle). The concepts transfer, and the MySQL-specific points are marked.

## Say it in 1 minute
"When a query is slow I measure first. The slow query log or APM names the statement, and EXPLAIN or EXPLAIN ANALYZE shows a scan versus an index. The usual fix is a better index: equality columns first in a composite, and a covering index when the query can be answered from the index alone. I keep predicates sargable, avoid wrapping an indexed column in a function, skip SELECT star, and paginate with a keyset instead of a deep OFFSET. N+1 is an ORM problem. Aurora MySQL is the engine I would expect here: storage copied six ways across three availability zones, up to 15 low-lag readers on a reader endpoint, and fast failover. My day-to-day SQL has been Postgres, on Benwer Cars with Drizzle, and indexing plus reading a plan transfer straight across."

---

## 1. Core concepts

### Indexes (InnoDB B+tree)
InnoDB stores the table itself as a B+tree ordered by the primary key, so a random UUID primary key scatters inserts across leaf pages. A secondary index leaf stores the primary key, not the whole row. A query that needs a column that isn't in that index does a second lookup into the clustered index. A covering index holds every column the query needs, so that second hop never happens. The column order is the sort order: the tree can seek a leftmost prefix, not a middle column. Postgres indexes the same way, except the table heap is separate from the primary key.

- The **clustered index** is the primary key. Rows are physically stored in PK order. Secondary indexes store the PK value, so a secondary lookup is index → PK → row ("bookmark lookup").
- A **composite index** `(city, status, price)` serves `WHERE city=? AND status=?` and `WHERE city=? AND status=? ORDER BY price`. It does **not** serve `WHERE status=?` alone (**leftmost-prefix rule**). Order the columns as equality first, then range or sort.
- **Covering index**: the index contains every column the query needs, so the table is never touched. `EXPLAIN` shows `Using index`.
- Costs: every index slows writes and takes space. Don't index low-cardinality columns alone (e.g. a boolean).

```sql
CREATE INDEX idx_listing_city_status_price ON listing (city, status, price);

EXPLAIN ANALYZE
SELECT id, title, price FROM listing
WHERE city = 'malaga' AND status = 'ACTIVE'
ORDER BY price
LIMIT 20;
```

### Reading `EXPLAIN` (MySQL)
The optimizer picks a plan before it runs. `type: ALL` means it walked every row. `rows` is an estimate, which is why `EXPLAIN ANALYZE` (actual time) is the one to trust when the estimate looks wrong. `Using filesort` means the `ORDER BY` couldn't be satisfied by the index order, so MySQL sorted the rows itself.

| Field | Look for |
|---|---|
| `type` | `const`/`eq_ref`/`ref`/`range` are good. **`ALL`** is a full table scan, and `index` is a full index scan |
| `key` | Which index was chosen (NULL means none) |
| `rows` | Estimated rows examined. Compare it to the rows returned |
| `Extra` | `Using index` (covering, good). `Using filesort` / `Using temporary` are red flags on big sets |

MySQL 8.0.18+ has `EXPLAIN ANALYZE`, which shows actual timings. In Postgres, `EXPLAIN (ANALYZE, BUFFERS)` gives Seq Scan vs Index Scan.

### Index killers
The index is ordered by the stored value of `created_at`, not by `DATE(created_at)`. A function on the column forces a scan because the engine can't walk the tree to the matching leaves. A leading `%` in `LIKE` has the same problem: the index is ordered from the start of the string. Rewrite the predicate so the column stands alone on one side. That's what "sargable" means.

```sql
-- ❌ function on column: index on created_at unusable
WHERE DATE(created_at) = '2026-10-09'
-- ✅ sargable range
WHERE created_at >= '2026-10-09' AND created_at < '2026-10-10'

-- ❌ leading wildcard
WHERE title LIKE '%flat%'          -- use FULLTEXT / OpenSearch for text search
-- ❌ implicit type conversion (varchar column compared to number)
WHERE phone = 600123123
-- ❌ OR across different columns can prevent index use → UNION or separate indexes
```

### Pagination
`OFFSET 100000` still walks and throws away those rows, so a deep page costs as much as reading everything before it. Keyset pagination seeks the index at the last seen key and reads only the next page. The client must send that key back. You lose "jump to page 37".

```sql
-- ❌ deep offset: reads and discards 100,000 rows
SELECT ... ORDER BY id LIMIT 20 OFFSET 100000;
-- ✅ keyset
SELECT ... WHERE id > :lastSeenId ORDER BY id LIMIT 20;
```

### Joins and aggregates (quick refresh)
The engine matches the join key, ideally through an index on the foreign key, and then filters. A condition on the right table in `WHERE` runs after the outer join and drops the unmatched NULL rows, which silently turns a `LEFT JOIN` into an inner join. Put that condition in `ON` if those left rows should survive. `WHERE` filters rows before grouping. `HAVING` filters the groups.

```sql
-- Listings per owner, including owners with zero listings
SELECT o.id, o.name, COUNT(l.id) AS listings
FROM owner o
LEFT JOIN listing l ON l.owner_id = o.id AND l.status = 'ACTIVE'
GROUP BY o.id, o.name
ORDER BY listings DESC;

-- Window function (MySQL 8+): top 3 cheapest per city
SELECT * FROM (
  SELECT id, city, price, ROW_NUMBER() OVER (PARTITION BY city ORDER BY price) AS rn
  FROM listing
) t WHERE rn <= 3;
```
- `INNER JOIN` keeps only matches. `LEFT JOIN` keeps every left row (NULLs on the right). `WHERE` filters rows before grouping, and `HAVING` filters groups.
- A filter on the right table in `WHERE` turns a LEFT JOIN into an inner join. Put it in `ON`.

### Transactions, isolation and locking (InnoDB)
InnoDB keeps old row versions in the undo log. Under REPEATABLE READ, the first consistent read builds a snapshot, so another transaction's commit doesn't change what you see if you read the same rows again. A locking read (`SELECT ... FOR UPDATE`) also takes next-key locks on the gaps around those rows, which blocks a phantom insert. A deadlock is two transactions each holding a lock the other needs. InnoDB picks one victim, rolls it back, and your code has to retry.

- ACID. The InnoDB default isolation is **REPEATABLE READ** (MVCC consistent snapshot, plus gap/next-key locks to prevent phantoms on locking reads). Postgres and most others default to READ COMMITTED.
- `SELECT ... FOR UPDATE` locks rows. Keep transactions short. **Deadlocks** happen when two transactions lock rows in opposite order. InnoDB detects them and rolls one back, so the app must **retry**. Lock in a consistent order.
- Optimistic locking via a version column (JPA `@Version`).

### Schema design
Third normal form keeps each fact in one place so an update can't disagree with itself. Denormalise only a read path you've measured, and then that copy has to be updated in the same transaction or rebuilt by a job.

- Normalise first (3NF), then denormalise deliberately for read paths.
- Choose types carefully: `DECIMAL(12,2)` for money, `BIGINT` IDs, `utf8mb4` charset (real UTF-8, including emoji), `DATETIME`/`TIMESTAMP` in UTC.
- Foreign keys with indexes, `NOT NULL` where possible. Migrations go through Flyway/Liquibase.
- Large-table changes: online DDL (`ALGORITHM=INSTANT/INPLACE`) or gh-ost/pt-online-schema-change. Expand → migrate → contract for zero downtime.

### Aurora MySQL specifics
The database nodes don't store the pages. A shared storage volume replicates each write six times across three availability zones, which is why adding a reader doesn't copy a full disk and why failover is promoting a replica instead of restoring one. Readers can still be a few milliseconds behind, so a read of the user's own write should go to the writer.

- MySQL-compatible (Aurora MySQL v3 = MySQL 8.0 compatible). Compute is separated from a **distributed storage layer: 6 copies across 3 AZs**, auto-growing.
- **Writer endpoint** (one primary) plus **reader endpoint** load-balancing up to **15 replicas** with typically millisecond-level replica lag. Failover to a replica usually takes under ~30 s.
- **Aurora Serverless v2**: auto-scales capacity in fine-grained ACUs, which suits spiky or dev workloads.
- **Global Database** for cross-region DR. **RDS Proxy** for connection pooling (important with Lambda). Backtrack, fast clones, Performance Insights.
- App side: send reads to the reader endpoint (e.g. a separate read-only DataSource or `@Transactional(readOnly = true)` routing), but remember **replica lag**, so read-your-own-writes needs the writer.

### Caching
Cache-aside means the app checks Redis, and on a miss loads from MySQL and stores the value with a TTL. Writes must delete or update that key, or the next read serves a stale row. The MySQL query cache was removed in 8.0, so this is your cache, not the engine's. Don't cache a response that differs per user unless the key includes the user.

---

## 2. Interview questions (spoken model answers)

**Q: How do you find and fix a slow query?**
"Find it with the slow query log, Performance Insights or APM traces (New Relic shows the slowest SQL per transaction). Run `EXPLAIN ANALYZE` and look for full scans, filesorts and estimated rows far above returned rows. Then fix: add or reorder a composite index (equality columns first, ideally covering), rewrite non-sargable conditions like functions on columns, select only needed columns, switch deep OFFSET to keyset, and check the ORM isn't doing N+1. Measure again after each change, the same discipline I used for the 40% front-end performance gain on OneHome: measure, change one thing, measure again."

**Q: How does a composite index work? Does column order matter?**
"Yes. It's sorted by the first column, then the second within it, and so on, so it can only be used from the left. For `WHERE city = ? AND price BETWEEN ? AND ?` I'd index `(city, price)`: equality first, range last, because columns after a range can't be used for seeking."

**Q: What's the default isolation level in MySQL and what does it mean?**
"REPEATABLE READ in InnoDB. Each transaction sees a consistent snapshot through MVCC, so repeated reads return the same data, and locking reads use next-key locks to prevent phantoms. It differs from Postgres, which defaults to READ COMMITTED. That's worth knowing when porting logic."

**Q: Why Aurora over plain RDS MySQL?**
"Higher availability and read scaling: storage replicated six ways across three AZs, up to 15 low-lag readers behind one endpoint, faster failover, storage that grows automatically, and Serverless v2 for spiky loads. The trade-offs are cost and some AWS lock-in, though it stays MySQL-compatible so the app and drivers don't change."

**Q: How do you scale reads?**
"Indexes and query fixes first. Then caching hot data in Redis, then read replicas through the reader endpoint, being careful with replica lag for read-after-write flows. CDN caching for public GETs, and denormalised read models or a search engine (OpenSearch/Elasticsearch) for complex search. At EPAM I've worked with Elasticsearch when debugging on call, so I know the search-index side." *(Adjust to what you actually did with Elasticsearch.)*

**Q: What's your SQL background?**
"Mostly PostgreSQL: on Benwer Cars I designed the schema and migrations and wrote the queries through Drizzle. MySQL differences I'd keep in mind: InnoDB's clustered primary key, REPEATABLE READ by default, `utf8mb4`, and different `EXPLAIN` output. The fundamentals are the same."

---

## 3. Traps and gotchas
- `utf8` in MySQL is 3-byte `utf8mb3`, so emoji break. Use `utf8mb4`.
- `COUNT(*)` on huge InnoDB tables is slow (no cached row count).
- Random UUIDv4 primary keys fragment the clustered index. Use BIGINT auto-increment or time-ordered UUIDv7 / ordered binary UUIDs.
- `FLOAT`/`DOUBLE` for money: never.
- An index per column isn't a composite index. MySQL usually uses one index per table access (index merge is the exception).
- Reading from a replica right after a write can return stale data.
- Long transactions hold locks and bloat the undo log.
- `ORDER BY RAND()` on large tables means a full scan plus sort.
