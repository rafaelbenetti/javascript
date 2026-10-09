function a() {

    // The outer reference from b it's a because b is inside a.
    function b() {
        // It will log 2 because there is a definition in the outer reference.
        console.log(myVar);
    };

    var myVar = 2;
    b();
};

var myVar = 1;
a();