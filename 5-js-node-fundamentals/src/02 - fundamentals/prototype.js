var Person = {
    sayMyName: function() {
        console.log('Im batman!');
    }
};

var john = Object.create(Person);
var stefany = Person;

// Of course it will work.
john.sayMyName();
stefany.sayMyName();

// Stefany overrite sayMyName function on space of memory on prototype.
stefany.sayMyName = function() {
    console.log('Im stefany again');
};

stefany.sayMyName();
john.sayMyName();

// John overrites sayMyName function only on his instance.
john.sayMyName = function() {
    console.log('Im john');
};

john.sayMyName();
stefany.sayMyName();

/* BONUS */
// Stefany overrite sayMyName function on space of memory on prototype.
// But john already have a specific function.
stefany.sayMyName = function() {
    console.log('Im stefany again');
};

stefany.sayMyName();
john.sayMyName();