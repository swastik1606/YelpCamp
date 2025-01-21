// Import required modules
const express = require('express');
const user = require('../models/user.js'); // Import the User model

// Render the registration form
module.exports.reg = (req, res) => {
    res.render('users/register.ejs'); // Render the registration view
};

// Handle user registration
module.exports.regPost = async (req, res, next) => {
    try {
        const { username, email, password } = req.body; // Destructure form data from the request body
        const newUser = new user({ username, email }); // Create a new user instance (without the password)
        const regUser = await user.register(newUser, password); 
        // Register the user using Passport-Local Mongoose, which hashes the password

        // Log in the user after successful registration
        await new Promise((resolve, reject) => {
            req.login(regUser, err => { 
                // Manually handle login as `req.login` does not return a promise
                if (err) {
                    reject(err); // Reject the promise on error
                } else {
                    resolve(); // Resolve the promise on success
                }
            });
        });

        req.flash('success', 'Welcome to YelpCamp!'); // Flash a success message
        res.redirect('/campgrounds'); // Redirect to the campgrounds page

    } catch (err) {
        req.flash('error', err.message); // Flash an error message
        res.redirect('register'); // Redirect back to the registration form
    }
};

// Render the login form
module.exports.login = (req, res) => {
    res.render('users/login.ejs'); // Render the login view
};

// Handle user login
module.exports.loginPost = (req, res) => {
    req.flash('success', 'Welcome Back'); // Flash a success message
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    // Redirect to the originally requested page or campgrounds by default
    res.redirect(redirectUrl);
};

// Handle user logout
module.exports.logout = (req, res) => {
    if (req.isAuthenticated()) { 
        // Check if the user is authenticated
        req.logout(function (err) { 
            // Logout the user
            if (err) {
                return next(err); // Pass any errors to Express error-handling middleware
            }
            req.flash('success', "Goodbye!"); // Flash a success message
            res.redirect('/campgrounds'); // Redirect to campgrounds after logout
        });
    } else {
        req.flash('error', "You can't logout yet!"); 
        // If the user is not logged in, flash an error message
        return res.redirect('/campgrounds'); // Redirect to campgrounds
    }
};
