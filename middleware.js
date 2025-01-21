// Import required modules and files
const campground = require("./models/campground"); // Campground model
const review = require('./models/reviews.js'); // Review model
const ExpressError = require('./utilities/express_error.js'); // Custom error handling class
const BaseJoi = require('joi'); // Joi for data validation
const sanitizeHtml = require('sanitize-html'); // For sanitizing HTML inputs

// Extend Joi to add custom validation for sanitizing HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(), // Base type is Joi string
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!', // Custom error message
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { 
                    allowedTags: [], // No tags allowed
                    allowedAttributes: {}, // No attributes allowed
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value }); // Error if HTML is found
                return clean; // Return sanitized value
            },
        },
    },
});

// Extend BaseJoi with the custom HTML sanitization rule
const joi = BaseJoi.extend(extension);

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // Check Passport's isAuthenticated method
        req.session.returnTo = req.originalUrl; // Save the URL the user was trying to access
        req.flash('error', "Please sign in first!"); // Flash error message
        return res.redirect('/login'); // Redirect to login page
    }
    next(); // Proceed if authenticated
};

// Middleware to store the returnTo URL in locals
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo; // Pass returnTo URL to views
    }
    next();
};

// Middleware to check if the logged-in user is the author of a campground
const isAuthor = async (req, res, next) => {
    const { id } = req.params; // Extract campground ID from URL params
    const foundCamp = await campground.findById(id); // Find the campground by ID
    if (!foundCamp.author.equals(req.user._id)) { // Check if the user is the author
        req.flash('error', "You don't have permission to do that!"); // Flash error message
        return res.redirect(`/campgrounds/${foundCamp._id}`); // Redirect to the campground page
    }
    next(); // Proceed if the user is the author
};

// Middleware to check if the logged-in user is the author of a review
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; // Extract campground and review IDs from URL params
    const newReview = await review.findById(reviewId); // Find the review by ID
    if (!newReview.author.equals(req.user._id)) { // Check if the user is the author
        req.flash('error', "You don't have permission to do that!"); // Flash error message
        return res.redirect(`/campgrounds/${id}`); // Redirect to the campground page
    }
    next(); // Proceed if the user is the author
};

// Middleware to validate campground data
const validate = (req, res, next) => {
    const campgroundSchema = joi.object({
        campground: joi.object({
            title: joi.string().required().escapeHTML(), // Title: required, no HTML
            location: joi.string().required().escapeHTML(), // Location: required, no HTML
            price: joi.number().required().min(0), // Price: required, must be >= 0
            description: joi.string().required().escapeHTML(), // Description: required, no HTML
        }).required(),
        deleteImage: joi.array(), // Optional: Array of images to delete
    });
    const { error } = campgroundSchema.validate(req.body); // Validate request body against schema
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // Combine error messages
        throw new ExpressError(msg, 400); // Throw an ExpressError with validation message
    } else {
        next(); // Proceed if validation passes
    }
};

// Middleware to validate review data
const reviewValidate = (req, res, next) => {
    const reviewSchema = joi.object({
        review: joi.object({
            body: joi.string().required().escapeHTML(), // Review body: required, no HTML
            rating: joi.number().required(), // Rating: required
        }).required(),
    });
    const { error } = reviewSchema.validate(req.body); // Validate request body against schema
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // Combine error messages
        throw new ExpressError(msg, 400); // Throw an ExpressError with validation message
    } else {
        next(); // Proceed if validation passes
    }
};

// Export all middleware functions for use in other files
module.exports = { storeReturnTo, isLoggedIn, isAuthor, validate, reviewValidate, isReviewAuthor };
