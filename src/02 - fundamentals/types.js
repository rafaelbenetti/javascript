// Numbers - Integer
var x = 10;
x + 10;

// Numbers - Float
var x = 10.51;
x + 1.49;

// Strings
var name = 'Rafael';
name+10;

// Boleans
var ready = true;

if(ready)
    ready;

// Arrays
var letters = ['a', 'b', 'c'];
var numbers = [...'123456'].map((i) => +i);

// Objects
var Person = {
    name: 'benetti',
    age: 25,
    sayMyName: function() {
        return this.name;
    }
};
var benetti = Object.create(Person);
benetti.sayMyName();
