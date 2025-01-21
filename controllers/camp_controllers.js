const express = require('express');
const campground = require('../models/campground.js'); // Importing Campground model

// Importing Cloudinary for image upload management
const { cloudinary } = require('../cloudinary/index.js');

// Mapbox setup for geocoding
const mapBoxToken = process.env.mapbox_token; // Accessing Mapbox token from environment variables
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // Mapbox geocoding service
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // Initialize geocoding service

// Display all campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await campground.find({}); // Fetch all campgrounds from the database
    res.render('campgrounds/index.ejs', { campgrounds }); // Render the campgrounds index page
};

// Add a new campground
module.exports.post = async (req, res) => {
    // Use Mapbox to get geographical data for the given location
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, // User-input location
        limit: 1
    }).send();

    const newData = new campground(req.body.campground); // Create a new Campground document
    newData.geometry = geoData.body.features[0].geometry; // Add geographic data to the campground
    newData.image = req.files.map(f => ({ url: f.path, filename: f.filename })); // Add uploaded images
    newData.author = req.user._id; // Set the current user as the author
    await newData.save(); // Save the new campground to the database
    console.log(newData);
    req.flash('success', 'Successfully added a campground!'); // Flash a success message
    res.redirect(`campgrounds/${newData._id}`); // Redirect to the new campground's detail page
};

// Render the form to create a new campground
module.exports.new = (req, res) => {
    res.render('campgrounds/new.ejs'); // Render the 'new campground' form
};

// Show a single campground
module.exports.show = async (req, res) => {
    const { id } = req.params; // Extract campground ID from route parameters
    const foundCamp = await campground.findById(id)
        .populate({
            path: 'reviews', // Populate the reviews
            populate: { path: 'author' } // Populate the authors of the reviews
        })
        .populate('author'); // Populate the author of the campground

    if (!foundCamp) { // Handle case when the campground doesn't exist
        req.flash('error', "Campground doesn't exist");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { foundCamp }); // Render the campground details page
};

// Render the form to edit a campground
module.exports.edit = async (req, res) => {
    const { id } = req.params; // Extract campground ID
    const foundCamp = await campground.findById(id); // Find the campground by ID
    if (!foundCamp) { // Handle case when the campground doesn't exist
        req.flash('error', "Campground doesn't exist");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { foundCamp }); // Render the 'edit campground' form
};

// Update an existing campground
module.exports.put = async (req, res) => {
    const { id } = req.params; // Extract campground ID
    const editCamp = await campground.findByIdAndUpdate(
        id,
        { ...req.body.campground }, // Update with new data from the form
        { runValidators: true, new: true } // Ensure data validation and return updated document
    );

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); // Add new images
    editCamp.image.push(...imgs); // Append new images to the existing ones
    await editCamp.save();

    if (req.body.deleteImage) { // Handle image deletions
        for (let filename of req.body.deleteImage) {
            await cloudinary.uploader.destroy(filename); // Remove images from Cloudinary
        }
        await editCamp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImage } } } }); // Remove images from database
    }

    req.flash('success', 'Successfully updated the campground'); // Flash a success message
    res.redirect(`/campgrounds/${editCamp._id}`); // Redirect to the updated campground's detail page
};

// Delete a campground
module.exports.delete = async (req, res) => {
    const { id } = req.params; // Extract campground ID
    const deleteCamp = await campground.findByIdAndDelete(id); // Delete the campground from the database
    req.flash('success', 'Successfully deleted the campground'); // Flash a success message
    res.redirect('/campgrounds'); // Redirect to the campgrounds index page
};
