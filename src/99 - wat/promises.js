// callback without a promise:
for (var i = 0; i < 10; i++) {
    setTimeout(() => {
        // The output will be: 10, 10, 10, 10, 10, 10, 10, 10, 10, 10.
        console.log(i);
    });
}

// Callback example with promisse:
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