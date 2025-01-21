// Define a custom error class named ExpressError
class ExpressError extends Error {
    // Constructor to initialize the error with a custom message and status code
    constructor(message, status) {
        super(); // Call the parent class (Error) constructor
        this.message = message; // Set the custom error message
        this.status = status; // Set the HTTP status code for the error
    }
}

// Export the ExpressError class to be used in other parts of the application
module.exports = ExpressError;