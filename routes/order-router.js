const express = require("express");
const orderRouter = express.Router();
// const Category = require('../models/categoryModel');
const Product = require("../model/product");
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");

const auth = require("../config/auth");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");

orderRouter.get("/", auth.isUser, async (req, res) => {
  let user = req.session.user;
  req.session.user.discount = null;

  let count = null;
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
  Order.find({ userId: user._id })
    .populate([
      {
        path: "orderDetails",
        populate: {
          path: "product",
          model: "Product",
        },
      },
    ])
    .sort({ date: -1 })
    .then((order) => {
      // console.log(order, " b4");
      // order.sort((item1, item2) => {
      //   let getDate = (date) => new Date(date).getTime();
      //   return getDate(item1.date) < getDate(item2.date);
      // });
      // console.log(order, " aftr");

      res.render("user/orders", { user, count, wishcount, order });
    });
});
//order-single-details
orderRouter.get("/order-details/:id", auth.isUser, async (req, res) => {
    try {
      let user = req.session.user;
      let id = req.params.id;
  
      let count = null;
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
  
      const order = await Order.findById(id)
        .populate([
          {
            path: "orderDetails",
            populate: {
              path: "product",
              model: "Product",
            },
          },
        ]);
  
      if (order) {
        res.render("user/order-single-details", {
          user,
          count,
          wishcount,
          order,
        });
      } else {
        res.render("user/404");
      }
    } catch (error) {
      res.render("user/404");
    }
  });

// orderRouter.get("/order-details/:id", async (req, res) => {
//     try {
//       // Check if user is in session
//       const user = req.session.user;
  
//       if (!user) {
//         // If the user is not in the session, return a 401 Unauthorized response
//         return res.status(401).json({ error: "Unauthorized" });
//       }
  
//       // Fetch the count of items in the Cart collection for the user
//       const cartCount = await Cart.countDocuments({ userId: user._id });
  
//       // Fetch the count of items in the Wishlist collection for the user
//       const wishlistCount = await Wishlist.countDocuments({ userId: user._id });
  
//       // Fetch order details from the database using the orderId from the URL
//       const orderId = req.params.orderId;
//       const order = await Order.findOne({ _id: orderId });
  
//       if (!order) {
//         // If the order is not found, return a 404 Not Found response
//         return res.status(404).json({ error: "Order not found" });
//       }
  
//       // Fetch product data for each item in the orderDetails array
//       for (const item of order.orderDetails) {
//         const product = await Product.findOne({ _id: item.productId });
  
//         if (product) {
//           // Assign the product data to the item within the orderDetails array
//           item.productData = product;
//         }
//       }
  
//       // Render the order details using the "order-details" template and pass the order object
//       res.render("user/order-single-details", { order, cartCount, wishlistCount });
//     } catch (error) {
//       // If an error occurs, log it and return a 500 Internal Server Error response
//       console.error(error);
//       res.status(500).json({ error: "An error occurred" });
//     }
//   });
  
 
  
  
  
  

orderRouter.get("/order-cancel/:id", async (req, res) => {
    let id = req.params.id;
    Order.findById(id).then((item) => {
      item.status = "cancelled";
      item.save();
      console.log(item + "updated");
      res.json({ status: true });
    });
  });
module.exports = orderRouter;