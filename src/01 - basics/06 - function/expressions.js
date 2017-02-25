
greet();

// Creates a function and put it on memory. 
// The entire code.
function greet() {
    console.log('hi');
};

// You can't call it here. Because the hoisting.
// What's the default value for variables? undefined.
// Yeah, you got it!!!!
anonymousGreet();

// When you declare a var and sets a function to it. 
// It's an anonymous function, doesn't have a name.
var anonymousGreet = function()  {
    console.log('hi');
};