# MySQL / Aurora: SQL and Query Performance

> Group 1 · Priority MEDIUM · Prep guide Q25 · Status: new file
> Honest framing: Rafael's production SQL is mainly PostgreSQL (Benwer Cars with Drizzle). The concepts transfer, and the MySQL-specific points are marked.

## Say it in 30 seconds
"For a slow query I measure first: the slow query log or APM finds it, and `EXPLAIN` / `EXPLAIN ANALYZE` shows whether it's scanning. Usually the fix is the right index: composite with the equality columns first, covering where possible. Also don't wrap indexed columns in functions, avoid `SELECT *`, use keyset pagination instead of deep OFFSET, and fix N+1 at the ORM level. Aurora MySQL is AWS's MySQL-compatible engine, with storage replicated six ways across three availability zones, up to 15 low-lag read replicas behind a reader endpoint, and fast failover. My hands-on SQL is mostly Postgres, but indexing and query plans work the same way."

---

## 1. Core concepts

### Indexes (InnoDB B+tree)
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
| Field | Look for |
|---|---|
| `type` | `const`/`eq_ref`/`ref`/`range` are good. **`ALL`** is a full table scan, and `index` is a full index scan |
| `key` | Which index was chosen (NULL means none) |
| `rows` | Estimated rows examined. Compare it to the rows returned |
| `Extra` | `Using index` (covering, good). `Using filesort` / `Using temporary` are red flags on big sets |

MySQL 8.0.18+ has `EXPLAIN ANALYZE`, which shows actual timings. In Postgres, `EXPLAIN (ANALYZE, BUFFERS)` gives Seq Scan vs Index Scan.

### Index killers
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
```sql
-- ❌ deep offset: reads and discards 100,000 rows
SELECT ... ORDER BY id LIMIT 20 OFFSET 100000;
-- ✅ keyset
SELECT ... WHERE id > :lastSeenId ORDER BY id LIMIT 20;
```

### Joins and aggregates (quick refresh)
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
- ACID. The InnoDB default isolation is **REPEATABLE READ** (MVCC consistent snapshot, plus gap/next-key locks to prevent phantoms on locking reads). Postgres and most others default to READ COMMITTED.
- `SELECT ... FOR UPDATE` locks rows. Keep transactions short. **Deadlocks** happen when two transactions lock rows in opposite order. InnoDB detects them and rolls one back, so the app must **retry**. Lock in a consistent order.
- Optimistic locking via a version column (JPA `@Version`).

### Schema design
- Normalise first (3NF), then denormalise deliberately for read paths.
- Choose types carefully: `DECIMAL(12,2)` for money, `BIGINT` IDs, `utf8mb4` charset (real UTF-8, including emoji), `DATETIME`/`TIMESTAMP` in UTC.
- Foreign keys with indexes, `NOT NULL` where possible. Migrations go through Flyway/Liquibase.
- Large-table changes: online DDL (`ALGORITHM=INSTANT/INPLACE`) or gh-ost/pt-online-schema-change. Expand → migrate → contract for zero downtime.

### Aurora MySQL specifics
- MySQL-compatible (Aurora MySQL v3 = MySQL 8.0 compatible). Compute is separated from a **distributed storage layer: 6 copies across 3 AZs**, auto-growing.
- **Writer endpoint** (one primary) plus **reader endpoint** load-balancing up to **15 replicas** with typically millisecond-level replica lag. Failover to a replica usually takes under ~30 s.
- **Aurora Serverless v2**: auto-scales capacity in fine-grained ACUs, which suits spiky or dev workloads.
- **Global Database** for cross-region DR. **RDS Proxy** for connection pooling (important with Lambda). Backtrack, fast clones, Performance Insights.
- App side: send reads to the reader endpoint (e.g. a separate read-only DataSource or `@Transactional(readOnly = true)` routing), but remember **replica lag**, so read-your-own-writes needs the writer.

### Caching
Cache hot reads (Redis/ElastiCache) with TTL plus invalidation on write. Cache-aside is the usual pattern. The MySQL query cache was removed in 8.0.

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
