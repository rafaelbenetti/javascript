# ECMAScript releases
- ECMAScript is a standard for a scripting language. It specifies the core features that a scripting language should provide and how those features should be implemented.

* [ECMAScript2015](#ecmascript2015)
    * [Arrow Functions](#arrow-functions)
    * [Block Scope](#block-scope)
    * [Let vs Const](#let-vs-const)
    * [Template String](#template-string)
    * [Classes](#classes)
    * [Generator](#generator)
* [ECMAScript2016](#ecmascript2016)
    * [Exponentiation **](#exponentiation)
    * [Exponentiation assignment (**=)](#exponentiation_assignment)
    * [Array.prototype.includes](#array.prototype.includes)
* [ECMAScript2017](#ecmascript2017)
    * [String padding](#String_padding)
    * [Object.entries](#Object.entries)
    * [Object.values](#Object.values)
    * [async functions](#async_functions)
    * [shared memory](#shared_memory)
* [ECMAScript2018](#ecmascript2018)
    * [Asynchronous Iteration](#asynchronous_iteration)
    * [Promise Finally](#promise_finally)
    * [Object Rest Properties](#object_rest_properties)
    * [New RegExp Features](#new_regexp_feaetures)

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
## Promise Finally
## Object Rest Properties
## New RegExp Features