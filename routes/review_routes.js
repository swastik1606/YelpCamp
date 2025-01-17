const express=require('express')
const router=express.Router({mergeParams:true}) //MAKE SURE TO DO THIS!!!

const catch_async = require('../utilities/async_wrapper.js')

const reviewController=require('../controllers/review_controllers.js')

const {isLoggedIn, reviewValidate, isReviewAuthor}=require('../middleware.js')


router.post('/', isLoggedIn, reviewValidate, catch_async(reviewController.post))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catch_async(reviewController.delete))

module.exports=router