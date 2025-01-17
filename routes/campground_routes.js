const express=require('express')
const catch_async = require('../utilities/async_wrapper.js');
const router=express.Router()
const {isLoggedIn, isAuthor, validate}=require('../middleware.js')
const multer  = require('multer')
const {storage}=require('../cloudinary/index.js')
const upload = multer({ storage: storage })

const controller=require('../controllers/camp_controllers.js')

router.route('/')
    .get(catch_async(controller.index))
    .post(isLoggedIn, upload.array('image'), validate, catch_async(controller.post))

router.get('/new',isLoggedIn, controller.new)

router.route('/:id')
    .get(catch_async(controller.show))
    .put(isLoggedIn, upload.array('image'), validate, isAuthor, catch_async(controller.put))
    .delete(isLoggedIn, isAuthor, catch_async(controller.delete))

router.get('/:id/edit',isLoggedIn, isAuthor, catch_async(controller.edit))

module.exports=router