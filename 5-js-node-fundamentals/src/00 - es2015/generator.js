'use strict';

/**********************************/

function numbers() {
    var nums = [0,1,2,3,4,5,6,7,8,9];

    for (var t = 0; t < noms.length; t++) {
        nums[t] = nums[t] * 2;
    }

    return nums;
}

console.dir(numbers());

// Simple use of yield.
/**********************************/

function* numbers() {
    var nums = [0,1,2,3,4,5,6,7,8,9];

    for (var t = 0; t < noms.length; t++) {
        nums[t] = nums[t] * 2;
        yield nums[t];
    }
}

// You can iterate the items by this way.
var numGenerator = numbers();
console.log(numGenerator.next().value);
console.log(numGenerator.next().value);
console.log(numGenerator.next().value);
console.log(numGenerator.next().value);
console.log(numGenerator.next().value);
console.log(numGenerator.next().value);
console.log(numGenerator.next().value);

// Or by this way.
for(var  num of numGenerator) {
    console.log(num);
};

/**********************************/