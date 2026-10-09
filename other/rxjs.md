# 🌀 RxJS Prep Guide

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
- **Transformation**: `map`, `scan`, `pluck`.  
- **Filtering**: `filter`, `debounceTime`, `take`, `distinctUntilChanged`.  
- **Combination**: `merge`, `concat`, `combineLatest`, `forkJoin`, `zip`.  
- **Flattening**: `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`.  
- **Error Handling**: `catchError`, `retry`, `retryWhen`.  

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
- Always **unsubscribe** → `AsyncPipe` or `takeUntil`.  
- Prefer **switchMap** for HTTP calls.  
- Avoid nested `subscribe` → compose with operators instead.  
- Keep types explicit → `Observable<T>`.  

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
import { fromEvent, of } from 'rxjs';

// Cold: new values for each subscriber
of(Math.random()).subscribe(console.log); // 0.42
of(Math.random()).subscribe(console.log); // 0.77

// Hot: same producer shared
fromEvent(document, 'click').subscribe(e => console.log('click 1', e));
fromEvent(document, 'click').subscribe(e => console.log('click 2', e));
```

**Takeaway:** Cold = independent streams, Hot = shared source.  

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
this.http.get('/api/rollovers').pipe(
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

**Takeaway:** Always unsubscribe; AsyncPipe is easiest, `takeUntil` is safest in code.  

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

**Takeaway:** Debounce + switchMap prevents flooding API with requests.  

---
