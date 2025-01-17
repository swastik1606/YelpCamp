const mongoose = require('mongoose');
const campground = require('../models/campground.js')
const cities = require('./cities')
const {places,descriptors}=require('./seed_helpers.js')
const axios=require('axios')

mongoose.set('strictQuery', true);
main().catch(err => console.log(err, "OH NO GURU! MONGO CONNECTION ERROR!!"));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');
    console.log("MONGO CONNECTION OPEN!!")
}

const pickRandArr= array => array[Math.floor(Math.random()*array.length)]

// const fetchCampgroundImage = async () => {
//     try {
//         const response = await axios.get('https://api.unsplash.com/photos/random', {
//             params: {
//                 query: 'campground',
//                 client_id: 'vxyVy4YF3u05y5BvyD7aHGUOIfy8a_9Yy4_cB_xcx7M',  // Use your Unsplash API key
//                 count: 50,
//             }
//         });
//         return response.data[0].urls.regular;  // Return the image URL
//     } catch (error) {
//         console.error('Error fetching image:', error);
//         return 'default-image-url';  // Fallback image URL in case of error
//     }
// };

const seedDB = async () => {
    await campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand = Math.floor(Math.random() * 1000)
        const randPrice= Math.floor(Math.random() * 25)+10
        const newCamps = new campground({
            title:`${pickRandArr(descriptors)} ${pickRandArr(places)}`,
            location: `${cities[rand].city}, ${cities[rand].state}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae pariatur similique doloribus? Fugit quos incidunt cum labore ipsum obcaecati quidem corporis sed excepturi eius dolore voluptate nemo magnam, architecto asperiores.",
            author:'67840abe13323dde7ae8e2f1',
            price:randPrice,
            geometry: { type: 'Point', coordinates:[
                cities[rand].longitude,
                cities[rand].latitude 
            ]},
            image:[
                {
                  url: 'https://res.cloudinary.com/dpycjyxpg/image/upload/v1736852218/YelpCamp/vwaqsdm7lrdd3ccumwbf.jpg',
                  filename: 'YelpCamp/vwaqsdm7lrdd3ccumwbf',
                },
                {
                  url: 'https://res.cloudinary.com/dpycjyxpg/image/upload/v1736852221/YelpCamp/ll1xjykwgb8lah3qwglk.jpg',
                  filename: 'YelpCamp/ll1xjykwgb8lah3qwglk',
                }
              ]
        })
        await newCamps.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
    console.log("CLOSED FOR NOW!")
})

