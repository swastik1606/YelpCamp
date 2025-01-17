const express = require('express')
const router = express.Router()
const passport = require('passport')
const { storeReturnTo } = require('../middleware.js');
const userController=require('../controllers/user_controllers.js')

const catch_async = require('../utilities/async_wrapper.js')


router.route('/register')
    .get(userController.reg)
    .post(catch_async(userController.regPost))

router.route('/login')
    .get(userController.login)
    .post(storeReturnTo, passport.authenticate('local', 
    { failureFlash: true, failureRedirect: '/login'}),
    userController.loginPost)

router.get('/logout', userController.logout)

module.exports = router