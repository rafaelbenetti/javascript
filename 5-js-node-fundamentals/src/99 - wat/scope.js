// Simple example of using scope.
var Carro = (function() {

    var engine = function() {
        console.log('turning on the engine.');
    };

    var turnOn = function() {
        engine();
        console.log('turning on the car.');
    };

    return {
        turnOn
    }

})();

Carro.turnOn();