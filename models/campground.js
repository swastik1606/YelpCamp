// Import required modules
const mongoose = require('mongoose'); // Mongoose for MongoDB interaction
const { Schema } = mongoose; // Destructure Schema for creating schemas
const Review = require("./reviews.js"); // Import the Review model
const { required } = require('joi'); // Joi for validation (not used here but imported)

// Options for the schema to include virtuals in JSON output
const opts = { toJSON: { virtuals: true } };

// Define the schema for a Campground
const campSchema = new Schema({
    title: String, // Title of the campground
    image: [ // Array of image objects
        {
            url: String, // URL of the image
            filename: String // Filename of the image
        }
    ],
    geometry: { // Geolocation data for the campground
        type: { 
            type: String, // Type of geometry, must be 'Point'
            enum: ['Point'], // Enforce geometry type to 'Point'
            required: true // Make this field mandatory
        },
        coordinates: {
            type: [Number], // Array of numbers representing [longitude, latitude]
            required: true // Make this field mandatory
        }
    },
    price: Number, // Price of the campground
    location: String, // Location of the campground
    description: String, // Description of the campground
    author: { // Reference to the user who created the campground
        type: Schema.Types.ObjectId, // ObjectId referencing the User model
        ref: 'User'
    },
    reviews: [ // Array of references to reviews associated with the campground
        {
            type: Schema.Types.ObjectId, // ObjectId referencing the Review model
            ref: 'Review'
        }
    ]
}, opts); // Include options to allow virtuals in JSON output

// Virtual property for creating popup markup (used in maps or UI)
campSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href='/campgrounds/${this._id}'>${this.title}</a><p>${this.location}</p><p>$${this.price}</p>`;
});

// Middleware to clean up associated reviews after a campground is deleted
campSchema.post('findOneAndDelete', async function (doc) {
    if (doc) { // If a document (campground) is found and deleted
        await Review.deleteMany({ // Delete all reviews associated with the campground
            _id: {
                $in: doc.reviews // Match reviews whose IDs are in the campground's reviews array
            }
        });
    }
});

// Create the Campground model using the schema
const campground = mongoose.model('Campground', campSchema);

// Export the Campground model for use in other parts of the application
module.exports = campground;
