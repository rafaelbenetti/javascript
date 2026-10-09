# ECMAScript releases

> Group 5 · Priority LOW–MEDIUM (know the *year* of the headline features)

## Say it in 1 minute
"ECMAScript is the standard behind JavaScript, and since ES2015 TC39 has shipped a new edition every year, so which year a feature landed is a fair question. ES2015 is still the big break: let and const, arrow functions, classes, modules, promises, and destructuring. After that I remember features by the problem they solved. Async and await landed in 2017 and made promise chains readable. Optional chaining and nullish coalescing arrived in 2020. 2022 brought top-level await and real private fields. 2023 added immutable array methods such as toSorted, so a sort does not mutate the array the caller still holds. Object.groupBy came in 2024. Iterator helpers and new Set methods came in 2025. I do not wait for every browser. TypeScript and Babel let me write the current syntax and down-level it to the targets we actually support."

- ECMAScript is a standard for a scripting language. It specifies the core features that a scripting language should provide and how those features should be implemented.

* [ECMAScript2015](#ecmascript2015)
    * Arrow Functions
    * Block Scope
    * Let vs Const
    * Template String
    * Classes
    * Generator
* [ECMAScript2016](#ecmascript2016)
    * Exponentiation **
    * Exponentiation assignment (**=)
    * Array.prototype.includes
* [ECMAScript2017](#ecmascript2017)
    * String padding
    * Object.entries
    * Object.values
    * async functions
    * shared memory
* [ECMAScript2018](#ecmascript2018)
    * Asynchronous Iteration
    * Promise Finally
    * Object Rest Properties
    * New RegExp Features
* [ECMAScript2019](#ecmascript2019)
    * Object.fromEntries()
    * trimStart() and trimEnd()
    * flat() and flatMap()
    * Optional catch binding
* [ECMAScript2020](#ecmascript2020)
    * BigInt
    * globalThis
    * Promise.allSettled()
    * The nullish coalescing operator
    * Optional chaining
    * Dynamic import
    * Module namespace export
* [ECMAScript2021](#ecmascript2021)
    * Logical Assignment Operators (&&= ||= ??=)
    * Numeric Separators (1_000)
    * Promise.any & AggregateError
    * String.prototype.replaceAll
* [ECMAScript2022](#ecmascript2022)
    * Method at() in arrays
    * Error cause
    * Top-level await
    * Private slots and methods
*  [ECMAScript2023](#ecmascript2023): toSorted/toReversed/toSpliced/with, findLast, hashbang
*  [ECMAScript2024](#ecmascript2024): Object.groupBy, Promise.withResolvers, Array.fromAsync, RegExp `v` flag
*  [ECMAScript2025](#ecmascript2025): Iterator helpers, Set methods, RegExp.escape, Promise.try, JSON modules
*  [Interview Q&A and traps](#interview-qa-and-traps)

# ECMAScript2015

## Arrow Functions
- A short way of declare a function.
- Arrow functions don't have their own *this*, they inherit from the parent scope.

```js
const fruits = ['banana', 'apple'];
fruits.map(fruit => console.log(fruit));
```

## Block Scope
- It means that you can create block scopes.

```js
{
    let money = 30;
}
```

## Let vs Const
- [LET][CONST] Respect block scopes.
- [LET] Can be assigned anytime.
- [CONST] Can be assigned only once, during declaration.

```js
const DATABASE_NAME = 'Database';

let name = 'Uwaga'; 
```


## Template String
- It's an easier way of manipulate strings.

```js
let name = 'Rick';
let surname = 'Grimes';

let fullName = `${name.toUpperCase()} ${surname}`;
```

```js
let message = `
    The new version of ES2015 accepts 
    new lines
    `;
```

## Classes
- They are a new way of declare components using classes.
- In the end of the day everything is a function.

```js
// The class is a function, It's just an easy way to declare.
class Person {

    constructor(firstName, lastName) {
        this._firstName = firstName;
        this._lastName = lastName;
    }
  
    getFullName() {
        return `${this._firstName} ${this._lastName}`; // `this.firstName` would interpolate as "undefined undefined"

    }

    static create(firstName, lastName) {
        return new Person(firstName, lastName);
    }
}

const person = Person.create('Rafael', 'Benetti');
person.getFullName(); // 'Rafael Benetti'
//  Today: prefer real privacy with #firstName (ES2022, see below) over the _underscore convention.
```

## Generator
- They allow you to define an iterative algorithm by writing a single function which can maintain its own state.

```js
function* fibonacci() {
  let current = 0;
  let next = 1;
  while (true) {
    let reset = yield current;
    [current, next] = [next, next + current];
    if (reset) {
        current = 0;
        next = 1;
    }
  }
}

const sequence = fibonacci();
console.log(sequence.next().value);
console.log(sequence.next().value);

// `fibonacci()` is infinite, so break out of the loop.
for (const num of fibonacci()) {
    if (num > 50) break;
    console.log(num);
}
//  ES2025 iterator helpers: fibonacci().take(10).toArray()
```

# ECMAScript2016

## Exponentiation
- The exponentiation operator (**) raises the first operand to the power of the second operand.

```js
let x = 5 ** 2; // 25

// Old way
let y = Math.pow(5, 2); //  renamed (redeclaring `let x` is a SyntaxError)
```

## Exponentiation assignment
- Directly assigns the result after the operation.
```js
let x = 5;
x **= 2;
```

## Array.prototype.includes
- This allows us to check if an element is present in an array:
```js
const fruits = ['banana', 'orange', 'mango'];
fruits.includes('mango');
```

# ECMAScript2017

## String padding
```js
// padStart
'5'.padStart(4, '0'); //  '0005' (target length 4, not 5)

// padEnd
'5'.padEnd(4, '0');   //  '5000'
'abc'.padStart(6);    // '   abc' (default pad is a space)
```

## Object.entries
- The Object.entries() method returns an array of the key/value pairs in an object.
```js
const person = {
  firstName : 'John',
  age : 50,
};

Object.entries(person);

// Object.entries() makes it simple to use objects in loops:
const fruits = {Bananas:300, Oranges:200, Apples:500};
for (let [fruit, value] of Object.entries(fruits)) {
}

// Object.entries() also makes it simple to convert objects to maps:
const myMap = new Map(Object.entries(fruits));
```
## Object.values
- Object.values are similar to Object.entries, but returns a single dimension array of the object values:
```js
const person = {
  firstName : 'John',
  age : 50,
};

Object.values(person);
```
## async functions
- Async functions always return Promises.
- Await can only be used inside a function that is marked as async.
```ts
async function getUser(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // a throw becomes a rejected promise
  return res.json();                                  // a return value becomes a resolved promise
}

// inside another async function (or at module top level since ES2022)
try {
  const user = await getUser('/api/user');
} catch (e) { /* handle */ }
```
## shared memory
-  (was TODO) **SharedArrayBuffer** lets the main thread and Web Workers / worker_threads share the same bytes. **Atomics** gives race-free reads and writes plus `wait`/`notify`.
- In browsers it requires **cross-origin isolation** (`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`), a Spectre mitigation.
```js
const sab = new SharedArrayBuffer(4);
const counter = new Int32Array(sab);
worker.postMessage(sab);          // shared, not copied
Atomics.add(counter, 0, 1);       // atomic increment visible to the worker
```

# ECMAScript2018

## Asynchronous Iteration
```js
async function* asyncGenerator() {
  let i = 0;
  while (i < 3) {
    yield i++;
  }
}

(async () => {
  for await (const num of asyncGenerator()) {
    console.log(num);
  }
})();
```
## Promise Finally
```js
new Promise((resolve, reject) => {})
  .then(() => { })
  .catch(() => { })
  .finally(() => { });
```
## Object Rest/Spread Operators
- Rest syntax is the opposite of spread syntax
- Spread syntax "expands" an array into its elements, while rest syntax collects multiple elements and "condenses" them into a single element.
```js
// With arrays
let arr1 = [0, 1, 2];
let arr2 = [3, 4, 5];

arr1 = [...arr1, ...arr2];

// With objects
let obj1 = { foo: 'bar', x: 42 };
let obj2 = { foo: 'baz', y: 13 };

let clonedObj = { ...obj1 };
```
## New RegExp Features
- Unicode Property Escapes (\p{...})
- Lookbehind Assertions (?<= ) and (?<! )
- Named Capture Groups
- s (dotAll) Flag

# ECMAScript2019

## Object.fromEntries()
```js
const obj = {one: 1, two: 2, three: 3};

// [["one", 1], ["two", 2], ["three", 3]]
const entries = Object.entries(obj); 

// {one: 1, two: 2, three: 3}
const objFromEntries = Object.fromEntries(entries);
```
## trimStart() and trimEnd()
- They have the same functionality as trimLeft() and trimRight() ( those remain as aliases). **ES2019.**
```js
const name = '   Rafael   ';
name.trimStart();
name.trimEnd();
```
## flat() and flatMap()
- If there are any empty slots in the provided array, they will be discarded.
- flat() also accepts an optional argument that specifies the number of levels a nested array should be flattened.
```js
const arr = ['a', 'b', ['c', 'd']];
const flattened = arr.flat(); // => ["a", "b", "c", "d"]

const deep = ['a', 'b', ['c', ['d']]];
const flatDeep = deep.flat(Infinity); // => ["a", "b", "c", "d"]
```

- The flatMap() method combines map() and flat() into one method.
```js
// Map each item to an array. `flatMap` flattens one level.
const sentences = ['hello world', 'good morning'];
sentences.flatMap(s => s.split(' ')); // ['hello', 'world', 'good', 'morning']
// handy for filter+map in one pass: items.flatMap(x => x.ok ? [x.value] : [])
```
## Optional catch binding
```js
try {

} 
catch { // no (ex) needed anymore
  
}
```

# ECMAScript2020

## BigInt
```js
const big1 = 98765432123456789n;
const big2 = BigInt("98765432123456789"); //  renamed (redeclaration)
//  Can't mix with Number: 1n + 1 → TypeError. JSON.stringify(1n) throws.
```
## globalThis
- The globalThis object provides a standard way of accessing the global object across different JavaScript environments. So, now you can write your code in a consistent way, without having to check the current running environment. Remember, however, to minimize the use of global items, since it is considered a bad programming practice.

## Promise.allSettled()
-  `Promise.all()` (ES2015) rejects as soon as **any** promise rejects.
- The new Promise.allSettled() combinator waits for all promises to be settled, regardless of their result.
```js 
const promises = [fetch("/users"), fetch("/roles")];
const allResults = await Promise.allSettled(promises);
//  [{status:'fulfilled', value: Response}, {status:'rejected', reason: Error}]
```
## The nullish coalescing operator
```js
const size = settings.size ?? 42;
```

## Optional chaining
```js
const customerCity = invoice?.customer?.address?.city;

// dynamic props
const userName = user?.["name"];

// functions as well
const fullName = user.getFullName?.();
```

## Dynamic import
```js
const module = await import('./first-module.js');
```

## Module namespace export
```js
export * as utils from './utils.mjs';
```

# ECMAScript2021

## Logical Assignment Operators (&&= ||= ??=)
```js
//"Or Or Equals"
x ||= y;
x || (x = y);

// "And And Equals"
x &&= y;
x && (x = y);

// "QQ Equals"
x ??= y;
x ?? (x = y);
```
## Numeric Separators (1_000)
```js
//  separators are purely visual; one declaration per name
const cents = 123_00;      // 12300
const fee = 12_300;        // 12300
const amount = 1_234_500;  // 1234500
const mask = 0b1010_0001;  // also works in binary/hex
```
## Promise.any & AggregateError
```js
Promise.any([
  fetch('users'),
  fetch('products')
]).then((first) => {
  // Any of the promises was fulfilled.
}).catch((error) => {
  // All of the promises were rejected.
  console.log(error instanceof AggregateError, error.errors); //  array of reasons
});
```
## String.prototype.replaceAll
```js
const name = 'Rafael*de*Oliveira*Benetti';
name.replaceAll('*', ' ');
```

# ECMAScript2022

## Method at() in arrays
- At() method with positive number will work the same as indexing by [] , but with negative will allow accessing values from the end.
```js
const arr = [1,2,3,4]
arr.at(-2) // 3

const str = "1234"
str.at(-2) // '3'
```

## Error cause
```js
throw new Error('I am the result of another error', { cause: error })
```

## Top-level await
```js
// `fetch()` resolves to a Response, not a string. Top-level await only works in ES modules.
const { serviceName } = await (await fetch('/config.json')).json();
const service = await import(`/services/${serviceName}.js`);
```

## Private slots and methods
- Private slot or property:
```js
class Human {
  #name = "John";
  
  setName(name) {
    this.#name = name;
  }
}

const human = new Human()
human.#name = 'Amy'  // ERROR!
human.setName('Amy') // OK
```

- Private method:
```js
class Human {
  name = "John";
  
  constructor(name) {
    this.#setName('Amy') // OK
  }
  
  #setName(name) {
    this.name = name;
  }
}

const human = new Human()
human.#setName('Amy') // ERROR!
```

# ECMAScript2023

## Change array by copy
```js
const nums = [3, 1, 2];
nums.toSorted();          // [1, 2, 3]; nums is unchanged (great for React state)
nums.toReversed();        // [2, 1, 3]
nums.with(0, 99);         // [99, 1, 2]
nums.toSpliced(1, 1);     // [3, 2]
```
## findLast / findLastIndex
```js
[1, 2, 3, 4].findLast(n => n % 2 === 1); // 3
```
- Also: hashbang `#!/usr/bin/env node` grammar, Symbols as WeakMap keys.

# ECMAScript2024

```js
Object.groupBy(listings, l => l.city);           // { Madrid: [...], Lisbon: [...] }
Map.groupBy(listings, l => l.priceBand);

const { promise, resolve, reject } = Promise.withResolvers();

const rows = await Array.fromAsync(asyncIterable);
```
- Also: RegExp `v` flag (set notation), `String.prototype.isWellFormed`, resizable `ArrayBuffer`, `Atomics.waitAsync`.

# ECMAScript2025

```js
// Iterator helpers: lazy, work on any iterator
const firstTen = fibonacci().filter(n => n % 2 === 0).take(10).toArray();

// Set methods
new Set([1, 2, 3]).union(new Set([3, 4]));        // {1,2,3,4}
new Set([1, 2, 3]).intersection(new Set([2, 3])); // {2,3}
new Set([1, 2, 3]).difference(new Set([1]));      // {2,3}

RegExp.escape('a.b*c');                 // safe to embed user input in a RegExp
Promise.try(() => maybeSyncOrAsync());  // sync throws become rejections

import config from './config.json' with { type: 'json' }; // import attributes / JSON modules
```
- Also: `Float16Array`, RegExp modifiers, duplicate named capture groups.
- **Coming next (Stage 3/4, verify before quoting):** `Temporal` (modern date/time, already shipping in some browsers), explicit resource management (`using`), `Error.isError`, `Math.sumPrecise`.

# Interview Q&A and traps

**Q: What was the most important ES version?** ES2015 (ES6): modules, classes, let/const, arrows, promises, destructuring, spread, template literals, Map/Set, symbols, iterators/generators. Everything after is yearly and incremental.

**Q: How does a new feature get into JavaScript?** TC39 proposals go through Stage 0 → 4. Stage 4 means two shipping implementations plus tests, and the feature lands in the next yearly edition. Engines often ship features at Stage 3.

**Q: How do you use new features on old browsers?** Syntax is transpiled (TypeScript, Babel, SWC, esbuild) to the `target`/browserslist. APIs need polyfills (core-js). Syntax can't be polyfilled; APIs can.

**Q: `toSorted` vs `sort`?** `sort` mutates in place (a bug in React state or props); `toSorted` returns a copy.

**Traps**
- `sort()` without a comparator sorts by string: `[10, 9, 1].sort()` gives `[1, 10, 9]`.
- `??` vs `||`: `0 || 42` is 42, but `0 ?? 42` is 0.
- Optional chaining on assignment (`a?.b = 1`) is a SyntaxError.
- Top-level `await` only works in ES modules, and it blocks dependants of that module.
- `#private` isn't the same as TypeScript's `private` (the TS one is compile-time only).
