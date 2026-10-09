// Passing a function to another one.
function log(a) {
  a();   
}

log(function() {
    console.log('hi');
});