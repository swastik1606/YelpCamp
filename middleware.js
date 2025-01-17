const campground = require("./models/campground");
const review = require('./models/reviews.js');
const ExpressError=require('./utilities/express_error.js')

const isLoggedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash('error', "Please sign in first!")
        return res.redirect('/login')
    }
    next();
}

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const isAuthor=async(req,res,next)=>{
    const{id}=req.params
    const foundCamp=await campground.findById(id)
    if(!foundCamp.author.equals(req.user._id)){
        req.flash('error',"You don't have permission to do that!")
        return res.redirect(`/campgrounds/${foundCamp._id}`)
    }
    next()
}

const isReviewAuthor=async(req,res,next)=>{
    const{id, reviewId}=req.params
    const newReview=await review.findById(reviewId)
    if(!newReview.author.equals(req.user._id)){
        req.flash('error',"You don't have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = BaseJoi.extend(extension)

const validate= (req,res,next)=>{
    const campgroundSchema=joi.object({
        campground:joi.object({title:joi.string().required().escapeHTML(),
            location:joi.string().required().escapeHTML(),
            price:joi.number().required().min(0),
            // image:joi.string().required(),
            description:joi.string().required(),}).required().escapeHTML(),
            deleteImage:joi.array()
    })
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}

const reviewValidate= (req,res,next)=>{
    const reviewSchema=joi.object({
        review:joi.object({body:joi.string().required().escapeHTML(),
            rating:joi.number().required()}).required() 
    })
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}


module.exports={storeReturnTo, isLoggedIn, isAuthor, validate, reviewValidate, isReviewAuthor}