'use strict';

// Old way to declare a function.
var sum = function(x, y) {
    return x + y;
};
console.log(sum(1, 2));

/**********************************/

// Using arrow functions.
var divide = (x, y) => x / y;
console.log(divide(10, 2));

/**********************************/

// Using arrow functions with more than one line.
var multiply = (x, y) => { return x * y; };
console.log(multiply(2, 5));

// Old way
/**********************************/

var outer = function() {
    console.log(this);

    var self = this;

    var inner = function() {
        // It will log because we attr the father scope to the var self.
        console.log(self);

        // This inner function doen't have the same scope of the father.
        console.log(this);
    };

    inner();

    // We pass the reference of this for the function.    
    inner.call(this);
};

outer.call({ id: 10});

// With arrow functions.
/**********************************/

var outer = function() {
    console.log(this);
    var inner = () => console.log(this);
    inner();
};

outer.call({ id: 10});

/**********************************/
