const express=require("express");
const mongoose=require("mongoose")
const app=express();
const bodyParser=require('body-parser')
require('dotenv/config')

const api=process.env.API_URL


// const PORT= process.env.PORT || 4000

// // middleware
app.use(bodyParser.json())

//Routes
const categoriesRoutes = require('./routes/category')
const productRoutes = require('./routes/product')




app.use(`${api}/category`,categoriesRoutes)
app.use(`${api}/product`,productRoutes)


mongoose.connect('mongodb://localhost:27017')
.then(()=>{
console.log('Database connection is ready')
})
.catch((err)=>{
   console.log(err)
})


app.listen(4000,()=>{
    console.log(api)
    console.log('server is running')
})
// app.listen(PORT,()=>{
//     console.log(`Listening to the server on http://localhost:${PORT}`)
// })