function b() {
    // If we don't have myVar defined in the Execution Context 
    // it takes the value of Outer Reference.
    console.log(myVar);
};

function a() {
    var myVar = 2;
    b();
};

var myVar = 1;
a();