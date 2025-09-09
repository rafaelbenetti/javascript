# ECMAScript releases
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
    * trimStart() and trimEnd()
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
        return `${this.firstName} ${this.lastName}`;
    }

    static create(firstName, lastName) {
        return new Person(firstName, lastName);
    }
}

var person = Person.create('Rafael', 'Benetti');
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

// You can also access it with for loop.
for(let num of numGenerator) {
    console.log(num);
};
```

# ECMAScript2016

## Exponentiation
- The exponentiation operator (**) raises the first operand to the power of the second operand.

```js
let x = 5 ** 2; 

// Old way
let x = Math.pow(5, 2); 
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
let str = '5';
str = str.padStart(4, 0); // 00005

// padEnd
let str = '5';
str = str.padEnd(4, 0); // 50000
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
async function get(url: string) {
  return new Promise((resolve, reject) => {
  });
}

const user = await get('user');
```
## shared memory
```js
// TODO
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
- They have the same functionality as trimLeft() and trimRight()
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

const arr = ['a', 'b', ['c', ['d']]];
const flattened = arr.flat(Infinity); // => ["a", "b", "c", "d"]
```

- The flatMap() method combines map() and flat() into one method.
```js
const arr = [[7.1], [8.1], [9.1]];
const flattened = arr.flatMap(value => Math.round(value)); // [7, 8, 9] 
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
const aBigInteger = 98765432123456789n;
const aBigInteger = BigInt("98765432123456789");
```
## globalThis
- The globalThis object provides a standard way of accessing the global object across different JavaScript environments. So, now you can write your code in a consistent way, without having to check the current running environment. Remember, however, to minimize the use of global items, since it is considered a bad programming practice.

## Promise.allSettled()
- The new Promise.all() was rejected if any of the promises had reject status.
- The new Promise.allSettled() combinator waits for all promises to be settled, regardless of their result.
```js 
const promises = [fetch("/users"), fetch("/roles")];
const allResults = await Promise.allSettled(promises);
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
let fee = 123_00;       // $123 (12300 cents, apparently)
let fee = 12_300;       // $12,300 (woah, that fee!)
let amount = 12345_00;  // 12,345 (1234500 cents, apparently)
let amount = 123_4500;  // 123.45 (4-fixed financial)
let amount = 1_234_500; // 1,234,500
```
## Promise.any & AggregateError
```js
Promise.any([
  fetch('users')
  fetch('products')
]).then((first) => {
  // Any of the promises was fulfilled.
}).catch((error) => {
  // All of the promises were rejected.
  console.log(error);
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
const serviceName = await fetch('users')
const service = await import(`/services/${serviceName}.js`)
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