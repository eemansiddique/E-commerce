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
const Wallet=require("../model/walletModel");

const crypto = require('crypto'); 
const Razorpay = require("razorpay");
var instance = new Razorpay({
    key_id: 'rzp_test_Evbm1KLpExRy2h',
    key_secret: 'gKzuYiM6jgRpAnC67W689LpF',
});


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
    let address=await Address.findOne({userId:user._id});
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

  cartRouter.post("/place-order/select-address", auth.isUser, async (req, res) => {
    try {
      const addressIndex = req.body.addressIndex;
      const user = req.session.user;
  
      // Find the user's address
      const address = await Address.findOne({ userId: user._id });
  
      // Create an array of changes to mark all addresses as unselected
      const change = address.details.map((item) => {
        item.select = false;
        return item;
      });
  
      // Clear the user's address details
      await Address.findOneAndUpdate({ userId: user._id }, { $pull: { details: {} } });
  
      // Update the user's address with the changes
      await Address.findOneAndUpdate({ userId: user._id }, { $push: { details: change } });
  
      // Select the specified address
      const selectedAddress = address.details[addressIndex];
      selectedAddress.select = true;
      await address.save();
  
      res.json({ status: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });

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


 
  







//wallet and shipping charge corrected code
function confirmWalletUse(req, res, next) {
  // Check if the user has confirmed the wallet deduction
  if (!req.body.confirmWalletUse) {
    return res.status(400).json({ status: "Wallet deduction not confirmed" });
  }
  next(); // Proceed to the next middleware or route
}

cartRouter.post("/payment", auth.isUser, async (req, res) => {
  try {
    let user = req.session.user;
    let paymentMethod = req.body.payment;
    let total = req.session.user.total;
    let carts = await Cart.findOne({ userId: user._id }).populate("cart.product");
    let address = await Address.findOne({ userId: user._id });
    let selectAddress = address.details.filter((item) => {
      return item.select == true;
    });
    let cart = carts.cart;
    console.log(cart + " vctfygu");

    let shipping;
    if (total > 2500) {
      shipping = 0;
    } else {
      shipping = 100;
    }
    let discount = req.session.user.discount ? req.session.user.discount : 0;
    let status = paymentMethod == "COD" ? "placed" : "pending";

    // Calculate the total cost of the order with shipping and discounts
    let orderTotal = total + shipping - discount;

    // Check if the user has a wallet
    let wallet = await Wallet.findOne({ userId: user._id });

    if (wallet) {
      // Calculate the wallet balance available for deduction
      let walletBalance = wallet.balance;
      let walletDeduction = 0;

      if (walletBalance >= orderTotal) {
        // If wallet balance is greater than or equal to the order total,
        // deduct the entire order total from the wallet
        walletDeduction = orderTotal;
      } else {
        // If wallet balance is less than the order total,
        // deduct the wallet balance from the order total
        walletDeduction = walletBalance;
      }

      // Calculate the remaining amount to be paid through COD or online payment
      let remainingAmount = orderTotal - walletDeduction;

      // Prompt the user for confirmation
      if (walletDeduction > 0) {
        // Here, you can implement a confirmation dialog or ask the user for confirmation
        // You can use a middleware to handle this confirmation step
        
        // For simplicity, I'll assume user confirmation using a boolean variable
        const userConfirmed = req.body.confirmWalletUse; // Add a confirmation field in your request body

        if (!userConfirmed) {
          return res.status(400).json({ status: "Wallet deduction not confirmed" });
        }
      }

      // Deduct the wallet deduction amount from the wallet balance
      wallet.balance -= walletDeduction;

      // Create a new order with the payment method and wallet deduction
      let order = new Order({
        userId: user._id,
        address: selectAddress[0],
        orderDetails: cart,
        total: orderTotal, // Use the calculated order total with shipping and discounts
        shipping: shipping,
        discount: discount,
        date: new Date(),
        status: status,
        deliveryDate: new Date(+new Date() + 1 * 24 * 60 * 60 * 1000),
        paymentMethod: paymentMethod,
        walletDeduction: walletDeduction, // Add wallet deduction to the order
      });

      // Save the updated wallet balance
      await wallet.save();

      // Save the order
      await order.save();

      // Clear the user's cart
      await Cart.findByIdAndUpdate({ _id: carts._id }, { $pull: { cart: {} } });

      if (status == "placed") {
        console.log(status + " sttrts ");
        res.json({ codStatus: status });
      } else if (status == "pending") {
        let options = {
          amount: parseInt(remainingAmount) * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + order._id,
        };

        instance.orders.create(options, function (err, order) {
          if (err) console.log(err);
          console.log(order + " new order");
          console.log(order.receipt + " new order");
          res.json(order);
        });
      }
    } else {
      console.log("User wallet not found");
      res.status(404).json({ status: "User wallet not found" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ status: "Internal server error" });
  }
});
  



//razorpay


cartRouter.post("/verify-payment", async (req, res) => {
    try {
        console.log("Payment verification");

        const data = req.body;
        console.log("Received data:", data);

        const secretKey = "gKzuYiM6jgRpAnC67W689LpF"; // Your secret key

        let hmac = crypto.createHmac("sha256", secretKey);

        hmac.update(
            data["payment[razorpay_order_id]"] +
            "|" +
            data["payment[razorpay_payment_id]"]
        );

        const computedSignature = hmac.digest("hex");

        console.log("Computed Signature:", computedSignature);
        console.log("Received Signature:", data["payment[razorpay_signature]"]);
        console.log("Order ID:", data["order[receipt]"]);

        if (computedSignature === data["payment[razorpay_signature]"]) {
            const orderId = data["order[receipt]"];
            console.log("Order ID:", orderId);

            // Find the order by its ID
            const order = await Order.findOne({ _id: orderId });

            if (order) {
                console.log("Found order:", order);

                // Update the order with payment details
                order.paymentId = data["payment[razorpay_payment_id]"];
                order.signature = data["payment[razorpay_signature]"];
                order.orderId = orderId; // Corrected the field name to 'orderId'
                order.status = "placed";

                // Save the updated order
                const savedOrder = await order.save();
                console.log("Order status and payment details updated:", savedOrder);

                res.json({ status: "Payment verified and saved" });
            } else {
                console.log("Order not found for ID:", orderId);
                res.status(404).json({ status: "Order not found" });
            }
        } else {
            console.log("Payment failed - Signature mismatch");
            res.status(403).json({ status: "Payment failed" });
        }
    } catch (error) {
        console.error("Error in payment verification:", error);
        res.status(500).json({ status: "Internal server error" });
    }
});


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