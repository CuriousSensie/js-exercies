/*
    PROBLEM 1: FUNCTIONS
        Write a function that can sum any number of arguments. The prototype of the function is given below:
        sum(1,2);
        sum(1,2,3);
        sum(1,2,3,4); … and so on any number of arguments.
        Function will return the sum of all the passed arguments.
*/

// Solution
// use rest operator for 'any number of arguments'
function sum(...args) {
    let sum = 0;

    for (let arg of args) {
        typeof arg === 'number' ? sum += arg : console.log(arg + ' is not a number');
    }
    return sum;
}

// Test
console.log(sum(1, 2));
console.log(sum(1, 2, 3));
console.log(sum(1, 2, 3, 4));
console.log(sum(-1, -2, 3));
console.log(sum(-1, -2, 3, null, undefined, true, 'string', 4));