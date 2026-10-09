# 🌀 RxJS Prep Guide

> Group 6 · Corrected version of the former `other/rxjs.md` · Priority MEDIUM when the conversation turns to Angular or to streams
> Legend: **✏️ FIXED** = corrected · **➕ ADDED** = new · unmarked = original
> Related: [angular.md](angular.md) · the JS one-liner is in [javascript.md](../5-js-node-fundamentals/javascript.md)

## What was fixed (changelog)
1. **Version.** ➕ The stable line is **RxJS 7** (7.8.2 as of Feb 2025). **RxJS 8 has no stable release** (the 8.0.0-alpha line stopped in 2024). Don't describe v8 APIs as current.
2. **`toPromise`.** ➕ Deprecated in RxJS 7. The return type became `Promise<T | undefined>` because an Observable can complete without a value. Replacements, both imported from `'rxjs'`: `firstValueFrom` (first emit, then unsubscribe) and `lastValueFrom` (same moment as the old `toPromise`: the last value, on completion). Both **reject with `EmptyError`** if the source completes empty, unless you pass `{ defaultValue }`. `toPromise` is removed only on the v8 alpha, not in 7.x.
3. **Import paths.** ➕ Since **7.2**, operators are exported from `'rxjs'`. `'rxjs/operators'` still works in v7 and is the deprecated export site. `firstValueFrom` was never an operator. The RxJS 5 style `import 'rxjs/add/operator/map'` has been dead since v6.
4. **Deprecated operators in the original list.** ✏️ `pluck` → `map(x => x.field)`. `retryWhen` → `retry({ delay })`.
5. **Cold-observable demo.** ✏️ `of(Math.random())` called twice does **not** show a cold observable. `Math.random()` runs when `of()` is called, before `subscribe`. The fix is one observable subscribed twice, or `defer`.
6. **Angular interop.** ➕ `toSignal` / `toObservable` from `@angular/core/rxjs-interop` (stable since Angular 20). `takeUntilDestroyed` (stable since Angular 19). `httpResource` / `rxResource` when you want a signal and the source is async. Signals did not replace RxJS.
7. **➕ Added** the 30-second summary, questions 11–14, and traps.

## ➕ Say it in 30 seconds
"RxJS models async as a lazy stream: nothing happens until subscribe, it can emit many values, and unsubscribe cancels it. A Promise is eager and one-shot. I compose with pipeable operators imported from `rxjs`, and I pick the flattening operator on purpose: `switchMap` for search, `exhaustMap` for submit, `concatMap` when order matters, `mergeMap` for parallel work. `toPromise` is deprecated. I use `firstValueFrom` for one HTTP response and `lastValueFrom` when I truly want the last value on completion. In Angular, HTTP and form `valueChanges` stay Observables. UI state is a signal, and `toSignal` or `toObservable` is the bridge. I unsubscribe with the async pipe or `takeUntilDestroyed`, not a subscription I hope to remember."

---

## Overview

### 1) What is RxJS?
- **Reactive Extensions for JavaScript** — a library for working with **asynchronous data streams**.  
- Lets you treat **events, HTTP calls, timers, and state changes** as sequences you can compose and transform.  
- Angular’s **HttpClient**, **forms**, and **NgRx** are built around RxJS.

### 2) Core Building Blocks
- **Observable** → source of values (over time).  
- **Observer** → consumers with `next`, `error`, `complete`.  
- **Subscription** → handle to start/stop execution.  
- **Operators** → functions that transform streams (e.g., `map`, `filter`, `switchMap`).  
- **Subject** → both an Observable and an Observer (can emit manually).  

### 3) Types of Observables
- **Cold**: Each subscriber gets its own execution (e.g., `of`, `from`, HTTP requests).  
- **Hot**: Shared execution among subscribers (e.g., `fromEvent`, WebSocket, Subjects).  

### 4) Key Operator Categories
- **Creation**: `of`, `from`, `interval`, `fromEvent`.  
- **Transformation**: `map`, `scan`. ✏️ `pluck` is **deprecated** since RxJS 7. Use `map(x => x.city)`.
- **Filtering**: `filter`, `debounceTime`, `take`, `distinctUntilChanged`.  
- **Combination**: `merge`, `concat`, `combineLatest`, `forkJoin`, `zip`.  
- **Flattening**: `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`.  
- **Error Handling**: `catchError`, `retry`. ✏️ `retryWhen` is **deprecated**. Use `retry({ count: 2, delay: 500 })` or `retry({ delay: (err, n) => timer(n * 200) })`.  

### 5) Subjects & Variants
- **Subject**: plain multicaster.  
- **BehaviorSubject**: stores last value (great for state).  
- **ReplaySubject**: replays buffer of old values.  
- **AsyncSubject**: emits last value only on completion.  

### 6) RxJS in Angular
- **HttpClient** returns `Observable<T>` instead of Promise.  
- **Forms** → `form.valueChanges.pipe(...)`.  
- **Events** → `fromEvent(button, 'click')`.  
- **NgRx Effects** → use `actions$.pipe(...)`.  
- **AsyncPipe** → subscribes/unsubscribes automatically in templates.  

### 7) Best Practices
- Always **unsubscribe** long-lived streams → `AsyncPipe`, `takeUntilDestroyed()`, or `takeUntil`. A single `HttpClient` get completes, so it does not leak by itself.
- Prefer **switchMap** for typeahead. ✏️ Not for every HTTP call: a submit button wants **exhaustMap** so a double click cannot cancel the first POST.
- Avoid nested `subscribe` → compose with operators instead.  
- Keep types explicit → `Observable<T>`.
- ➕ Import operators and `firstValueFrom` from `'rxjs'`, not `'rxjs/operators'`.  

⚡ **In one line:**  
RxJS = *a toolkit for handling async values as streams, transforming them with operators, and composing them cleanly in Angular/Node apps.*  

---

# 🌀 RxJS Interview Q&A (Extended)

---

## 1) Promise vs Observable
**Context:** Angular’s HttpClient uses Observables, not Promises. This is a very frequent interview starter.  

**Answer:**  
- **Promise**: eager, resolves once, not cancellable.  
- **Observable**: lazy, can emit many values, cancellable, composable with operators.  

**Code:**  
```ts
// Promise
fetch('/api').then(r => r.json()).then(console.log);

// Observable
this.http.get('/api').subscribe(console.log);
```

**Takeaway:** Observables generalize Promises and integrate better with Angular’s change detection and RxJS operators.  

---

## 2) What is an Observable?
**Context:** Fundamental concept — expect this as a definition question.  

**Answer:**  
An **Observable** is a lazy stream of values delivered over time. It doesn’t start producing until subscribed.  

**Code:**  
```ts
import { Observable } from 'rxjs';

const obs = new Observable(observer => {
  observer.next('Hello');
  observer.next('World');
  observer.complete();
});

obs.subscribe(console.log); // prints Hello, World
```

**Takeaway:** Observables describe data over time and only execute when subscribed.  

---

## 3) What are Hot vs Cold Observables?
**Context:** Important in real-time apps (streaming, sockets).  

**Answer:**  
- **Cold**: each subscriber gets its own producer (e.g., `of`, `from`).  
- **Hot**: subscribers share a producer (e.g., `fromEvent`, Subjects).  

**Code:**  
```ts
import { Observable, fromEvent } from 'rxjs';

// ✏️ FIXED. of(Math.random()) is not the demo: Math.random() runs
// when of() is called, so two of() calls are just two observables.
const cold = new Observable<number>((subscriber) => {
  subscriber.next(Math.random());
  subscriber.complete();
});
cold.subscribe(console.log); // 0.42
cold.subscribe(console.log); // 0.91 — same observable, new execution

// Hot source: the DOM exists whether or not anyone is subscribed.
// Each fromEvent subscription still adds its own listener.
fromEvent(document, 'click').subscribe(() => console.log('click 1'));
fromEvent(document, 'click').subscribe(() => console.log('click 2'));
```

**Takeaway:** Cold = the producer is created inside `subscribe`. Hot = the producer exists independently (DOM events, a Subject, a WebSocket). Subjects are hot. `HttpClient` is cold: every subscriber makes a request.  

---

## 4) Key RxJS Operators
**Context:** Operators are the power of RxJS — expect to explain flattening ones.  

**Answer:**  
- **switchMap**: cancel old, keep latest (good for search).  
- **mergeMap**: run all in parallel.  
- **concatMap**: queue, run sequentially.  
- **exhaustMap**: ignore new until current finishes.  

**Code:**  
```ts
search$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.http.get(`/api?q=${query}`))
).subscribe(console.log);
```

**Takeaway:** Choose the right flattening operator based on concurrency needs.  

---

## 5) Error handling in RxJS
**Context:** APIs fail; interviewers check if you know how to recover.  

**Answer:**  
Use `catchError` to replace stream, `retry` for auto retries.  

**Code:**  
```ts
this.http.get('/api/listings').pipe(
  retry(2),
  catchError(err => of([])) // fallback to empty list
).subscribe(console.log);
```

**Takeaway:** RxJS error handling is declarative and composable.  

---

## 6) What is a Subject?
**Context:** Subjects are bridges between imperative and reactive code.  

**Answer:**  
A **Subject** is both an Observable and Observer: you can `next()` into it, and others can subscribe.  

**Code:**  
```ts
import { Subject } from 'rxjs';

const subject = new Subject<string>();
subject.subscribe(v => console.log('A:', v));
subject.subscribe(v => console.log('B:', v));

subject.next('Hello'); // A: Hello, B: Hello
```

**Takeaway:** Use Subjects to multicast or manually push values into streams.  

---

## 7) BehaviorSubject vs ReplaySubject
**Context:** Angular state management (NgRx, services) often use these.  

**Answer:**  
- **BehaviorSubject**: stores latest value, emits it immediately to new subscribers.  
- **ReplaySubject**: stores a buffer of past values, replays them to new subscribers.  

**Code:**  
```ts
const b = new BehaviorSubject(0);
b.subscribe(v => console.log('A:', v));
b.next(1);
b.subscribe(v => console.log('B:', v)); // gets 1 immediately

const r = new ReplaySubject(2); // buffer of 2
r.next(1); r.next(2); r.next(3);
r.subscribe(v => console.log('C:', v)); // replays 2,3
```

**Takeaway:** Behavior = latest, Replay = history buffer.  

---

## 8) How to unsubscribe in Angular
**Context:** Memory leaks are a real risk. This is often asked.  

**Answer:**  
- Use `AsyncPipe` in templates (auto unsubscribe).  
- Or use `takeUntil` pattern in services/components.  

**Code:**  
```ts
// AsyncPipe
<p *ngFor="let item of items$ | async">{{ item }}</p>

// takeUntil
private destroy$ = new Subject<void>();
ngOnInit() {
  this.items$.pipe(takeUntil(this.destroy$)).subscribe();
}
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

**Takeaway:** Always unsubscribe long-lived streams. AsyncPipe is easiest. ➕ In Angular, `takeUntilDestroyed()` from `@angular/core/rxjs-interop` (stable since v19) replaces the hand-written `destroy$` Subject. Call it in an injection context (a field initializer or the constructor), or pass the `DestroyRef` you injected. `HttpClient.get` completes after one response, so that particular subscription is not the leak. `valueChanges`, `interval`, router events and `fromEvent` are.  

---

## 9) combineLatest vs forkJoin vs zip
**Context:** Often asked in data-joining questions.  

**Answer:**  
- **combineLatest**: emits when *any* source emits (needs all to emit once).  
- **forkJoin**: waits for all to complete, then emits once.  
- **zip**: pairs emissions together in order.  

**Code:**  
```ts
combineLatest([obs1, obs2]); // emits [v1,v2] whenever either changes
forkJoin([obs1, obs2]); // emits once when both complete
zip(obs1, obs2); // emits [v1,v2] in lockstep
```

**Takeaway:** combineLatest = ongoing sync, forkJoin = one-shot, zip = pairwise.  

---

## 10) Debounce user input
**Context:** Classic search box problem — must cancel old calls.  

**Answer:**  
Use `debounceTime`, `distinctUntilChanged`, and `switchMap`.  

**Code:**  
```ts
fromEvent(inputEl, 'input').pipe(
  map((e:any) => e.target.value),
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.http.get(`/api?q=${q}`))
).subscribe(console.log);
```

**Takeaway:** Debounce + switchMap prevents flooding API with requests. A form **submit** is the opposite choice: `exhaustMap`, so the in-flight POST is not cancelled by a second click.

---

## ➕ 11) `toPromise` vs `firstValueFrom` vs `lastValueFrom`
**Context:** Asked the moment an Angular codebase still has `.toPromise()`.

**Answer:**
- `toPromise()` is **deprecated in RxJS 7** and deleted on the unreleased v8 line. In v7 its type is `Promise<T | undefined>`, because completion with zero values used to resolve `undefined` while the old type pretended it was `T`.
- `lastValueFrom(source$)` is the behavior match: the **last** value emitted before completion. `HttpClient` emits once and completes, so it matches `toPromise` for a normal response.
- `firstValueFrom(source$)` resolves on the **first** value and unsubscribes immediately. Prefer it for HTTP and for any stream you must not leave running. It does not wait for completion.
- Both reject with `EmptyError` if the source completes without a value. Pass `{ defaultValue }` to resolve instead. If the source never emits and never completes, the Promise never settles. Add `timeout` or `take` when that is possible.

```ts
import { firstValueFrom, lastValueFrom } from "rxjs"; // not from 'rxjs/operators'

const user = await firstValueFrom(this.http.get<User>(`/api/users/${id}`));
const last = await lastValueFrom(ticks$, { defaultValue: 0 });
```

**Takeaway:** New code uses `firstValueFrom` for one HTTP response. Say "deprecated", not "removed", while the project is on RxJS 7.

## ➕ 12) Where do you import operators from?
**Context:** Codebases still mix three eras.

**Answer:**
- **RxJS 5:** `import 'rxjs/add/operator/map'` patched `Observable.prototype`. Gone.
- **RxJS 6:** pipeable operators from `'rxjs/operators'`, creation functions from `'rxjs'`.
- **RxJS 7.2+ (current):** import both from `'rxjs'`. `'rxjs/operators'` is still there in v7, deprecated, and it is where a few old names were left (`combineLatest` the operator → use `combineLatestWith` or the creation function `combineLatest` from `'rxjs'`).

```ts
import { combineLatest, firstValueFrom, map, switchMap } from "rxjs";
```

Other entry points that are still real: `'rxjs/ajax'`, `'rxjs/fetch'`, `'rxjs/webSocket'`, `'rxjs/testing'`.

**Takeaway:** One import site, `'rxjs'`. If you see `rxjs/internal/...`, that is private and will break.

## ➕ 13) RxJS and Angular signals
**Context:** "Did signals replace RxJS?" No.

**Answer:**
- Signals are synchronous pull. Observables are async push. HttpClient, `valueChanges`, WebSockets and NgRx effects stay Observables.
- `toSignal(source$, { initialValue })` from `@angular/core/rxjs-interop` subscribes **immediately** (it is eager, unlike the Observable) and unsubscribes when the injection context is destroyed. The signal always holds the latest value. An erroring source throws when the signal is read.
- `toObservable(sig)` emits the signal's value over time. The first value can be synchronous. Later values are asynchronous. It needs an injection context because it uses an `effect`.
- `takeUntilDestroyed()` is the unsubscribe helper for code that must stay an Observable.
- `httpResource` (stable in Angular 22) is the signal-shaped HTTP fetch and cancels the previous request when its URL signal changes. `rxResource` is the resource whose loader returns an Observable. Use them when the UI wants a signal. Use `HttpClient` when you need operators.

```ts
import { toSignal } from "@angular/core/rxjs-interop";

users = toSignal(this.http.get<User[]>("/api/users"), { initialValue: [] });
// template: @for (u of users(); track u.id) { ... }  — no async pipe, no unsubscribe
```

**Takeaway:** Bridge at the boundary. Don't rewrite a `switchMap` pipeline as five `effect()`s.

## ➕ 14) Which flattening operator, and why?
**Answer:** All four subscribe to an inner Observable. They differ in what they do with the previous one.

| Operator | In-flight work | Use |
|---|---|---|
| `switchMap` | Cancels the previous | Typeahead, a route param that should drop the old id |
| `mergeMap` | Runs all of them | Independent parallel reads. Unbounded by default. `mergeMap(fn, 4)` caps concurrency |
| `concatMap` | Queues | Order matters: a sequence of writes |
| `exhaustMap` | Ignores new inners until the current one finishes | Submit, save, "don't double-charge" |

**Takeaway:** Name the cancellation policy, not just the operator.

---

# ➕ Traps and gotchas

- `of(Math.random())` twice is two observables, not one cold observable subscribed twice. See question 3.
- `firstValueFrom` on a stream that never emits and never completes hangs forever. HTTP is safe because it completes or errors. A Subject is not.
- `lastValueFrom` on `HttpClient` works, but it waits for completion. `firstValueFrom` releases the subscription sooner and is the one to recommend.
- `forkJoin` on a source that never completes never emits. A `BehaviorSubject` in that list is a hang. `HttpClient` is fine because it completes.
- `combineLatest` stays silent until **every** source has emitted once. A missing initial value looks like a broken stream.
- `shareReplay(1)` without `refCount: true` keeps the source subscribed after the last subscriber leaves. That leaks intervals and HTTP polls. Prefer `shareReplay({ bufferSize: 1, refCount: true })`.
- Nested `subscribe` inside `subscribe` drops errors and cancellation. Flatten.
- `catchError(() => of([]))` without logging turns outages into empty pages. Catch at the boundary where you can show an error, not in the middle of a pipeline by reflex.
- Importing `map` from `'rxjs/operators'` is not a bug on v7. Teaching it as the current path is.
- `toSignal` without `initialValue` is `T | undefined`, and it subscribes immediately, including in a test, before you wanted it to.
- `pluck` and `retryWhen` in a new snippet. Both are deprecated.
