// Import required models
const campground = require('../models/campground.js'); // Campground model
const review = require('../models/reviews.js'); // Review model

// Add a new review to a campground
module.exports.post = async (req, res) => {
    const { id } = req.params; // Extract campground ID from route parameters
    const foundCamp = await campground.findById(id); // Find the campground by ID
    const newReview = new review(req.body.review); // Create a new review from request body data
    newReview.author = req.user._id; // Set the current user's ID as the author of the review
    foundCamp.reviews.push(newReview); // Add the review to the campground's `reviews` array
    await newReview.save(); // Save the new review to the database
    await foundCamp.save(); // Save the updated campground to the database
    req.flash('success', 'Review successfully posted'); // Flash a success message
    res.redirect(`/campgrounds/${foundCamp._id}`); // Redirect to the campground's details page
};

// Delete a review from a campground
module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params; // Extract campground ID and review ID from route parameters
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); 
    // Use `$pull` to remove the review ID from the campground's `reviews` array
    await review.findByIdAndDelete(reviewId); // Delete the review from the database
    req.flash('success', 'Review successfully deleted'); // Flash a success message
    res.redirect(`/campgrounds/${id}`); // Redirect to the campground's details page
};
