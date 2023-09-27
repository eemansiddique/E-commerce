const express = require("express");
const orderStatusRouter = express.Router();
const Product = require("../model/product");
const auth = require("../config/auth");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");

// orderStatusRouter.get("/", auth.isAdmin, async (req, res) => {
//   let admin = req.session.admin;
//   let count = await Order.count();
//   let orders = await Order.find({}).populate([
//     { path: "userId", model: "User" },
//     {
//       path: "orderDetails",
//       populate: {
//         path: "product",
//         model: "Product",
//       },
//     },
//   ]);
//   // .sort({ date: -1 });

//   let success = req.flash("success");
//   let error = req.flash("error");
//   let status = ["placed", "shipped", "cancelled", "delivered"];
//   res.render("admin/orders", { admin, count, orders, success, error, status });
// });
orderStatusRouter.get("/", auth.isAdmin, async (req, res) => {
    try {
      let admin = req.session.admin;
      let count = await Order.countDocuments();
      let orders = await Order.find({}).populate([
        { path: "userId", model: "User" },
        {
          path: "orderDetails",
          populate: {
            path: "product",
            model: "Product",
          },
        },
      ]);
      console.log(orders)
      // .sort({ date: -1 });
  
      let success = req.flash("success");
      let error = req.flash("error");
      let status = ["placed", "shipped", "cancelled", "delivered"];
      res.render("admin/orders", { admin, count, orders, success, error, status });
    } catch (error) {
      console.error(error);
      // Handle the error as needed, e.g., send an error response or render an error page.
      res.status(500).send("An error occurred.");
    }
  });
// orderStatusRouter.post("/change-status/:id", auth.isAdmin, async (req, res) => {
//   let { status } = req.body;
//   let id = req.params.id;
//   console.log(status, id);
//   await Order.findById(id).then((order) => {
//     order.status = status;
//     order.save();
//     res.json({ status: true });
//   });
// });
// orderStatusRouter.post("/change-status/:id", auth.isAdmin, async (req, res) => {
//     try {
//       const { status } = req.body;
//       const id = req.params.id;
//       console.log(status, id);
  
//       const order = await Order.findById(id);
  
//       if (!order) {
//         return res.status(404).json({ error: "Order not found" });
//       }
  
//       order.status = status;
//       await order.save();
  
//       res.json({ status: true });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "An error occurred" });
//     }
//   });
  
  
orderStatusRouter.post("/change-status/:id", auth.isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const id = req.params.id;
  
      const order = await Order.findById(id);
  
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      order.status = status;
      await order.save();
  
      res.json({ status: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });
  
  
  
  
  
  
  
  
  
  

module.exports = orderStatusRouter;