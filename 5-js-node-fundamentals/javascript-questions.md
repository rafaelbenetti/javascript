# 🟨 JavaScript Prep — Overview + Top 40 Interview Q&A

> Group 5 · Priority MEDIUM

## Say it in 1 minute
"If I had a minute on JavaScript, I would start with the runtime. It is dynamically typed and single-threaded, and V8 JIT-compiles hot code. Concurrency is the event loop: synchronous code on the call stack, promise callbacks on the microtask queue, drained completely before the next task, and timers or I/O as macrotasks. That ordering is why a few console logs surprise people. Next I expect scope and closures, hoisting with the temporal dead zone, the rules for this, and prototypes, because class is sugar over them. Async and await is promises with clearer syntax, so rejection and Promise.all still matter. Day to day I write TypeScript: modules, optional chaining, nullish coalescing, toSorted, and structuredClone when a shallow copy would lie."


---

## 📖 Quick Overview  

- **What is JavaScript?** → Dynamically typed, single-threaded language, **JIT-compiled** by modern engines (V8, SpiderMonkey, JavaScriptCore). Runs in browsers & servers (Node.js, Deno, Bun).  
- **Paradigms**: Event-driven, functional, OOP.  
- **Key Concepts**:  
  - **Execution Context & Call Stack**  
  - **Hoisting**  
  - **Closures**  
  - **Prototype & Inheritance**  
  - **Async (Promises, async/await, Event Loop)**  
  - **ES6+ features**: let/const, arrow functions, destructuring, modules.  
- **Runtime Environments**:  
  - **Browser** → DOM, BOM, Web APIs.  
  - **Node.js** → File system, network, server APIs.  

---

## ❓ Top 40 Questions & Answers  

### 1) What are the different data types in JavaScript?  
- **Primitive**: string, number, boolean, null, undefined, symbol, bigint.  
- **Non-primitive**: objects, arrays, functions.  

---

### 2) What is the difference between `var`, `let`, and `const`?  
- `var`: function-scoped, hoisted (initialised to `undefined`), allows redeclaration.  Top-level `var` becomes a property of `window`.  
- `let`: block-scoped, no redeclaration.  Hoisted but in the **TDZ** until its declaration runs (access before throws `ReferenceError`).  
- `const`: block-scoped, must be initialized, cannot be reassigned (but objects mutable).  Same TDZ.  
-  In loops, `let` creates a new binding per iteration (fixes the classic `setTimeout` in `for (var i…)` bug).  

---

### 3) Explain hoisting in JavaScript.  
- nothing is physically "moved". During the **creation phase** of a scope, the engine registers declarations first: `function` declarations are fully initialised (callable before their line), `var` is initialised to `undefined`, and `let`/`const`/`class` are registered but **uninitialised (TDZ)**.  
```js
console.log(a); // undefined  (var: hoisted + initialised to undefined)
var a = 10;

console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization (TDZ)
let b = 10;

greet();        // ✅ works: function declarations are hoisted with their body
function greet() {}
```

---

### 4) What are closures?  
- A closure is when a function remembers variables from its outer scope even after execution.  
```js
function outer() {
  let count = 0;
  return function inner() { count++; return count; }
}
const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

---

### 5) What is the difference between `==` and `===`?  
- `==` → loose equality, performs type coercion.  
- `===` → strict equality, checks value + type.  

---

### 6) What is the difference between null and undefined?  
- `undefined` → variable declared but not assigned.  
- `null` → explicitly set to “empty”.  

---

### 7) What are template literals?  
- Introduced in ES6, allow string interpolation.  
```js
const name = "John";
console.log(`Hello ${name}`);
```

---

### 8) Explain destructuring in JavaScript.  
- Extract values from arrays/objects into variables.  
```js
const [a, b] = [1, 2];
const {x, y} = {x:10, y:20};
```

---

### 9) What are arrow functions?  
- Shorter syntax, lexical `this`.  
```js
const add = (a,b) => a+b;
```

---

### 10) What is the difference between function declaration and function expression?  
- **Declaration**: hoisted (with its body).  
- **Expression**: the *variable* is hoisted, the *function value* isn't. With `var` you get `TypeError: x is not a function` (it's `undefined`). With `let`/`const`, a `ReferenceError` (TDZ).  

---

### 11) What are higher-order functions?  
- Functions that take other functions as arguments or return them.  
```js
[1,2,3].map(x => x*2);
```

---

### 12) What are callbacks?  
- Functions passed into another function to be executed later.  

---

### 13) What are promises?  
- Objects representing eventual completion/failure of async operation.  
```js
fetch('/api').then(res => res.json()).catch(err => console.error(err));
```

---

### 14) Explain async/await.  
- Syntactic sugar over promises for synchronous-looking async code.  
```js
async function getData() {
  const res = await fetch('/api');
  return res.json();
}
```

---

### 15) What is the event loop in JavaScript?  
- Mechanism that handles async tasks.  
- Executes **call stack** first, then processes **callback/microtask queue**.  
- **Precise rule:** run one macrotask (script, timer callback, I/O event) → when the stack is empty, **drain the whole microtask queue** (including microtasks queued by microtasks) → browser may render → next macrotask. So a promise chain always runs before a `setTimeout(…, 0)`.  

---

### 16) What is the difference between microtasks and macrotasks?  
- **Microtasks** → promises, queueMicrotask.  `MutationObserver`, `await` continuations. (Node: `process.nextTick` runs even before promise microtasks.)  
- **Macrotasks** → setTimeout, setInterval.  I/O, UI events, `MessageChannel`, `setImmediate` (Node).  

---

### 17) What are prototypes in JavaScript?  
- Every object has a prototype → inheritance chain (`__proto__`).  
- Used for OOP in JS.  

---

### 18) Explain prototypal inheritance.  
- Objects inherit from other objects via prototype chain.  

---

### 19) What is the difference between `Object.create()` and `class`?  
- `Object.create()` → directly sets prototype.  
- `class` → syntactic sugar over prototype-based inheritance.  

---

### 20) What are modules in JavaScript?  
- **ES6 modules**: `import` / `export`.  
- Support code reusability, encapsulation.  

---

### 21) What is the difference between default and named exports?  
- **Default export** → only one per file. Importer picks any name.  
- **Named exports** → multiple,  imported by their exported name **or renamed** with `import { a as b }`.  Many teams prefer named exports (better refactoring and tree-shaking clarity).  

---

### 22) What are IIFEs (Immediately Invoked Function Expressions)?  
```js
(function() { console.log("Run immediately"); })();
```

---

### 23) What is `this` in JavaScript?  
- Refers to the execution context.  
- Behavior depends on how function is called.  

---

### 24) How does `bind`, `call`, and `apply` work?  
- `call` → invokes with args separated.  
- `apply` → invokes with args array.  
- `bind` → returns new function with bound context.  

---

### 25) What are pure functions?  
- Functions that always return same output for same input, no side effects.  

---

### 26) Explain immutability in JavaScript.  
- Avoid modifying existing data → return new objects/arrays.  
```js
const arr = [1,2];
const newArr = [...arr, 3];
```

---

### 27) What are async iterators?  
- Iterate over async data streams.  
```js
for await (let val of asyncGen()) { console.log(val); }
```

---

### 28) What is event delegation?  
- Attach a single event listener to parent, handle children via bubbling.  

---

### 29) What are JavaScript generators?  
- Functions with `function*` that yield values.  
```js
function* gen() {
  yield 1; yield 2;
}
```

---

### 30) What are symbols in JavaScript?  
- Unique identifiers, used as object keys.  

---

### 31) What are WeakMap and WeakSet?  
- Weakly held collections (keys must be objects).  
- Do not prevent garbage collection.  

---

### 32) Explain the difference between shallow copy and deep copy.  
- Shallow → copies references.  
- Deep → copies values recursively.  
- Deep clone: `structuredClone(obj)` (modern).  

---

### 33) How does garbage collection work in JavaScript?  
- Automatic, based on **reachability**.  

---

### 34) What is a polyfill?  
- JS code that adds features missing in old browsers.  

---

### 35) What are service workers?  
- Background scripts enabling offline caching, push notifications, PWA features.  

---

### 36) Explain debouncing vs throttling.  
- **Debounce** → wait until no more events before running.  
- **Throttle** → limit executions per time window.  

---

### 37) What is the difference between `map`, `forEach`, `filter`, `reduce`?  
- `map` → transform array, returns new.  
- `forEach` → iterate, no return.  
- `filter` → return elements matching condition.  
- `reduce` → accumulate to single value.  

---

### 38) What are async modules (dynamic imports)?  
```js
import('./module.js').then(m => m.doWork());
```

---

### 39) How does optional chaining work?  
```js
let user = {};
console.log(user?.profile?.email); // undefined, no error
```

---

### 40) What are some ES2020+ features?  
- Nullish coalescing `??`. (ES2020)  
- Optional chaining `?.`. (ES2020)  
-  Top-level `await`. (**ES2022**, modules only)  
-  Private class fields `#field`. (**ES2022**)  
-  ES2021: `??=`, `||=`, `&&=`, `replaceAll`, `Promise.any`, numeric separators.  
-  ES2022: `.at()`, `Object.hasOwn`, `Error` `cause`, class static blocks.  
-  ES2023: `toSorted`, `toReversed`, `toSpliced`, `with` (non-mutating), `findLast`/`findLastIndex`.  
-  ES2024: `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`, `Array.fromAsync`, resizable `ArrayBuffer`.  
-  ES2025: Iterator helpers (`.map/.filter/.take` on iterators), new `Set` methods (`union`, `intersection`, `difference`…), `RegExp.escape`, `Promise.try`, import attributes / JSON modules.  

---

### 41) What does this print? (event loop)
```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3)).then(() => console.log(4));
queueMicrotask(() => console.log(5));
console.log(6);
// 1, 6, 3, 5, 4, 2  → sync first, then microtasks in queue order (3, 5, then 4 queued by 3), then the timer
```

---

### 42) The 4 (+1) rules of `this`
1. `new Foo()` → the new object.  
2. Explicit: `call`/`apply`/`bind` → the given object.  
3. Implicit: `obj.method()` → `obj` (lost when you pass `obj.method` as a callback!).  
4. Default: plain call → `undefined` in strict mode/modules, `globalThis` in sloppy mode.  
5. Arrow functions don't have their own `this`: they capture it lexically from the enclosing scope.  

---

### 43) `Promise.all` vs `allSettled` vs `race` vs `any`
- `all`: resolves when **all** fulfil, rejects on the **first** rejection (fail-fast).  
- `allSettled`: waits for all, never rejects, gives `{status, value|reason}` per promise.  
- `race`: first to **settle** (fulfil or reject) wins (timeouts).  
- `any`: first to **fulfil**. Rejects with `AggregateError` only if all reject.  

---

### 44) `==` coercion and `Object.is`
- `null == undefined` is true, `null == 0` is false, `'' == 0` is true, `[] == false` is true. Always use `===`.  
- `NaN === NaN` is false, so use `Number.isNaN` or `Object.is(NaN, NaN)` (true). `Object.is(+0, -0)` is false.  

---

### 45) How do you deep-copy an object today?
- `structuredClone(obj)` (supports Map, Set, Date, cycles; not functions or DOM nodes).  
- `JSON.parse(JSON.stringify(obj))` loses `Date`, `undefined`, Map/Set, and fails on cycles.  
- Spread `{...obj}` / `Object.assign` are **shallow**.  

---

## Traps and gotchas
- `typeof null === 'object'` (historical bug). `typeof NaN === 'number'`.  
- `[1, 10, 2].sort()` gives `[1, 10, 2]`: the default sort is by string. Use `(a, b) => a - b`.  
- `0.1 + 0.2 !== 0.3` (IEEE 754). Use integers (cents) or a decimal library for money.  
- `parseInt('08')` is fine now, but always pass a radix: `parseInt(x, 10)`.  
- `forEach` doesn't await async callbacks. Use `for...of` with `await`, or `Promise.all(arr.map(...))`.  
- Saying "hoisting moves code to the top": say "declarations are registered in the creation phase; let/const are in the TDZ".  

---
