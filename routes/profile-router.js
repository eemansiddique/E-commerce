const express = require('express');
const profileRouter = express.Router();
const Address = require('../model/addressModel');
const User = require('../model/user');
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel');
const auth = require('../config/auth');
const bcrypt=require('bcryptjs');

const securePassword = async (password) => {
  const passwordHash = await bcrypt.hash(password, 10)
  return passwordHash;
}
// const auth = require('../config/auth');
const multer = require('multer');
const fs = require('fs');
// const bcrypt = require('bcrypt');
// const securePassword = async (password) => {
//     const passwordHash = await bcrypt.hash(password, 10)
//     return passwordHash;
// }
const storage = multer.diskStorage({
    destination : function(req,file,cb) {
        cb(null,'public/images/user-img');
    },
    filename : function (req,file,cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null,name);
    }
})

const upload = multer({storage : storage})




profileRouter.get('/',auth.isUser,async(req,res)=>{

    let user = req.session.user
    let id = user._id;
    req.session.user.discount= null;

    const userData = await User.findOne({_id:id})
    let address = await Address.findOne({userId:id});
    // address = address.details ;
    const error = req.flash('error');
    const success = req.flash('success');
    let count = null;
    // let t = await Cart.findOne({ userId: id }).populate("cart.product");
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
    res.render('user/user-profile',{user:userData,address,success,error,count,wishcount});

});

profileRouter.post('/edit-profile', auth.isUser, upload.single('image'), async (req, res) => {
    try {
      const user = req.session.user;
      const id = user._id;
      const { name, email, contact, pimage } = req.body;
      const image = typeof req.file !== "undefined" ? req.file.filename : "";
  
      const foundUser = await User.findById(id);
  
      if (!foundUser) {
        return res.status(404).send('User not found');
      }
  
      if (image === "") {
        foundUser.name = name;
        foundUser.image = pimage;
        foundUser.contact = contact;
      } else {
        foundUser.name = name;
        foundUser.image = image;
        foundUser.contact = contact;
  
        if (pimage !== "") {
          console.log('image is already there');
  
          if (foundUser.image !== "") {
            console.log('image updated');
  
            fs.unlink('public/images/user-img/' + pimage, (err) => {
              if (err) console.log(err);
              console.log('old img deleted');
            });
          }
        }
      }
  
      await foundUser.save();
      res.redirect('/profile');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  
  
  
  

profileRouter.post('/edit-address/:index', async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) {
        // Handle the case where the user is not authenticated or not available in the session
        return res.status(401).send('User not authenticated');
      }
  
      const index = req.params.index;
      const {
        name,
        housename,
        landmark,
        street,
        pin,
        contact,
        district
      } = req.body;
  
      const address = await Address.findOne({ userId: user._id });
  
      if (!address) {
        // Handle the case where the address is not found
        return res.status(404).send('Address not found');
      }
  
      address.details[index].name = name;
      address.details[index].housename = housename;
      address.details[index].landmark = landmark;
      address.details[index].street = street;
      address.details[index].pin = pin;
      address.details[index].contact = contact;
      address.details[index].district = district;
  
      await address.save();
  
      res.redirect('back');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

profileRouter.post('/add-address',auth.isUser,async(req,res)=>{
    let user = req.session.user;
    let id = user._id;
    console.log(id);
    let {name,housename,landmark,street,pin,contact,district,state,country} = req.body;
    console.log(req.body);
    let addressbook = await Address.findOne({userId:id});
    if(addressbook.details.length >0){
        console.log('addressbook exists');
        await Address.findOneAndUpdate({userId:id},{$push:{details:{name:name,housename:housename,
            landmark:landmark,street:street,pin:pin,contact:contact,district:district,state:state,country:country}}})
    }else{
        console.log('addressbook doesnt exists');
        await Address.findOneAndUpdate({userId:id},{$push:{details:{name:name,housename:housename,
            landmark:landmark,street:street,pin:pin,contact:contact,district:district,state:state,country:country,select:true}}})
       
        console.log('default address saved');

    }
        res.redirect('back')
    // console.log(address);
});

// profileRouter.post('/edit-address/:index',async (req,res)=>{
//     let user = req.session.user;
//     let index = req.params.index;
//     let {name,housename,landmark,street,pin,contact,district} = req.body;
//     await Address.findOne({userId:user._id}).then((address)=>{
//         address.details[index].name = name;
//         address.details[index].housename = housename;
//         address.details[index].landmark = landmark;
//         address.details[index].street = street;
//         address.details[index].pin = pin;
//         address.details[index].contact = contact;
//         address.details[index].district = district;

//         address.save();

//         res.redirect('back');

//     })

// })
profileRouter.post('/edit-address/:index', async (req, res) => {
    try {
      const user = req.session.user;
      const index = req.params.index;
      const {
        name,
        housename,
        landmark,
        street,
        pin,
        contact,
        district
      } = req.body;
  
      const address = await Address.findOne({ userId: user._id });
  
      if (!address) {
        // Handle the case where the address is not found
        return res.status(404).send('Address not found');
      }
  
      address.details[index].name = name;
      address.details[index].housename = housename;
      address.details[index].landmark = landmark;
      address.details[index].street = street;
      address.details[index].pin = pin;
      address.details[index].contact = contact;
      address.details[index].district = district;
  
      await address.save();
  
      res.redirect('back');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
profileRouter.get('/delete-address/:index',async(req,res)=>{
    let index = req.params.index;
    let user =req.session.user;
    await Address.findOne({userId:user._id}).then((address)=>{
        let ad = address.details[index];
        console.log(ad);
        address.details.pull(ad)
        address.save();
        res.redirect('back')
    })
})



profileRouter.post('/change-password', async (req, res) => {
  // Get the user object from the session
  const user = req.session.user;

  // Get the current password, new password, and re-typed password from the form
  const { password, npassword, cpassword } = req.body;

  try {
    // Check if the new password matches the re-typed password
    if (npassword !== cpassword) {
      req.flash('error', 'New password and re-typed password do not match.');
      return res.redirect('/profile');
    }

    // Verify the current password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profile');
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(npassword, 10);

    // Update the user's password in the database
    await User.findByIdAndUpdate(user._id, { password: newPasswordHash });

    req.flash('success', 'Your password has been updated successfully.');
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while updating your password.');
    res.redirect('/profile');
  }
});

module.exports = profileRouter  ;