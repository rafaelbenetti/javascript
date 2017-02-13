
console.log(hello);

sayHello();
saySomething();
notAFunction();

var hello = 'hello world';

function sayHello() {
    console.log(hello);
};

function saySomething() {
    console.log('Hi, something!');
};

var notAFunction = function() {
    console.log('For the hoisting Im not a function.');
};