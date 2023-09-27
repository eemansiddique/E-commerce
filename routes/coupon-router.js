const express = require('express');
const couponRouter = express.Router();
const auth = require('../config/auth');
const Category = require('../model/category');
const Product = require('../model/product');
const Coupon = require('../model/couponModel');

couponRouter.get('/', auth.isAdmin, async (req, res) => {
    try {
      const count = await Coupon.countDocuments(); // Use countDocuments() with async/await
  
      const coupons = await Coupon.find();
  
      admin = req.session.admin;
      const success = req.flash('success');
      const error = req.flash('error');
  
      res.render('admin/coupons', { coupons, count, admin, success, error });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error'); // Handle the error gracefully
    }
  });

  couponRouter.get('/add-coupon',auth.isAdmin,(req,res)=>{

    admin = req.session.admin;
    const error = req.flash('error');

    res.render('admin/add-coupon',{admin,error});

});


couponRouter.post('/add-coupon', async function (req, res) {
    try {
      let { coupon, offer, expiry, description, minimum } = req.body;
      let date = new Date().toDateString();
      expiry = new Date(expiry).toDateString();
  
      // Check if the coupon already exists
      const existingCoupon = await Coupon.findOne({ coupon: coupon }).exec();
  
      if (existingCoupon) {
        console.log("Coupon exists");
  
        req.flash('error', 'Coupon already exists, choose another.');
        return res.redirect('/admin/coupon/add-coupon');
      } else {
        const newCoupon = new Coupon({
          coupon: coupon,
          offer: offer,
          minimum: minimum,
          description: description,
          date: date,
          expiry: expiry,
        });
  
        await newCoupon.save();
  
        console.log(newCoupon);
  
        req.flash('success', 'Coupon added successfully!');
        return res.redirect('/admin/coupon');
      }
    } catch (err) {
      console.error(err);
      req.flash('error', 'An error occurred while adding the coupon.');
      return res.redirect('/admin/coupon/add-coupon');
    }
  });

  couponRouter.get('/edit-coupon/:id', auth.isAdmin, async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id).exec();
  
      if (!coupon) {
        return res.redirect('admin/404');
      }
  
      admin = req.session.admin;
      const error = req.flash('error');
  
      res.render('admin/edit-coupon', {
        admin,
        error,
        id: coupon._id,
        coupon: coupon.coupon,
        offer: coupon.offer,
        minimum: coupon.minimum,
        description: coupon.description,
        expiry: coupon.expiry,
      });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/404');
    }
  });
  couponRouter.post('/edit-coupon/:id', async (req, res) => {
    try {
      const { coupon, offer, expiry, description, minimum } = req.body;
      const id = req.params.id;
  
      const existingCoupon = await Coupon.findOne({ coupon: coupon, _id: { $ne: id } }).exec();
  
      if (existingCoupon) {
        req.flash('error', 'Coupon already exists!');
        return res.redirect('/admin/coupon/edit-coupon/' + id);
      } else {
        const updatedCoupon = {
          coupon: req.body.coupon,
          offer: offer,
          expiry: new Date(expiry).toDateString(),
          description: description,
          minimum: minimum,
        };
  
        await Coupon.findByIdAndUpdate({ _id: id }, { $set: updatedCoupon }).exec();
  
        req.flash('success', 'Coupon edited successfully!');
        return res.redirect('/admin/coupon');
      }
    } catch (err) {
      console.error(err);
      return res.render('admin/404');
    }
  });

  couponRouter.get('/delete-coupon/:id', auth.isAdmin, async (req, res) => {
    try {
      const couponId = req.params.id;
  
      // Find the coupon by ID
      const coupon = await Coupon.findById(couponId).exec();
  
      if (!coupon) {
        req.flash('error', 'Coupon not found');
        return res.redirect('/admin/coupon');
      }
  
      // Delete the found coupon
      await coupon.deleteOne();
  
      req.flash('success', 'Coupon deleted successfully');
      return res.redirect('/admin/coupon');
    } catch (err) {
      console.error(err);
      req.flash('error', 'An error occurred while deleting the coupon');
      return res.redirect('/admin/coupon');
    }
  });
  
  
  
  
  
module.exports = couponRouter 