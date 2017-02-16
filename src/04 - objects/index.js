// The best way to create objects.
var person = {
    firstName: 'Tony',
    lastName: 'Antôny',
    address: {
        street: '111 Main St.',
        city: 'New York',
        state: 'NY'
    }
};

console.log(person);

// Not so good.
person = new Object();
person.firstName = 'Tony';
person.lastName = 'Antôny';

console.log(person);