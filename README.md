# Review of the basics of Javascript

* [Javascript definition](#javascript-definition)
    * [Interpreted](#interpreted)
    * [Non Typed](#non-typed)
    * [Single Thread](#single-thread)
    * [Syncronous](#syncronous)
    * [Asyncronous](#asyncronous)
* [Types](#types)
    * [Number](#number)   
    * [String](#string)   
    * [Function](#function)   
    * [Object](#Object)   
* [Equality operators](#equality-operators)
* [Hoisting](#hoisting)
* [Asynchronous](#asynchounous)
    * [Callback](#callback)
    * [Promises](#promises)
    * [Observable](#observable)
* [Callback Queue](#callback-queue)

## Javascript definition
- Javascript is an interpreted, non typed, single thread and syncronous language |o|.

## Interpreted
- JavaScript is interpreted at runtime by the client browser.

## Non typed
- Javascript is a non typed language.
- It means that you don't have types in Javascript, you can change during runtime.

```js
var name = 'Walter White';

name = true; // You can change the type.
name = 20;   // You can change the type.
```

## Single thread
- Javascript is Single Thread.
- It means that Javascript can execute only one thing at a time.

![Single Thread](src/assets/single-thread.png)

## Synchronous
- Javascript is Synchronous***.
- It means that Javascript can execute only one thing at a time too.

![Synchronous](src/assets/synchronous.png)

## Asynchronous
- Javascript is NOT Asynchronous by default.
- It means that Javascript can execute only one thing at a time.
- You can simulate asynchronous using the broswer's API (setTimeOut, Ajax).

![Asynchronous](src/assets/asynchronous.png)

## Callback queue

![Callback queue](src/assets/callback-queue.png)