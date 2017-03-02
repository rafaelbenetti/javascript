// different type of anonymous functions.

// function expression
var sayMyName = function () {
    console.log('Walter white');
};

// in an object 
var Person = {
    sayMyName = function () {
        console.log('My name is ....');
    }
};

// event handler
document.getElementById('send')
    .addEventListener('click', function () {
        alert('Sending data to the server.');
    });
    
// self invoking
(function() {
    console.log('Hello, this is dog.');
})();

// Using recursion with anonymous function.
var factorial = function(number) {
    return !(number > 1) ? 1 : arguments.callee(number - 1) * number;
}
factorial(10);