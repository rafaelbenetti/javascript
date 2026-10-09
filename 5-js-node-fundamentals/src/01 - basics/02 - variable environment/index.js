// New Execution Context is created for b.
function b() {
    var myVar;
    console.log(myVar);
};

// New Execution Context is created for a.
function a() {
    var myVar = 2;
    console.log(myVar);
    b();
};

// Global Execution Context
var myVar = 1;
console.log(myVar);
a();
