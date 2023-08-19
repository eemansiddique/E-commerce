 const User=require('../model/user');
 const Address = require("../model/addressModel");
const express=require('express');
const router=express.Router();
 const bcrypt=require('bcryptjs');
 const mongoose=require('mongoose');
 const { check, validationResult } = require('express-validator');
 const nocache = require("nocache");
 



 //password hash
const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  };
//get login page
  router.get("/login", (req, res) => {
    req.session.account = null;
    if (req.session.user) {
      res.redirect("/api/v1/users/login");
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
      return res.redirect("/api/v1/users/login");
    }
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      req.flash("error", "Your Password is wrong!");
  
      return res.redirect("/api/v1/users/login");
    }
    req.session.user = userData;

  res.redirect("/api/v1/users");
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
router.get("/", async (req, res) => {
  const user = req.session.user;
  res.render("user/homepage", 
  {
    user,
  }
  );
});





//get register page
router.get("/register", (req, res) => {
  if (req.session.user){
    console.log(req.session.user)
   res.redirect("/user/homepage");
 
  
  }else {
    const error = req.flash("error");
    const success = req.flash("success");

    res.render("user/signup", { error: error, success: success });
  }
});


//adding user
router.post('/register',
// [
//     check('name').notEmpty().withMessage('Username is required'),
//     check('email').isEmail().withMessage('Email is not valid'),
//     check('contact').matches(/[0-9]{10}/).withMessage('Mobile Number is not valid'),
//     check('password').notEmpty().isLength({min:6}).withMessage('Password must be atleast 6 characters'),
    
// ],
 async (req,res) => {
    // const errors=validationResult(req);
    // if(!errors.isEmpty()){
    //     const alert=errors.array()
    //     return res.render('user/signup',{alert})
    // }
     const { name, email, contact, password, image } = req.body;
    
    console.log(req.body.email)
    console.log(req.body)

    let user = await User.findOne({email});
   
  
    if (user) {
      req.flash(
        "error",
        `This Email is already registered  in the name '${user.name}'`
      );
       return res.redirect('/api/v1/users');
    // return res.send(user)
    }
     const spassword = await securePassword(password);
     user=new User({
      name: name,
      email: email,
      contact: contact,
      password: spassword,
      verified: false,
      image: image,
      status: false,
    });
  
    user.save()

      .then((result) => {
        let address = new Address({
          userId: result._id,
          details: [],
        });
       
        address.save()
      })
      .catch((error) => {
        console.log(error);
      //   console.error("An error occurred:", error);
      // res.status(500).json({ error: "An error occurred" });
      });
    });



module.exports=router;