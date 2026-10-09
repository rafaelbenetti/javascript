'use strict';

// Old way to concat strings.
var firstName = 'Rafael';
var lastName = 'Benetti';

var fullName = firstName + ' ' + lastName;

console.log(fullName);

// You need to use backticks for use template string.

fullName = `${firstName.toUpperCase()} ${lastName}`;

console.log(fullName);

/****************************************************/

var firstValue = 100;
var secondValue = 2;

var total = `$ ${firstValue * secondValue}`;
console.log(total);

/****************************************************/

var message = `
    The new version of ES2015 accepts 
    new lines
    `;

console.log(message);

