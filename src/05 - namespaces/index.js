var english = {};
var spanish = {};

english.greet = 'Hello!';
spanish.greet = 'Hola!';

console.log(english);

var Person = (function() {

    var sayMyName = function() {
        console.log('hello, Im fulano!');
    };

    return {
        sayMyName
    };
})();

console.log(Person);