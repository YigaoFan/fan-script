const tests: (() => void)[] = [];

export const registerTest = function(test: () => void) {
    tests.push(test);
};

export const test = function() {
    for (const t of tests) {
        t();
    }
};
