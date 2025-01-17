const express=require('express')
const campground=require('../models/campground.js')

const {cloudinary}=require('../cloudinary/index.js')

const mapBoxToken=process.env.mapbox_token
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder= mbxGeocoding({accessToken:mapBoxToken})


module.exports.index=async(req,res)=>{
    const campgrounds= await campground.find({})
    res.render('campgrounds/index.ejs',{campgrounds})
}

module.exports.post=async (req,res)=>{
    const geoData= await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const newData=new campground(req.body.campground)
    newData.geometry=geoData.body.features[0].geometry
    newData.image=req.files.map(f=>({url: f.path, filename:f.filename}))
    newData.author=req.user._id
    await newData.save()
    console.log(newData)
    req.flash('success','Succefully added a campground!')
    res.redirect(`campgrounds/${newData._id}`)
}

module.exports.new= (req,res)=>{
    res.render('campgrounds/new.ejs')
}

module.exports.show=async (req,res)=>{
    const {id}=req.params
    const foundCamp= await campground.findById(id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if(!foundCamp){
        req.flash('error',"Campground doesn't exist")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs',{foundCamp})
}

module.exports.edit=async (req,res)=>{
    const {id}=req.params
    const foundCamp= await campground.findById(id)
    if(!foundCamp){
        req.flash('error',"Campground doesn't exist")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit.ejs',{foundCamp})
}

module.exports.put=async(req,res)=>{
    const {id}=req.params
    const editCamp= await campground.findByIdAndUpdate(id, { ...req.body.campground}, {
        runValidators:true, 
        new:true
    })
    const imgs=req.files.map(f=>({url: f.path, filename:f.filename}))
    editCamp.image.push(...imgs)
    await editCamp.save()
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImage){
            await cloudinary.uploader.destroy(filename)
        }
        await editCamp.updateOne({$pull:{image:{filename:{$in:req.body.deleteImage}}}})
    }
    req.flash('success','Successfully updated the campground')
    res.redirect(`/campgrounds/${editCamp._id}`)
}

module.exports.delete=async (req,res)=>{
    const{id}=req.params
    const deleteCamp= await campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}