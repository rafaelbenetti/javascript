
// The variable hello is printed as undefined because the javascript interpreter creates a space on memory.
console.log(hello);

sayHello();
saySomething();

// I don't know what happened here.
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