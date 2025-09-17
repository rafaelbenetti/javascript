# 🟨 JavaScript Prep — Overview + Top 40 Interview Q&A

---

## 📖 Quick Overview  

- **What is JavaScript??** → Lightweight, interpreted language, runs in browsers & servers (via Node.js).  
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
- `var`: function-scoped, hoisted, allows redeclaration.  
- `let`: block-scoped, no redeclaration.  
- `const`: block-scoped, must be initialized, cannot be reassigned (but objects mutable).  

---

### 3) Explain hoisting in JavaScript.  
- Declarations (`var`, `function`) are moved to the top of scope before execution.  
```js
console.log(a); // undefined
var a = 10;
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
- **Declaration**: hoisted.  
- **Expression**: assigned to variable, not hoisted.  

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

---

### 16) What is the difference between microtasks and macrotasks?  
- **Microtasks** → promises, queueMicrotask.  
- **Macrotasks** → setTimeout, setInterval.  

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
- **Default export** → only one per file.  
- **Named exports** → multiple, must match name.  

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
- Nullish coalescing `??`.  
- Optional chaining `?.`.  
- Top-level `await`.  
- Private class fields `#field`.  

---
