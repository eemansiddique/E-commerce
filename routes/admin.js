const User=require('../model/user');
 const Address = require("../model/addressModel");
const express=require('express');
const auth = require('../config/auth');
const router=express.Router();
 const bcrypt=require('bcryptjs');
 const mongoose = require('mongoose');
 const { check, validationResult } = require('express-validator');
const Admin = require('../model/admin');

// const securePassword = async (password) => {
//     const passwordHash = await bcrypt.hash(password, 10);
//     return passwordHash;
//   };


//  router.get('/login',(req,res)=>{
//     // if (req.user) res.redirect("/home");
//     // else {
//     //   const error = req.flash("error");
//     //   const success = req.flash("success");
  
//     //   res.render("user/signup", { error: error, success: success });
//     // }
//      res.render('admin/login')
// })


router.get('/', async(req, res) => {
    if (req.session.admin)
 
        res.redirect('/api/v1/admin/dashboard');

    else {

        const error = req.flash('error');
        res.render('admin/login', { error: error });
     }
});

router.post('/', async (req, res) => {

    const { email, password } = req.body;
    // console.log(req.body)
    const adminData = await Admin.find({ email: email, password: password });
    console.log(adminData);
    if (adminData) {
        
        req.session.admin = true;
         res.redirect('/api/v1/admin/dashboard');
    
         const passwordMatch = await bcrypt.compare(password, adminData.password);
        if (!passwordMatch) {
          req.flash("error", "Your Password is wrong!");
      
          return res.redirect('/api/v1/admin/');
            } else {

         req.flash('error', 'Incorrect email or password');
         return res.redirect('/api/v1/admin/');

    }
}

});
// router.post("/",async(req,res)=>{
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const admin = new Admin({
//         email: req.body.email,
//         password: hashedPassword,
//         });
//         const adminUser=await admin.save();

//         if(adminUser){
//             console.log("Successfully created admin");
//         }
// })
let admin
router.get('/dashboard',auth.isAdmin, async (req, res) => {

  admin = req.session.admin;
res.render('admin/dashboard',{admin} );

});

router.get('/users', auth.isAdmin, async (req, res) => {

    let count = await User.count();

    User.find((err, users) => {

        if (err) return console.log(err);

        admin = req.session.admin;

        res.render('admin/users', { users: users, admin, count });

    });

});


module.exports=router;