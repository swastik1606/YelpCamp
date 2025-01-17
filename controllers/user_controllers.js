const express = require('express')
const user = require('../models/user.js')

module.exports.reg=(req, res) => {
    res.render('users/register.ejs')
}

module.exports.regPost=async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const newUser = new user({ username, email });
        const regUser = await user.register(newUser, password);

        await new Promise((resolve, reject)=>{
            req.login(regUser,err=>{
                if(err){
                    reject(err)
                }else{
                    resolve()
                }
            })
        })
        
        req.flash('success', 'Welcome to YelpCamp!')
        res.redirect('/campgrounds')

    } catch (err) {
        req.flash('error', err.message)
        res.redirect('register')
    }
}

module.exports.login=(req, res) => {
    res.render('users/login.ejs')
}

module.exports.loginPost= (req, res) => {
    req.flash('success', 'Welcome Back')    
    const redirectUrl=res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout=(req, res) => {
    if (req.isAuthenticated()) {
        req.logout(function (err) {
            if (err) {
                return next(err)
            }
            req.flash('success', "Goodbye!")
            res.redirect('/campgrounds')
        })
    }
    else{
        req.flash('error',"You can't logout yet!")
        return res.redirect('/campgrounds')
    }
}

