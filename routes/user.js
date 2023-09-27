 const User=require('../model/user');
 const Address = require("../model/addressModel");
const express=require('express');
const router=express.Router();
 const bcrypt=require('bcryptjs');
 const mongoose=require('mongoose');
 const { check, validationResult } = require('express-validator');
 const nocache = require("nocache");
 const nodemailer= require("nodemailer");
 const EmailVerification=require('../model/userVerificationEmail');
 const Wishlist=require('../model/wishlistModel')
 const Category = require("../model/category");
 const Product = require("../model/product");
 const Cart= require("../model/cartModel");

//  require=('dotenv').config();
 require('dotenv/config')
 



 //password hash
const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  };

  //emailvarification section 

  const secureString = async (uniqueString) => {
    const stringHash = await bcrypt.hash(uniqueString, 10);
    return stringHash;
  };

  const { v4: uuidv4 } = require("uuid");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, success) => {
    if (err) console.log(err);
    else {
      console.log("ready for messages");
      console.log(success);
    }
  });
  
  const sendVerificationEmail = async ({ _id, email }, res) => {
    console.log(_id,email)
    try {
      const url = "http://localhost:4000/";
      const uniqueString = uuidv4();
      //mailoptions
      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: "cakesNbakes : verify email",
        html: `<p>Please verify your email to complete the registration process of cakesNbakes.
               Click <a href="${
                 url + "verify?userId=" + _id + "&uniqueString=" + uniqueString
               }">here</a> to verify.
               <p>This link will <b>expire in 2 hrs</b>.</p>`,
      };
      console.log("mmmmm")
      const hashedString = await secureString(uniqueString);
      const newEmailVerification = await new EmailVerification({
        userId: _id,
        uniqueString: hashedString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 2,
      });
      await newEmailVerification.save();
     
      await transporter.sendMail(mailOptions);
      
     res.redirect('/register');
    } catch (error) {
      console.log("email not sent");
      console.log(error);
    }
  };

  router.get("/verify", async (req, res) => {
    let { userId, uniqueString } = req.query;
    console.log(userId);
    console.log(uniqueString);
    EmailVerification.find({ userId })
  
      .then((result) => {
        if (result.length > 0) {
          //checking that link expires
          const { expiresAt } = result[0];
          const hashedString = result[0].uniqueString;
          if (expiresAt < Date.now()) {
            console.log("expired");
            EmailVerification.findOneAndDelete({ userId })
              .then((result) => {
                User.findByIdAndDelete({ _id: userId })
                  .then(() => {
                    console.log("signup again due to expired link");
                    req.flash(
                      "error",
                      `Your verification link has expired.Signup again`
                    );
  
                    res.redirect('/register');
                  })
                  .catch((error) => {
                    console.log("err in user deletion");
                  });
              })
              .catch((error) => {
                console.log(error);
                console.log("err in email deletion");
              });
          } else {
            bcrypt
            //link not expaires case
              .compare(uniqueString, hashedString)
              .then((result) => {
                if (result) {
                  User.updateOne({ _id: userId }, { $set: { verified: true } })
                    .then(() => {
                      EmailVerification.deleteMany({ userId })
                        .then(() => {
                          req.flash(
                            "success",
                            "Your email has been verified.Go and Login now !"
                          );
  
                          res.redirect('/login');
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                } else {
                  req.flash(
                    "error",
                    `Verification link is not valid.Signup again.`
                  );
  
                  res.redirect('/register');
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        } else {
          req.flash("error", `No registered User found`);
  
          res.redirect('/register');
        }
      })
      .catch((error) => {
        console.log(error);
        console.log("error in find");
      });
  });
  

//get login page
  router.get("/login", (req, res) => {
    req.session.account = null;
    if (req.session.user) {
      res.redirect("/");
    } else {
      const error = req.flash("error");
      const success = req.flash("success");
      res.render("user/login", { error: error, success: success });
    }
  });

  //post login page
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    const userData = await User.findOne({ email });
  
    if (!userData) {
      req.flash("error", "No User found!");
      return res.redirect("/login");
    }
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      req.flash("error", "Your Password is wrong!");
  
      return res.redirect("/login");
    }
    if (userData.verified !== true) {
      req.flash(
        "error",
        "Your email is not verified! Go to your inbox and verify."
      );
  
      return res.redirect("/login");
    }
    if (userData.status) {
      req.flash("error", "Your account is blocked by admin.");
  
      return res.redirect("/login");
    }
    req.session.user = userData;

  res.redirect("/");
});

//get home page
//   router.get('/',(req,res)=>{
//     // if (req.user) res.redirect("/home");
//     // else {
//     //   const error = req.flash("error");
//     //   const success = req.flash("success");
  
//     //   res.render("user/signup", { error: error, success: success });
//     // }
//      res.render('user/homepage')
// }) 
// router.get("/", async (req, res) => {
//   const user = req.session.user;
//   let wishcount = null;

//   if (user) {
//     const wishlistItems = await Wishlist.findOne({ userId: user._id });

//     if (wishlistItems) {
//       wishcount = wishlistItems.wishlist.length;
//     }
//   }
//   res.render("user/homepage", { user,wishcount }
//   );
// });


router.get("/", async (req, res) => {
  try {
    const user = req.session.user;
    const categories = await Category.find({});
    const specials = await Product.find({ special: true });
    let count = null;
    
    if (user) {
      req.session.user.discount = null;
  
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

    res.render("user/homepage", { user, wishcount , categories,count,
      specials});
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});



//get register page
router.get("/register", (req, res) => {
  if (req.session.user){
    console.log(req.session.user)
   res.redirect("/homepage");
 
  
  }else {
    const error = req.flash("error");
    const success = req.flash("success");

    res.render("user/signup", { error: error, success: success });
  }
});


//adding user
// router.post('/register',
// // [
// //     check('name').notEmpty().withMessage('Username is required'),
// //     check('email').isEmail().withMessage('Email is not valid'),
// //     check('contact').matches(/[0-9]{10}/).withMessage('Mobile Number is not valid'),
// //     check('password').notEmpty().isLength({min:6}).withMessage('Password must be atleast 6 characters'),
    
// // ],
//  async (req,res) => {
//     // const errors=validationResult(req);
//     // if(!errors.isEmpty()){
//     //     const alert=errors.array()
//     //     return res.render('user/signup',{alert})
//     // }
//      const { name, email, contact, password, image } = req.body;
    
//     console.log(req.body.email)
//     console.log(req.body)

//     let user = await User.findOne({email});
   
  
//     if (user) {
//       req.flash(
//         "error",
//         `This Email is already registered  in the name '${user.name}'`
//       );
//        return res.redirect('/api/v1/users');
//     // return res.send(user)
//     }
//      const spassword = await securePassword(password);
//      user=new User({
//       name: name,
//       email: email,
//       contact: contact,
//       password: spassword,
//       verified: false,
//       image: image,
//       status: false,
//     });
  
//     user 
//     .save()
//     .then((result) => {
//       let address = new Address({
//         userId: result._id,
//         details: [],
//       });
//       address.save(() => {
//         sendVerificationEmail(result, res);
//          console.log(result,"cccccc");
       
//         req.flash(
//           "success",
//           "Verification email has been sent. please check your email at https://mail.google.com/mail"
//         );
//       });
//       console.log(result,"hhhhhhh")
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });
router.post('/register', async (req, res) => {
  try {
    const { name, email, contact, password, image } = req.body;
     const existingUser = await User.findOne({ email });
     if (existingUser) {
      req.flash('error', `This Email is already registered in the name '${existingUser.name}'`);
      return res.redirect("/signup");
    }
     const hashedPassword = await securePassword(password);

    const newUser = new User({
      name,
      email,
      contact,
      password: hashedPassword,
      verified: false,
      image,
      status: false,
    });

    const savedUser = await newUser.save();

    const newAddress = new Address({
      userId: savedUser._id,
      details: [],
    });

    await newAddress.save();
    console.log(savedUser,"user")
    console.log(newAddress,"newAddress")

    await sendVerificationEmail(savedUser, res);

    req.flash(
      'success',
      'Verification email has been sent. Please check your email at https://mail.google.com/mail'
    );

     return res.status(200).send('Registration successful');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during registration.');
    return res.status(500).redirect('/error'); // Redirect to an error page or handle accordingly
  }
});

router.post("/search", async (req, res) => {
  let payload = req.body.payload.trim();
  let search = await Product.find({
    title: { $regex: new RegExp(payload + ".*", "i") },
  }).exec();
  search = search.slice(0, 10);
  console.log(payload);
  res.json({ payload: search });
});


router.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash("success", "You are logged out successfully!");
  res.redirect("/login");
});

module.exports=router;