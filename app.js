const express=require("express");
const mongoose=require("mongoose")
const app=express();
const bodyParser=require('body-parser')
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const cookie = require("cookie-parser");
// const sessions=require("sessions")
require('dotenv/config')
const nocache = require("nocache");

const api=process.env.API_URL


// const PORT= process.env.PORT || 4000

// // middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/views", express.static(path.join(__dirname,"views")));
app.use("/public", express.static(path.join(__dirname, "public")));

console.log(__dirname)
app.use(flash());
app.use(nocache());
app.use(cookie("cookieSecret"));
app.use(
  session({
    secret: "sessionSecret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000 * 60, secure: false },
  })
);


//Routes
const categoriesRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')




app.set("view engine", "ejs");
app.use(`${api}/category`,categoriesRoutes)
app.use(`${api}/product`,productRoutes)
app.use(`${api}/users`,userRoutes)
app.use(`${api}/admin`,adminRoutes)


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