/*
    PROBLEM 5: PROMISES / ASYNC AWAIT 						
        Write a javascript function that will receive an array of urls. The array length can vary based on user input. The function will send requests to each of these urls and populate a results array. Users can also enter a invalid url so requests to that url may fail so the function should be intelligent to handle this scenario. These will be below variations of this function.			
            ●  Implement this function using callbacks (Serial execution mode)
            ●  Implement this function using promises (Serial execution mode)
            ●  Modify function to handle all the requests in parallel mode and then compare the
            performance with previous serial versions (Parallel execution mode)
            ●  Implement same function using async, await 

*/

// Solution
// Using the same approach as problem 2.
// Storing only the statusText in the results array for better readability.
// Failed resolutions: corresponding result entry is set to 'Could not resolve'.

// HELPERS
const prepareAndValidateUrls = (urls) => {
    if (!urls || urls.length === 0) {
        throw new Error('Array is empty');
    }

    return urls.map(item => {
        let url = item;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        if (!URL.canParse(url)) {
            throw new Error('Invalid URL: ' + item);
        }
        return url;
    });
};

const display = (arr) => {
    console.log("Populated array:", arr);
}

// FUNCTIONS

// Using Callbacks (Serial execution mode)
let populateWithCallbacks = (rawUrls, callback) => {
    const urls = prepareAndValidateUrls(rawUrls);

    let results = [];
    let curr = 0;

    // Populate in serial (using recursion with callbacks)
    const populate = () => {
        if (curr === urls.length) {
            return callback(results); // base case: return populated array
        }

        fetch(urls[curr])
            .then((response) => {
                response.statusText;
                results.push(response.statusText);
                curr++;
                populate();
            }).catch((err) => {
                results.push('Could not resolve');
                curr++;
                populate();
            });
    };
    populate();
}

// Using Promises (Serial execution mode)
let populateWithPromises = (rawUrls) => {
    const urls = prepareAndValidateUrls(rawUrls);

    // Populate in serial
    let results = [];

    return urls.reduce((chain, url) => {
        return chain
            .then(() => fetch(url))
            .then((response) => { results.push(response.statusText) })
            .catch((err) => {
                results.push('Could not resolve');
            });
    }, Promise.resolve())
        .then(() => results);
}

// Using Promises (Parallel execution mode)
let populateWithPromisesInParallel = (rawUrls) => {
    const urls = prepareAndValidateUrls(rawUrls);


    // Populate in parallel (using Promise.allSettled on a promise array)
    const promiseArray = urls.map((url) => {
        return fetch(url)
            .then((response) => response.statusText)
            .catch((err) => {
                return 'Could not resolve';
            });
    });

    return Promise.allSettled(promiseArray);
}

// Using Aysnc/Await
let populateWithAsync = async (rawUrls) => {
    const urls = prepareAndValidateUrls(rawUrls);


    let results = [];

    for (let url of urls) {
        try {
            const response = await fetch(url);
            results.push(response.statusText);
        } catch (error) {
            results.push("Could not resolve.")
        }
    }

    return results;
}

// Test
let urls = ['something', 'facebook.com', 'google.com', 'failllllss']; // results should be: ['Could not resolve', 'OK', 'OK', 'Could not resolve']

// test with performance comparison
let test = async () => {
    console.log('Function using Callbacks (Serial execution mode)');
    await populateWithCallbacks(urls, display);

    let start = Date.now();
    let result = await populateWithPromises(urls);
    console.log("\nFunction using Promises (Serial execution mode)");
    display(result);
    console.log("Time taken with promises (serial): " + (Date.now() - start) + "ms");

    start = Date.now();
    result = await populateWithPromisesInParallel(urls);
    console.log("\nFunction using Promises (Parallel execution mode)");
    display(result); 
    console.log("Time taken with promises (parallel): " + (Date.now() - start) + "ms");

    result = await populateWithAsync(urls);
    console.log("\nFunction using Async/Await");
    display(result);

}

test();