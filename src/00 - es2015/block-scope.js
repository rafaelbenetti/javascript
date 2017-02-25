'use strict';

// Curly braces creates a new scope.
{
    var t = 30;
}

// Only functions create news scopes. That's why we can't acess t value.
console.log(t);

/**************************************************/

// let and const are available in the new js.
{
    let r = 30;
}

// Let and const respect new scopes in js. That's why we can acess r value.
console.log(r);