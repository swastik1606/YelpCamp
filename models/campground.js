const mongoose=require('mongoose')
const {Schema}= mongoose
const Review=require("./reviews.js");
const { required } = require('joi');

const opts={toJSON:{virtuals:true}}

const campSchema= new Schema({
    title:String,
    image:[
        {
        url:String,
        filename:String
        }
    ],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price:Number,
    location:String,
    description:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ],
},opts);

campSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href='/campgrounds/${this._id}'>${this.title}</a><p>${this.location}</p><p>$${this.price}</p>`
})

campSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


const campground= mongoose.model('Campground',campSchema)
module.exports=campground