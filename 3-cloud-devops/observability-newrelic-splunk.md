# Observability: New Relic, Splunk (and CloudWatch)

> Group 3 · Priority MEDIUM · Prep guide Q24 · Status: new file
> Honest framing: Rafael's real tools are **PagerDuty on-call, Elasticsearch log queries, Kafka lag monitoring, Mixpanel, GCP logs**. Don't claim New Relic or Splunk hands-on unless true. The bridge: "same workflow, different tools".

## Say it in 30 seconds
"Observability is being able to answer 'what's wrong and why' from the outside, using logs, metrics and traces tied together by a trace or correlation ID. I alert on user-facing symptoms like error rate, latency and queue lag rather than CPU, with dashboards and runbooks behind each alert. New Relic is the APM side: transactions, slow SQL, distributed traces, browser and Core Web Vitals. Splunk is log search and analytics. At EPAM I'm on PagerDuty on-call, where I debug with Elasticsearch log queries, Kafka consumer lag and Mixpanel for user impact. New Relic and Splunk are the same workflow with different query languages."

---

## 1. Core concepts

### The three pillars (plus one)
| Signal | Answers | Examples |
|---|---|---|
| **Metrics** | *Is something wrong?* Cheap, aggregatable | Request rate, error rate, p95/p99 latency, JVM heap, queue depth |
| **Logs** | *What exactly happened?* | Structured JSON events with context |
| **Traces** | *Where is the time or error?* across services | Span tree: React → API gateway → Spring service → SQL → SQS |
| **(Profiles / RUM)** | Code hotspots. Real-user front-end performance | New Relic Browser, Core Web Vitals |

- Golden signals (Google SRE): **latency, traffic, errors, saturation**. RED for services (Rate, Errors, Duration), USE for resources (Utilisation, Saturation, Errors).
- **SLI** (measured, e.g. % of requests < 300 ms) → **SLO** (target, e.g. 99.5% over 28 days) → **error budget** (allowed failure, which drives release pace). SLA = contractual.
- **OpenTelemetry**: vendor-neutral standard for traces, metrics and logs. Instrument once, export to New Relic, Splunk, Datadog or CloudWatch. Spring Boot 3 uses **Micrometer Observation/Tracing** and can export via OTLP.

### Structured logging + correlation
```json
{"ts":"2026-10-09T10:15:02Z","level":"ERROR","service":"listing-api","traceId":"4bf92f35...","spanId":"00f067aa...",
 "userId":"u-123","path":"/api/v1/listings/42","status":500,"durationMs":1834,"msg":"Pricing call timed out"}
```
- Spring Boot 3.4+ has built-in structured logging (`logging.structured.format.console=ecs` or `logstash`). With Micrometer Tracing, `traceId`/`spanId` go into the MDC automatically.
- Propagate W3C `traceparent` across HTTP and messages (SQS message attributes) so one trace spans services.
- **Don't log PII or secrets** (tokens, passwords, emails), and mask where needed (GDPR, OWASP 2025 A09).

### New Relic (APM)
- **Java agent** (`-javaagent:newrelic.jar`, license key from secrets) auto-instruments Spring MVC, JDBC, HTTP clients and messaging. **Browser agent** for React: page loads, JS errors, AJAX, Core Web Vitals, SPA route changes.
- Key views: **APM summary** (throughput, response time, error rate, **Apdex**), **Transactions** (slowest endpoints, breakdown by segment: SQL, external calls), **Databases** (slow queries, N+1 patterns show as many identical calls per transaction), **Distributed tracing**, **Errors inbox**, **Service map**, **Deployments markers** (correlate a release with a regression).
- **NRQL** (query language):
```sql
SELECT percentile(duration, 95) FROM Transaction WHERE appName = 'listing-api' FACET name SINCE 1 hour ago TIMESERIES
SELECT count(*) FROM TransactionError WHERE appName = 'listing-api' FACET error.class SINCE 30 minutes ago
SELECT average(largestContentfulPaint) FROM PageViewTiming WHERE appName = 'web' FACET pageUrl SINCE 1 day ago
```
- **Alerts**: NRQL alert conditions (static or anomaly baselines) → notification workflows (PagerDuty, Slack).

### Splunk (logs and analytics)
- Ingests logs (Universal Forwarder, HTTP Event Collector, or AWS FireLens/Firehose from ECS), indexes them, and you search with **SPL**.
```text
index=prod sourcetype=listing-api level=ERROR earliest=-30m
| stats count by error_class, path | sort -count

index=prod service=listing-api traceId="4bf92f35*"            ← follow one request across services

index=prod service=listing-api
| timechart span=5m perc95(durationMs) as p95, count(eval(status>=500)) as errors
```
- Building blocks: `index`, `sourcetype`, `| stats`, `| timechart`, `| where`, `| rex` (regex extract), `| table`, `| dedup`, saved searches, alerts, dashboards. Splunk Observability Cloud also does APM/infra (it overlaps with New Relic).

### CloudWatch (AWS baseline)
Metrics for ALB, ECS, SQS, Aurora and Lambda. Logs Insights queries, alarms → SNS → PagerDuty. Container Insights for ECS. X-Ray / ADOT for traces.

### Alerting principles
- Alert on **symptoms users feel** (error rate, latency SLO burn, queue age, failed payments), not on every cause (CPU 80%).
- Every alert must be **actionable** and have a runbook link. Page only for urgent issues, and send the rest to tickets or Slack.
- Use multi-window burn-rate alerts for SLOs. Review noisy alerts after incidents.

### Incident flow (your real on-call experience)
Detect (PagerDuty alert) → triage scope and user impact (Mixpanel funnels, error rates) → trace (logs and Elasticsearch queries, traces, Kafka consumer lag and partition offsets) → mitigate (rollback, feature flag off, scale or restart consumers) → root cause → follow-ups (test, alert tuning, runbook, blameless postmortem).

---

## 2. Interview questions (spoken model answers)

**Q: How do you monitor production and handle alerts?**
"Metrics, logs and traces correlated by a trace ID, with alerts on symptoms like error rate, latency SLOs and queue lag, each with a dashboard and a runbook. At EPAM I'm on PagerDuty on-call. When an alert fires, I check user impact in Mixpanel, dig into logs with Elasticsearch queries, check Kafka consumer lag and offsets if it's an event flow, mitigate first, then find the root cause and add a test or better alert. With New Relic and Splunk it's the same flow: APM to find the slow or failing transaction, then Splunk to read the exact logs for that trace." *(Plug in a real incident: [your PagerDuty example].)*

**Q: Have you used New Relic or Splunk?**
"Not hands-on day to day. My tools have been Elasticsearch, GCP logging, PagerDuty and Mixpanel. But the concepts are identical: APM transaction traces, slow-query views, log search with aggregations, alerting. I know NRQL and SPL basics and would be productive quickly." *(Only claim what's true.)*

**Q: Logs vs metrics vs traces?**
"Metrics tell me something is wrong, cheaply and over time. Traces tell me where across services the time or error is. Logs tell me exactly what happened in that request. A trace ID in every log line links them."

**Q: How would you find why an endpoint got slow after a release?**
"Check the deployment marker against the latency graph in APM, open the slowest transaction traces, and look at the breakdown: usually a new slow SQL query or N+1, an external call without a timeout, or a missing index. Confirm in the logs for those trace IDs, then roll back if it's user-impacting, and fix forward with a test or an index."

**Q: What's an SLO and why use one?**
"A target for a user-facing indicator, like 99.5% of searches under 500 ms over 28 days. The remaining error budget tells the team when to slow feature work and invest in reliability. It turns 'is it reliable enough?' into data."

**Q: How do you monitor the front end?**
"Real-user monitoring (New Relic Browser or similar): Core Web Vitals (LCP, INP, CLS) by page and device, JS errors with source maps, failed API calls. Plus product analytics (Mixpanel at EPAM) to see user-impact and funnel drops. That's how we confirmed the OneHome performance gains in real usage." *(Only say the last sentence if true.)*

---

## 3. Traps and gotchas
- Alerting on CPU or memory instead of user impact causes alert fatigue.
- Unstructured logs with no trace IDs can't be correlated.
- Logging PII or tokens is a GDPR and security issue.
- High-cardinality labels (userId) in metrics blow up cost. Put those in logs or traces.
- Averages hide pain. Use p95/p99.
- No timeouts on outbound calls means thread exhaustion that looks like "random slowness".
- Claiming New Relic or Splunk depth you don't have. Use the bridge answer.
