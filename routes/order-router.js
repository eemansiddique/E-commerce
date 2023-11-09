const express = require("express");
const orderRouter = express.Router();
// const Category = require('../models/categoryModel');
const Product = require("../model/product");
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");

const auth = require("../config/auth");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Wallet=require("../model/walletModel");



orderRouter.get("/", auth.isUser, async (req, res) => {
  try {
    const user = req.session.user;

    // Clear the discount from the user's session
    req.session.user.discount = null;

    // Fetch the count of items in the cart
    const cartItems = await Cart.findOne({ userId: user._id });
    const count = cartItems ? cartItems.cart.length : 0;

    // Fetch the count of items in the wishlist
    const wishlistItems = await Wishlist.findOne({ userId: user._id });
    const wishcount = wishlistItems ? wishlistItems.wishlist.length : 0;

    // Fetch the user's orders and populate the orderDetails with product data
    const order = await Order.find({ userId: user._id })
      .populate({
        path: "orderDetails",
        populate: {
          path: "product",
          model: "Product", // Replace with your actual Product model name
        },
      })
      .sort({ date: -1 });

    // Render the "user/orders" view with the retrieved data
    res.render("user/orders", { user, count, wishcount, order });
  } catch (error) {
    console.error("Error fetching and rendering orders:", error);
    res.status(500).send("Internal Server Error");
  }
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


// order cancelled and amount push to wallet
orderRouter.get("/order-cancel/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const cancelOrder = await Order.findById(id);

    if (!cancelOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (cancelOrder.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Update order status to "Cancelled"
    cancelOrder.status = 'Cancelled';
    await cancelOrder.save();
    console.log(cancelOrder, "cancelorder");

    // Wallet logic
    const canceledAmount = cancelOrder.total;
    const userId = cancelOrder.userId; // Change to cancelOrder.userId
    console.log('userId:', userId);

    let wallet = await Wallet.findOne({ userId: userId });
    console.log('userId:', userId);

    if (!wallet) {
      wallet = new Wallet({ userId, balance: canceledAmount, transactions: [] });
      wallet.transactions.push({ type: 'deposit', amount: canceledAmount, orderId: id, timestamp: new Date() });
    } else {
      wallet.balance += canceledAmount;
      wallet.transactions.push({ type: 'deposit', amount: canceledAmount, orderId: id, timestamp: new Date() });
    }

    await wallet.save();
    console.log(wallet, "wallet");

    console.log('Order canceled and wallet updated');
    res.json({ status: 'Order canceled successfully' });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'Error canceling order' });
  }
});

module.exports = orderRouter;