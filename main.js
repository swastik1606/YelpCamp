if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express=require('express')
const app=express()
const path = require('path')

const mongoose = require('mongoose');
const methodOverride= require('method-override')
const ejsMate= require('ejs-mate')
const axios=require('axios');
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStrategy=require('passport-local')

const catch_async = require('./utilities/async_wrapper.js');
const ExpressError=require('./utilities/express_error.js')

const campground_routers=require('./routes/campground_routes.js')
const review_routers=require('./routes/review_routes.js')
const register_routers=require('./routes/user_routes.js')

const user=require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore=require('connect-mongo')(session)

const helmet=require('helmet');
const { func } = require('joi');
const dbUrl=process.env.db_url

mongoose.set('strictQuery', true);
main().catch(err => console.log(err, "OH NO GURU! MONGO CONNECTION ERROR!!"));
async function main() {
    await mongoose.connect(dbUrl);
    console.log("MONGO CONNECTION OPEN!!")
}

app.use(methodOverride('_method'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.set('views', path.join(__dirname, '/views'))
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')

app.use(express.static('public'));
app.use(mongoSanitize());

const store=new MongoDBStore({
    url:dbUrl,
    secret:"yelpcamp",
    touchAfter:24*60*60,
    collection:'sessions'
})

store.on('error',function(e){
    console.log("SESSION ERROR!",e)
})

const sessionConfig={
    store,
    name:"YELPY!",
    secret:"yelpcamp",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(helmet({contentSecurityPolicy:false}))

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
                "https://res.cloudinary.com/dpycjyxpg/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})

passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())


app.get('/',(req,res)=>{
    res.render('home.ejs')
})

app.use('/campgrounds',campground_routers)
app.use('/campgrounds/:id/reviews',review_routers)
app.use('/',register_routers)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {message="Something went wrong!",status=500}=err
    res.status(status).render('error.ejs',{message,status})
})

app.listen('3000',()=>{
    console.log("LISTENING ON PORT 3000!!")
})
