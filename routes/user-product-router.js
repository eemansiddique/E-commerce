const express = require('express');
const userProductRouter = express.Router();
const Category = require('../model/category');
const Product = require('../model/product');
const Wishlist=require('../model/wishlistModel');
const Cart=require('../model/cartModel');

const auth = require('../config/auth')


userProductRouter.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        const categories = await Category.find({});
        
        // // Assuming you want to include these variables
        let count = null; // Define as needed
        let list = null;  // Define as needed

        const user = req.session.user;
        if (user) {
            req.session.user.discount = null;
            const cartItems = await Cart.findOne({userId:user._id});
    
        if(cartItems){
            count = cartItems.cart.length;
        }
        }
        let wishcount = null;
   
        // let t = await Cart.findOne({ userId: id }).populate("cart.product");
        if (user) {
    
            const wishlistItems = await Wishlist.findOne({ userId: user._id });
    
            if (wishlistItems) {
                wishcount = wishlistItems.wishlist.length;
            }
         list = await Wishlist.findOne({ userId: req.session.user._id }).populate("wishlist.product");
    
        }

        res.render('user/product', { products, categories, user,wishcount,count});
    } catch (error) {
        // Handle any errors that occur during the async operations
        res.status(500).send('An error occurred');
    }
});

userProductRouter.get('/:category', async (req, res) => {
    try {
        let category = req.params.category;
        let categories = await Category.find({});
        let products = await Product.find({ category: category });
        let count = null;
        const user = req.session.user;

        if (user) {
            const cartItems = await Cart.findOne({ userId: user._id });

            if (cartItems) {
                count = cartItems.cart.length;
            }
        }

        let wishcount = null;

        if (user) {
            const wishlistItems = await Wishlist.findOne({ userId: user._id });

            if (wishlistItems) {
                wishcount = wishlistItems.wishlist.length;
            }
        }

        console.log(products.length);
        res.render('user/product', { products, categories, user, count, wishcount });
    } catch (err) {
        if (err) res.render('user/404');
    }
});


userProductRouter.get('/vegan', async (req, res) => {
    try {
        let products = await Product.find({ vegan: true });
        let count = null;
        const user = req.session.user;

        if (user) {
            const cartItems = await Cart.findOne({ userId: user._id });

            if (cartItems) {
                count = cartItems.cart.length;
            }
        }

        let wishcount = null;

        if (user) {
            const wishlistItems = await Wishlist.findOne({ userId: user._id });

            if (wishlistItems) {
                wishcount = wishlistItems.wishlist.length;
            }
        }

        console.log(products.length);
        res.render('user/products', { products, user, count, wishcount });
    } catch (err) {
        if (err) res.render('user/404');
    }
});


// userProductRouter.get('/product-details/:id',async(req,res)=>{
//     let id = req.params.id;
//     try{

//         let product = await Product.findById(id)
//         let images = product.images;
//         const user = req.session.user;
//         console.log(user,"user")
        
//         let count =null
//         // if(user){
            
//         //     const cartItems = await Cart.findOne({userId:user._id});
        
//         //     if(cartItems){
//         //         count = cartItems.cart.length;
//         //     }
//         // }
//         let wishcount = null;
        
       
//         // let t = await Cart.findOne({ userId: id }).populate("cart.product");
//         if (user) {
//              console.log(user,"user")
    
//             const wishlistItems = await Wishlist.findOne({ userId: user._id });
//             console.log(wishlistItems)
    
//             if (wishlistItems) {
//                 wishcount = wishlistItems.wishlist.length;
//             }
//         }
//         console.log("wish",wishcount)
//         res.render('user/single-product',{product,images,user,count,wishcount});
//     }catch(err){
//         if(err)
//         res.render('user/404');
//     }
// })

// userProductRouter.get('/product-details/:id', async (req, res) => {
//     try {
//         let id = req.params.id;
//         let product = await Product.findById(id);
//         let images = product.images;
//         // const imageUrl = '...';
//         // const imageAlt = '...';
//         const user = req.session.user;
//         const imageUrl = '...';
//         const imageAlt = '...';

//         let count = null;

//         if (user) {
//             const cartItems = await Cart.findOne({ userId: user._id });

//             if (cartItems) {
//                 count = cartItems.cart.length;
//             }
//         }

//         let wishcount = null;

//         if (user) {
//             const wishlistItems = await Wishlist.findOne({ userId: user._id });

//             if (wishlistItems) {
//                 wishcount = wishlistItems.wishlist.length;
//             }
//         }

//         console.log("User:", user);
//         console.log("Wishcount:", wishcount);

//         res.render('user/single-product', { product, images, user, count, wishcount,imageUrl,imageAlt });
//     } catch (err) {
//         console.error(err);
//         res.render('user/404');
//     }
// });

userProductRouter.get('/product-details/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        const images = product.images;
        const user = req.session.user;

        let count = null;
        let wishcount = null;

        if (user) {
            // Retrieve cart items count
            const cartItems = await Cart.findOne({ userId: user._id });
            if (cartItems) {
                count = cartItems.cart.length;
            }

            // Retrieve wishlist items count
            const wishlistItems = await Wishlist.findOne({ userId: user._id });
            if (wishlistItems) {
                wishcount = wishlistItems.wishlist.length;
            }
        }

        console.log("User:", user);
        console.log("Wishcount:", wishcount);

        // Define imageUrl and imageAlt (replace '...' with actual values)
        // const imageUrl = '...'; // Replace with the actual URL
        // const imageAlt = '...'; // Replace with the actual alt text
      
        res.render('user/single-product', { product, images, user, count, wishcount, });
    } catch (err) {
        console.error(err);
        res.render('user/404');
    }
});


module.exports = userProductRouter;







// userProductRouter.get('/',async(req,res)=>{
//     let products = await Product.find({});
//     let categories = await Category.find({});
//     // let count =null;
//     // let list =null;

//     const user = req.session.user;
//     if(user){
//         req.session.user.discount= null;
        
//     }
//    res.render('user/product',{products,categories,user,count,list});
// });

// userProductRouter.get('/', (req,res)=>{
//     // const admin = req.session.admin;
//     res.send("user details page added")
// });


