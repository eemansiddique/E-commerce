const express = require("express");
const cartRouter = express.Router();
// const Category = require('../models/categoryModel');
const Product = require("../model/product");
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");
const auth = require('../config/auth');
const Address = require("../model/addressModel");
const User = require('../model/user');
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");


cartRouter.get("/",auth.isUser, async (req, res) => {
    let user = req.session.user;
    let id = user._id;
    let carts = await Cart.findOne({ userId: id }).populate("cart.product");
    let coupons = await Coupon.find({});
    let count = null;
    let sum = null;
     let discount = req.session.user.discount;
    if (carts) {
      let cart = carts.cart;
      sum = cart.reduce((sum, x) => {
        return sum + x.sub_total;
      }, 0);
      req.session.user.total = sum;
      console.log(sum);
    }
    let shipping;
    if (sum > 2500) {
      shipping = 0;
    } else {
      shipping = 100;
    }
  
    if (user) {
      const cartItems = await Cart.findOne({ userId: user._id });
  
      if (cartItems) {
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
    }
    const error = req.flash("error");
    res.render("user/cart", {
      carts,
      user,
      error,
      count,
      sum,
      shipping,
      wishcount,
        discount,
        coupons,
   
    });
  });
  cartRouter.post("/discount-coupon", async (req, res) => {
    try {
      let coupon = req.body.coupon;
      console.log(coupon);
      let total = req.session.user.total;
      const c = await Coupon.findOne({ coupon: coupon }).exec();
  
      if (c) {
        let offer = c.offer;
        let date = new Date();
        let exDate = new Date(c.expiry).getTime();
  
        console.log(date + " now", exDate + "   exp");
        console.log(c.coupon + " name");
  
        if (total >= c.minimum) {
          if (date > exDate) {
            console.log("expired");
            req.flash("error", "coupon expired!");
            res.json({ status: false });
          } else {
            if (coupon.includes("%")) {
              req.session.user.discount = parseFloat(
                (req.session.user.total * offer) / 100
              ).toFixed(0);
            } else {
              req.session.user.discount = offer;
            }
  
            res.json({ status: true });
          }
        } else {
          req.flash("error", `Your total amount is less than ${c.minimum}`);
          res.json({ status: false });
        }
      } else {
        req.flash("error", "Invalid coupon!");
        res.json({ status: false });
      }
    } catch (error) {
      console.error(error);
      // Handle the error as needed, e.g., send an error response.
      res.status(500).json({ error: "An error occurred." });
    }
  });
  
//   cartRouter.post("/discount-coupon", async (req, res) => {
//     let coupon = req.body.coupon;
//     console.log(coupon);
//     let total = req.session.user.total;
//     Coupon.findOne({ coupon: coupon }, (err, c) => {
//       if (err) console.log(err);
//       if (c) {
//         let offer = c.offer;
//         // let expireDays = c.expiry
//         // let couponDate = new Date(c.date)
//         // couponDate.setDate(couponDate.getDate()+expireDays);
//         // console.log(couponDate);
//         let date = new Date();
//         let exDate = new Date(c.expiry);
//         // date = date.toDateString();
//         date = date.getTime();
//         exDate = exDate.getTime();
//         console.log(date + " now", exDate + "   exp");
//         console.log(c.coupon + " name");
//         if (total >= c.minimum) {
//           if (date > exDate) {
//             console.log("expired");
//             req.flash("error", "coupon expired!");
//             res.json({ status: false });
//           } else {
//             if (coupon.includes("%")) {
//               req.session.user.discount = parseFloat(
//                 (req.session.user.total * offer) / 100
//               ).toFixed(0);
//             } else {
//               req.session.user.discount = offer;
//             }
  
//             res.json({ status: true });
//           }
//         } else {
//           req.flash("error", `Your total amount is less than ${c.minimum}`);
//           res.json({ status: false });
//         }
//       } else {
//         req.flash("error", "Invalid coupon!");
//         res.json({ status: false });
//       }
//     });
//   });
  
//   cartRouter.get("/add/:product", async (req, res) => {
//     if (req.session.user) {
//       let productid = req.params.product;
//       console.log(productid);
//       let user = req.session.user;
//       let product = await Product.findById(productid);
//       let price = product.price;
//       let id = user._id;
  
//       let userCart = await Cart.findOne({ userId: id });
  
//       if (!userCart) {
//         let newcart = new Cart({
//           userId: id,
//           cart: [
//             {
//               product: productid,
//               quantity: 1, // Set the initial quantity to 1
//               price: price,
//               sub_total: price,
//             },
//           ],
//         });
//         await newcart.save();
//         console.log("cart created");
//       } else {
//         // Check if the product already exists in the cart
//         let existingProduct = userCart.cart.find(item => item.product === productid);
  
//         if (existingProduct) {
//           // If the product already exists, increment the quantity
//           existingProduct.quantity += 1;
//           existingProduct.sub_total = existingProduct.quantity * existingProduct.price;
//         } else {
//           // If the product does not exist, add it to the cart with a quantity of 1
//           userCart.cart.push({
//             product: productid,
//             quantity: 1,
//             price: price,
//             sub_total: price,
//           });
//         }
  
//         await userCart.save();
//         console.log("Quantity updated");
//       }
  
//       console.log(userCart);
  
//       res.json({ status: true });
//     } else {
//       res.json({ status: false });
//     }
//   });
cartRouter.get("/add/:product", async (req, res) => {
    if (req.session.user) {
      let productid = req.params.product;
      console.log(productid);
      let user = req.session.user;
      let product = await Product.findById(productid);
      let price = product.price;
      let id = user._id;
  
      let userCart = await Cart.findOne({ userId: id });
  
      if (!userCart) {
        let newcart = new Cart({
          userId: id,
          cart: [
            {
              product: productid,
              quantity: 1,
              price: price,
              sub_total: price,
            },
          ],
        });
        await newcart.save();
        console.log("cart created");
      } else {
        // Check if the product already exists in the cart
        let existingProduct = userCart.cart.find(item => item.product === productid);
  
        if (existingProduct) {
          // If the product already exists, increment the quantity
          existingProduct.quantity += 1;
          existingProduct.sub_total = existingProduct.quantity * existingProduct.price;
        } else {
          // If the product does not exist, add it to the cart
          userCart.cart.push({
            product: productid,
            quantity: 1,
            price: price,
            sub_total: price,
          });
        }
  
        await userCart.save();
        console.log("Quantity updated");
      }
  
      console.log(userCart);
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  });

  cartRouter.get("/delete/:product/:weight", auth.isUser, async (req, res) => {
    const user = req.session.user;
    const { product, weight } = req.params;
    await Cart.findOneAndUpdate(
      { userId: user._id, "cart.weight": weight },
      { $pull: { cart: { product: product } } }
    );
    res.json({ status: true });
});


cartRouter.post("/change-quantity", auth.isUser, async (req, res) => {
    let user = req.session.user;
    let id = user._id;
    let { proId, wt, price, count, qty } = req.body;
    console.log(proId + " proid");
    // let cart = await Cart.findOne({userId:user._id});
    console.log(req.body);
    // let carts = await Cart.findOne({ userId: id }).populate("cart.product");
    // if(wt=0.5){
    if (count > 0) {
      Cart.updateOne(
        { userId: id, "cart.product": proId, "cart.weight": wt },
        { $inc: { "cart.$.quantity": count, "cart.$.sub_total": price } }
      ).then((res) => {
        console.log(res + "updated qty nf total" + proId);
      });
    } else {
      Cart.updateOne(
        { userId: id, "cart.product": proId, "cart.weight": wt },
        { $inc: { "cart.$.quantity": count, "cart.$.sub_total": -price } }
      ).then(() => {
        console.log("updated qty nf total");
      });
    }
  
    // }else if(wt==2){
    //     Cart.updateOne({ userId: id,"cart.product": proId},{$inc:{"cart.$.quantity":count,"cart.$.sub_total":  price}})
  
    // }else{
    //  Cart.updateOne({ userId: id,"cart.product": proId},{$inc:{"cart.$.quantity":count,"cart.$.sub_total":  parseInt(price)}})
    //  .then((data)=>{
  
    //      console.log(data + "res");
    //  });
    // }
    res.json({ status: true });
  });
  
  cartRouter.post("/change-weight", auth.isUser, async (req, res) => {
    let id = req.session.user._id;
    let { proId, proprice, cartprice, wt, qty } = req.body;
    console.log(proId, proprice, cartprice, wt, qty);
    proprice = parseInt(proprice);
  
    if (wt == 0.5) {
      await Cart.updateOne(
        { userId: id, "cart.product": proId },
        {
          $set: {
            "cart.$.weight": wt,
            "cart.$.price": parseFloat(
              proprice * wt + (proprice * 10) / 100
            ).toFixed(0),
            "cart.$.sub_total":
              qty * parseFloat(proprice * wt + (proprice * 10) / 100).toFixed(0),
          },
        }
      );
    } else if (wt == 2) {
      await Cart.updateOne(
        { userId: id, "cart.product": proId },
        {
          $set: {
            "cart.$.weight": wt,
            "cart.$.price": parseFloat(
              proprice * wt - (proprice * 10) / 100
            ).toFixed(0),
            "cart.$.sub_total":
              qty * parseFloat(proprice * wt - (proprice * 10) / 100).toFixed(0),
          },
        }
      );
    } else {
      await Cart.updateOne(
        { userId: id, "cart.product": proId },
        {
          $set: {
            "cart.$.weight": wt,
            "cart.$.price": proprice,
            "cart.$.sub_total": qty * proprice,
          },
        }
      );
    }
    console.log("updated weight");
    res.json({ status: true });
  });

  //click proceed to check this render this  place order  page 
  cartRouter.get("/place-order", auth.isUser, async (req, res) => {
    let user = req.session.user;
    let address = await Address.findOne({ userId: user._id });
    console.log(address + " address");
    let total = req.session.user.total;
    let discount = req.session.user.discount;
    let shipping;
    if (total > 2500) {
      shipping = 0;
    } else {
      shipping = 100;
    }
    // total= total+shipping;
    console.log(total);
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
    res.render("user/place-order", {
      user,
      count,
      wishcount,
      address,
      total,
      shipping,
      discount,
    });
  });
//order placed code
//   cartRouter.post(
//     "/place-order/select-address",
//     auth.isUser,
//     async (req, res) => {
//       let addressIndex = req.body.addressIndex;
//       let user = req.session.user;
//       // console.log(addressIndex );
//       let address = await Address.findOne({ userId: user._id });
//       let change = address.details.map((item) => {
//         item.select = false;
//         return item;
//       });
//       await Address.findOneAndUpdate(
//         { userId: user._id },
//         { $pull: { details: {} } }
//       ).then((res) => {
//         console.log(res);
//       });
//       await Address.findOneAndUpdate(
//         { userId: user._id },
//         { $push: { details: change } }
//       ).then((res) => {
//         console.log(res);
//       });
//       // console.log(change);
//       Address.findOne({ userId: user._id }).then((res) => {
//         let item = res.details[addressIndex];
//         item.select = true;
//         res.save();
//       });
  
//       // console.log(selectAddress + "slelehjjhf");
//       // address = address.details;
//       // address = address[addressIndex] ;
//       res.json({ status: true });
//     }
//   );
// cartRouter.post("/place-order/select-address", auth.isUser, async (req, res) => {
//     try {
//         // Check if the user is the session user
//         if (req.user._id !== req.session.userId) {
//             return res.status(403).json({ error: 'Access denied' });
//         }

//         // Validate and sanitize the input data (you can use a validation library like 'express-validator')

//         // Create a new address using the Address model
//         const newAddress = new Address({
//             name: req.body.name,
//             housename: req.body.housename,
//             street: req.body.street,
//             landmark: req.body.landmark,
//             pin: req.body.pin,
//             district: req.body.district,
//             contact: req.body.contact,
//             state: 'Kerala', // Assuming it's always Kerala
//             country: 'India', // Assuming it's always India
//         });

//         // Save the new address
//         await newAddress.save();

//         // Find the user by their ID
//         const user = await User.findById(req.user._id);

//         // Push the new address to the user's details array
//         user.details.push(newAddress);

//         // Save the user with the updated address array
//         await user.save();
//         console.log(user,"user")

//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });
cartRouter.post(
    "/place-order/select-address",
    auth.isUser,
    async (req, res) => {
      try {
        // Get the addressIndex from the request body
        let addressIndex = req.body.addressIndex;
  
        // Get the user from the session
        let user = req.session.user;
  
        // Find the user's address in the database
        let address = await Address.findOne({ userId: user._id });
  
        // Create a new array with all items set to 'select: false'
        let change = address.details.map((item) => {
          return { ...item, select: false };
        });
  
        // Remove all details from the existing address
        await Address.findOneAndUpdate(
          { userId: user._id },
          { $pull: { details: {} } }
        );
  
        // Add the modified details back to the address
        await Address.findOneAndUpdate(
          { userId: user._id },
          { $push: { details: { $each: change } } }
        );
  
        // Update the 'select' property of the selected address
        let updatedAddress = await Address.findOne({ userId: user._id });
        updatedAddress.details[addressIndex].select = true;
        await updatedAddress.save();
  
        // Send a JSON response with a status of true
        res.json({ status: true });
      } catch (error) {
        // If an error occurs, log the error and send a 500 Internal Server Error response
        console.error(error);
        res.status(500).json({ status: false, error: "An error occurred." });
      }
    }
  );

//payment
  cartRouter.post("/payment", auth.isUser, async (req, res) => {
    let user = req.session.user;
    let paymentMethod = req.body.payment;
    let total = req.session.user.total;
    let carts = await Cart.findOne({ userId: user._id }).populate("cart.product");
    let address = await Address.findOne({ userId: user._id });
    let orders = await Order.findOne({userId:user._id});
    let selectAddress = address.details.filter((item) => {
      return item.select == true;
    });
    let cart = carts.cart;
    console.log(cart + "  vctfygu");
  
    let shipping;
    if (total > 2500) {
      shipping = 0;
    } else {
      shipping = 100;
    }
    let discount = req.session.user.discount ? req.session.user.discount : 0;
    let status = paymentMethod == "COD" ? "placed" : "pending";
  
    console.log("orders is not there");
  
    let order = new Order({
      userId: user._id,
      address: selectAddress[0],
      orderDetails: cart,
      total: total,
      shipping: shipping,
      discount: discount,
      date: new Date(),
      status: status,
      deliveryDate: new Date(+new Date() + 1 * 24 * 60 * 60 * 1000),
    });
    order.save();
  
    await Cart.findByIdAndUpdate(
      { _id: carts._id },
      { $pull: { cart: {} } }
    ).then((res) => {
      console.log(res + "deleted cart");
    });
    if (status == "placed")
     {
      console.log(status + "  sttrts ");
      res.json({ codStatus: status });
    } else if (status == "pending") {
      let orders = await Order.findById(order._id);
  
      let options = {
        amount: parseInt(total) * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orders._id,
      };
      instance.orders.create(options, function (err, order) {
        if (err) console.log(err);
        console.log(order + " new order");
        console.log(order.receipt + " new order");
        res.json(order);
      });
    }
    
 }
) 


  
cartRouter.get("/place-order/success", auth.isUser, async (req, res) => {
    try {
        console.log("hdgajhk")
      const user = req.session.user;
      
      
      let count = null;
      if (user) {
       
        const cartItems = await Cart.findOne({ userId: user._id }).exec();
    
        if (cartItems) {
          count = cartItems.cart.length;
        }
      }
      
      let wishcount = null;
      if (user) {
        console.log(user,"user")
        const wishlistItems = await Wishlist.findOne({ userId: user._id }).exec();
    
        if (wishlistItems) {
          wishcount = wishlistItems.wishlist.length;
        }
      }
      
      let total = req.session.user.total;
      let shipping;
      if (total > 2500) {
        shipping = 0;
      } else {
        shipping = 100;
      }
      
      let discount = req.session.user.discount;
    
      res.render("user/order-success", {
        user,
        count,
        wishcount,
        total,
        shipping,
        discount,
      });
    } catch (error) {
      // Handle any errors here
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });



// cartRouter.get('/place-order/success', (req,res)=>{
//      const user = req.session.user;
//     res.send("success page added")
// });


  
  module.exports = cartRouter;