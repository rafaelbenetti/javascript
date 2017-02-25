'use strict';

// Old way..
function Person(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
};

Person.prototype.getFullName = function () {
    return this.firstName + ' ' + this.lastName;
};

var person = new Person('Rafael', 'Benetti');
console.log(person.getFullName());
console.dir(person);

/**********************************/

// The class is a function, It's just a easy way to declare.
class Person {

    constructor(firstName, lastName) {
        this._firstName = firstName;
        this._lastName = lastName;
    }

    get firstName() {
        return this._firstName;
    }

    set firstName(fn) {
        this._firstName = fn;
    }

    get lastName() {
        return this._lastName;
    }

    set lastName(fn) {
        this._lastName = fn;
    }

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }

    static create(firstName, lastName) {
        return new Person(firstName, lastName);
    }
}

var person = Person.create('Rafael', 'Benetti');

// inheritance
/**********************************/

class Student extends Person {
    constructor(studentId, firstName, lastName) {
        super(firstName, lastName);
        this._studentId = studentId;
    }

    get studentId() {
        return this._studentId;
    }

    set studentId(studentId) {
        this._studentId = studentId;
    }

    getRecordTitle() {
        return this.studentId + ' ' + this.lastName + ', ' + this.firstName;
    }
}

var studend = new Student(12, 'Rafael', 'Benetti');
console.log(studend.getRecordTitle());
console.log(studend.getFullName());