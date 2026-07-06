/*
    PROBLEM 4: MEMOIZATION
        Memoization is a programming technique which attempts to increase a function’s performance by caching its previously computed results. 
        Write a function named “memoizedFetch” that will fetch data from api url passed as argument but if you call the same function again with the same url then will it return previously received result instead of fetching it again.
*/

// Keep a dictionary cache (map) with key: url, value: result.
// If the same url is passed again, return the result from the map.
// There should be an expiry time for cache, but skipping that for now.
// Storing the statusText instead of complete response.

// Solution
let cache = new Map();

let memoizedFetch = async (url) => {
    if (cache.has(url)) {
        console.log("Cache hit for " + url);

        return cache.get(url);
    } else {
        console.log("Cache miss for " + url);

        let result = await fetch(url);
        let text = await result.statusText;

        cache.set(url, text);
        return text;
    }
};

// Test
let result1 = await memoizedFetch("https://google.com");
let result2 = await memoizedFetch("https://google.com"); 
let result3 = await memoizedFetch("https://youtube.com");


console.log('\nResults:');
console.log(result1);
console.log(result2);
console.log(result3);
