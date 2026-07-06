/*
    PROBLEM 3: CLOSURES
        Write a function to sum the arguments based on below prototype:
        sum(1)(2)(3);

        Make this function generic:
        sum(1)(2)(3).....(n);
*/

// Solution
let sum = (a) => {
    return (b) => {
        if (b) {
            return sum(a + b); // recursive case
        } else {
            return a; // base case: return the sum
        }
    };
};

// Test
console.log(sum(1)(2)(3)());
console.log(sum(1)(2)());
console.log(sum(1)(2)(3)(4)());
