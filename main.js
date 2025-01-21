// Load environment variables from a .env file if not in production
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Import required modules
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // For supporting PUT and DELETE methods in forms
const ejsMate = require('ejs-mate'); // For EJS layout support
const axios = require('axios');
const session = require('express-session'); // For managing sessions
const flash = require('connect-flash'); // For flash messages
const passport = require('passport'); // For authentication
const LocalStrategy = require('passport-local'); // Passport strategy for local authentication

// Utility functions and custom error classes
const catch_async = require('./utilities/async_wrapper.js'); // Wraps async functions to handle errors
const ExpressError = require('./utilities/express_error.js'); // Custom error class

// Import route modules
const campground_routers = require('./routes/campground_routes.js');
const review_routers = require('./routes/review_routes.js');
const register_routers = require('./routes/user_routes.js');

// Import user model
const user = require('./models/user.js');

// Security-related modules
const mongoSanitize = require('express-mongo-sanitize'); // To prevent MongoDB injection
const MongoDBStore = require('connect-mongo')(session); // MongoDB session store
const helmet = require('helmet'); // For setting security-related HTTP headers
const dbUrl = process.env.db_url; // Database URL from environment variables

// Configure Mongoose to avoid deprecation warnings and connect to MongoDB
mongoose.set('strictQuery', true);
main().catch(err => console.log(err, "OH NO GURU! MONGO CONNECTION ERROR!!"));
async function main() {
    await mongoose.connect(dbUrl);
    console.log("MONGO CONNECTION OPEN!!");
}

// Middleware for method override (e.g., PUT/DELETE via forms)
app.use(methodOverride('_method'));

// Parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure view engine and views directory
app.set('views', path.join(__dirname, '/views'));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Sanitize user inputs to prevent MongoDB injection
app.use(mongoSanitize());

// Configure session storage with MongoDB
const store = new MongoDBStore({
    url: dbUrl,
    secret: "yelpcamp", // Encryption secret for sessions
    touchAfter: 24 * 60 * 60, // Session update interval
    collection: 'sessions', // MongoDB collection for sessions
});

// Log session store errors
store.on('error', function (e) {
    console.log("SESSION ERROR!", e);
});

// Session configuration
const sessionConfig = {
    store, // Use MongoDB session store
    name: "YELPY!", // Custom session cookie name
    secret: "yelpcamp", // Encryption secret for cookies
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Prevent client-side script access
        // secure: true, // Uncomment for HTTPS
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // One-week expiration
        maxAge: 1000 * 60 * 60 * 24 * 7, // Maximum age of the cookie
    },
};
app.use(session(sessionConfig));
app.use(flash()); // Enable flash messages

// Enable Helmet for security, disabling content security policy for now
app.use(helmet({ contentSecurityPolicy: false }));

// Define allowed sources for Content Security Policy (CSP)
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpycjyxpg/", // Cloudinary account
                "https://images.unsplash.com/", // Unsplash images
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Initialize Passport and configure persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

// Middleware to add common variables to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Currently logged-in user
    res.locals.success = req.flash('success'); // Success messages
    res.locals.error = req.flash('error'); // Error messages
    next();
});

// Configure Passport to use the User model for authentication
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser()); // Serialize user into the session
passport.deserializeUser(user.deserializeUser()); // Deserialize user from the session

// Home route
app.get('/', (req, res) => {
    res.render('home.ejs');
});

// Use imported route modules
app.use('/campgrounds', campground_routers); // Campground routes
app.use('/campgrounds/:id/reviews', review_routers); // Review routes
app.use('/', register_routers); // User authentication routes

// Catch-all route for unmatched URLs
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error-handling middleware
app.use((err, req, res, next) => {
    const { message = "Something went wrong!", status = 500 } = err; // Default error details
    res.status(status).render('error.ejs', { message, status });
});

// Start the server
app.listen('3000', () => {
    console.log("LISTENING ON PORT 3000!!");
});
