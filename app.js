const express=require("express");
const mongoose=require("mongoose")
const app=express();
const bodyParser=require('body-parser')
const path = require("path");
const sharp=require('sharp');
const flash = require("connect-flash");
const session = require("express-session");
const cookie = require("cookie-parser");
// const sessions=require("sessions")
require('dotenv/config')
const nocache = require("nocache");
const Wishlist = require('./model/wishlistModel'); // Import your Wishlist model
const Cart=require('./model/cartModel')
const Coupon = require('./model/couponModel');


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
const userProductRouter = require("./routes/user-product-router");
const wishlistRouter = require("./routes/wishlist");
const cartRouter = require("./routes/cart-router");
const profileRouter = require("./routes/profile-router");
const orderRouter = require("./routes/order-router");
const couponRouter = require("./routes/coupon-router");
const orderStatusRouter = require("./routes/order-status-router");










app.set("view engine", "ejs");
app.use('/admin/category',categoriesRoutes)
app.use('/admin/product',productRoutes)
app.use('/admin/coupon',couponRouter)
app.use('/admin/orders',orderStatusRouter)

app.use("/",userRoutes)
app.use("/admin",adminRoutes)
app.use('/products', userProductRouter);
app.use('/wishlist', wishlistRouter);
app.use('/cart',cartRouter)
app.use('/profile',profileRouter)
app.use('/orders',orderRouter)








mongoose.connect('mongodb://localhost:27017')
.then(()=>{
 console.log('Database connection is ready')
})
.catch((err)=>{
   console.log(err)
})

// app.get("*", async (req, res) => {
//   let user = req.session.user;
//   let count = null;
//   // if (user) {
//   //   const cartItems = await Cart.findOne({ userId: user._id });

//   //   if (cartItems) {
//   //     count = cartItems.cart.length;
//   //   }
//   //  }
//   let wishcount = null;

//   if (user) {
//     const wishlistItems = await Wishlist.findOne({ userId: user._id });

//     if (wishlistItems) {
//       wishcount = wishlistItems.wishlist.length;
//     }
//   }
//   res.render("user/404", { user, count, wishcount });
// });
app.get("*", async (req, res) => {
  try {
    let user = req.session.user;
    let count = null;
    let wishcount = null;

    if (user) {
      // Query the Cart collection for the user's cart items
       const cartItems = await Cart.findOne({ userId: user._id });

      if (cartItems) {
        count = cartItems.cart.length;
      }

      // Query the Wishlist collection for the user's wishlist items
      const wishlistItems = await Wishlist.findOne({ userId: user._id });

      if (wishlistItems) {
        wishcount = wishlistItems.wishlist.length;
      }
    }

    res.render("user/404", { user, count, wishcount });
  } catch (error) {
    // Handle any errors that occurred during the asynchronous operations
     console.error(error);
    res.status(500).send("An error occurred");
  }
 
});

app.listen(4000,()=>{
    // console.log(api)
    console.log('server is running')
})

// app.listen(PORT,()=>{
//     console.log(`Listening to the server on http://localhost:${PORT}`)
// })