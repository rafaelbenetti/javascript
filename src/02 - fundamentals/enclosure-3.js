var place = function() {
    var city = 'Sapiranga';

    return {
        get: function () {
            return city;
        },
        set: function (name) {
            city = name;
        }
    };
};

var myLocation = place();
myLocation.get();

// You can set enclosure values from outside.
myLocation.set('Parobé');
myLocation.get();
