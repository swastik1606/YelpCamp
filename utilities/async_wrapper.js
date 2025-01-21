// Export a function named wrapAsync
module.exports = function wrapAsync(fn) {
    // Return a new function that wraps the provided asynchronous function
    return function (req, res, next) {
        // Call the original asynchronous function (fn)
        // Use .catch() to handle any errors that occur in the async function
        fn(req, res, next).catch(e => next(e)); 
        // Pass the error to Express's error-handling middleware via next()
    };
};
