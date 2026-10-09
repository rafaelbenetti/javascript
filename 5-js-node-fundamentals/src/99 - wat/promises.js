// callback without a promise:
for (var i = 0; i < 10; i++) {
    setTimeout(() => {
        // The output will be: 10, 10, 10, 10, 10, 10, 10, 10, 10, 10.
        console.log(i);
    });
}

// ✏️ Why 10 x "10" above: `var` is function-scoped, so all callbacks share ONE `i`,
// and the timers run after the loop has finished (i === 10).

// Callback example with promisse:
// ✏️ This works not because of "promise magic" but because resolve(i) captures the
// CURRENT value of i, and each .then receives its own `number` parameter.
// The simplest fix is `for (let i = 0; ...)`, which creates a new binding per iteration.
for (var i = 0; i < 10; i++) {
    new Promise((resolve) => {
            resolve(i);
    }).then((number) => {
        setTimeout(() => {
            // The output will be: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.
            console.log(number);
        });
    });
}