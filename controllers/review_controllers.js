const campground=require('../models/campground.js')
const review = require('../models/reviews.js');

module.exports.post=async(req,res)=>{
    const {id}=req.params
    const foundCamp=await campground.findById(id)
    const newReview= new review(req.body.review)
    newReview.author=req.user._id
    foundCamp.reviews.push(newReview);
    await newReview.save()
    await foundCamp.save()
    req.flash('success','Review successfully posted')
    res.redirect(`/campgrounds/${foundCamp._id}`)
}

module.exports.delete=async(req,res)=>{
    const {id, reviewId} =req.params;
    await campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await review.findByIdAndDelete(reviewId)
    req.flash('success','Review successfully deleted')
    res.redirect(`/campgrounds/${id}`)
}