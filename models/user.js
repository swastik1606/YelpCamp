// Import required modules
const { required } = require('joi'); // Joi for validation (not used here but imported)
const mongoose = require('mongoose'); // Mongoose for MongoDB interaction
const Schema = mongoose.Schema; // Destructure Schema for defining schemas
const passportLocalMongoose = require('passport-local-mongoose'); // Plugin for handling user authentication

// Define the schema for a User
const userSchema = new Schema({
    email: { 
        type: String, // Email address of the user
        required: true, // Make email mandatory
        unique: true // Ensure each email is unique in the database
    }
});

// Add Passport-Local Mongoose plugin to the schema
userSchema.plugin(passportLocalMongoose); 
// This plugin automatically adds fields for username, password hashing, and salting.
// It also provides utility methods for authentication, such as `authenticate`, `register`, and `serializeUser`.

// Export the User model
module.exports = mongoose.model('User', userSchema);
