/*
    PROBLEM 2: ARRAYS
        Introduce a populate method in array class in a way such that you can call it:
        Example:
        $ const array = [‘google.com’, ‘facebook.com’’];
        $ array.populate(); 
        Calling the above method will populate the array by replacing the urls with actual results retrieved by calling the url using http call.
        The method should be callable on any array instance but it should throw an exception if the array does not contain valid urls.
*/


// assuming that a valid url is one with a valid scheme (not necessarily one that resolves). 
// If it's not resolvable, fetch will throw an Error. In this case, we'll repace the result with 'Could not resolve', rather than throwing an error.

// Solution
// We can extend native classes (since, js is a prototype-based language, so classes are basically functions)
// using async/await for fetch calls
Array.prototype.populate = async function () {
    // Check validity
    if (this.length === 0) {
        throw new Error('Array is empty');
    }

    for (let i = 0; i < this.length; i++) {
        !this[i].startsWith('http') && !this[i].startsWith('https') ? this[i] = 'https://' + this[i] : null; // support both formats (google.com and https://google.com)
        if (!URL.canParse(this[i])) {
            throw new Error('Invalid URL: ' + this[i]);
        }
    }

    // Populate in parallel
    const promises = this.map(async (url, i) => {
        try {
            const response = await fetch(url);
            this[i] = response.statusText;
        } catch (err) {
            this[i] = 'Could not resolve';
        }
    });

    await Promise.allSettled(promises);
}

// Test
const array = ['anaconda', 'facebook.com', 'google.com', 'failllllss'];
array.populate()
    .then(() => console.log(array))
    .catch(err => console.log(err));