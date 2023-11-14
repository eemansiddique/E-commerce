const User=require('../model/user');
 const Address = require("../model/addressModel");
const express=require('express');
const auth = require('../config/auth');
const router=express.Router();
 const bcrypt=require('bcryptjs');
 const mongoose = require('mongoose');
 const { check, validationResult } = require('express-validator');
const Admin = require('../model/admin');
const Banner = require('../model/bannerModel');
const Category = require('../model/category');
const Order = require("../model/orderModel");
const Product = require("../model/product");
const fs = require('fs');
const util = require('util');

const unlink = util.promisify(fs.unlink);


// const securePassword = async (password) => {
//     const passwordHash = await bcrypt.hash(password, 10);
//     return passwordHash;
//   };

const multer = require('multer');
// const { default: items } = require('razorpay/dist/types/items');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/banner-img');
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})
const upload = multer({ storage: storage });

router.get('/', async(req, res) => {
    if (req.session.admin)
 
        res.redirect('/admin/dashboard');

    else {

        const error = req.flash('error');
        res.render('admin/login', { error: error });
     }
});

router.get('/salesreport', async(req, res) => {
    if (req.session.admin)
 
        res.render('admin/salesreport');

    else {

        const error = req.flash('error');
         res.render('admin/login', { error: error });
     }
});

const getSalesReport = async (matchStage) => {
    try {
        console.log(matchStage, "matchStage"); // Log the matchStage for debugging
        const result = await Order.aggregate([
            // {
            //     $match: matchStage, // Match the date range and status
            // },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            // {
            //     $unwind: '$user',
            // },
            {
                $unwind: '$orderDetails',
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderDetails.product',
                    foreignField: '_id',
                    as: 'productData',
                },
            },
            // {
            //     $unwind: '$productData',
            // },
            // {
            //     $lookup: {
            //         from: 'categories',
            //         localField: 'productData.category',
            //         foreignField: '_id',
            //         as: 'categoryData',
            //     },
            // },
            // {
            //     $unwind: '$categoryData',
            // },
            {
                $project: {
                    _id: 0,
                    orderId: 1,
                    userId: 1,
                    username: '$user.name',
                    productName: '$productData.title',
                    quantity: '$orderDetails.quantity',
                    total: '$total',
                    date: 1,
                    status: 1,
                    deliveryDate: 1,
                    productCategory: '$categoryData.title',
                    productPrice: '$productData.price',
                    paymentId: 1,
                    signature: 1,
                    // Add more product and category fields as needed
                },
            },
        ]);

        console.log('Result:', result); // Log the result for debugging
        return result;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};
router.post('/getOrdersByDate', async (req, res) => {
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        // const status = 'delivered'; // Set the status to filter

        const matchStage = {
            date: { $gte: startDate, $lte: endDate },
            // status: status // Include status in the match stage
        };

        console.log('Request Data:', startDate, endDate);

        const result = await getSalesReport(matchStage);

        console.log('Result:', result);
        res.json({ result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred' });
    }
});

let admin
router.get('/dashboard',auth.isAdmin, async (req, res) => {

    admin = req.session.admin;
    let productCount = await Product.count();
    let orderCount = await Order.aggregate([{$match : {status : 'delivered'}},{$unwind:'$orderDetails'},{$count : 'orderDetails'}]);
    let user = await User.aggregate([{$match : {}},{$group : {_id : '$verified',count:{$sum:1}}},{$sort:{_id:-1}}]);
    let categories = await Category.find({})
    let total = await Order.aggregate([
        {
            $match : {
                status : 'delivered'
            }
        },
        {
            $group : {
                _id : 'null',
                total : {
                    $sum : '$total'
                },
                totalDisc : {
                    $sum : '$discount'
                },
                totalShip : {
                    $sum : '$shipping'
                } 
            } 
        } 
    ])
    let recentOrders = await Order.aggregate([
        {
            $match : {
                status : 'placed'
            }
        },
        {
            $sort : {
                date : -1
            }
        },
        {
            $unwind : '$orderDetails'
        },
        {
            $limit : 10
        },
        {
            $project : {
                userId : 1,
                'orderDetails.product' : 1,
                date : 1,
                _id : 0
            }
        },
        {
            $lookup : {
                from : 'users',
                localField : 'userId',
                foreignField : '_id',
                as : 'user'
            }
        },
        {
            $lookup : {
                from : 'products',
                localField : 'orderDetails.product',
                foreignField : '_id',
                as : 'product'
            }
        },
        {
            $unwind : '$product'
        },
        {
            $unwind : '$user'
        },
        {
            $project : {
                'product.title' : 1,
                'product.image' : 1,
                'user.name' : 1 ,
                 date : 1 
            }
        },
        {
            $sort : {
                date : 1
            }
        }  
    ])
    console.log(total); 
    console.log(recentOrders);
    console.log(user);


    res.render('admin/dashboard', { admin,productCount,total,user,recentOrders,orderCount,categories} );

});

router.get('/chart',async(req,res)=>{
    let categories = await Order.aggregate([
        {
            $match :{
                status : 'delivered'
            }

        },
        {
            $unwind : '$orderDetails'
        },
        {
            $project : {
                orderDetails : 1,
                _id: 0
            }
        },
        {
            $lookup : {
                from : 'products',
                localField : 'orderDetails.product',
                foreignField : '_id',
                as : 'items'
            }
           
        },
       
        {
            $unwind : '$items'
        },
        {
            $project : {
                'items.category' : 1,
                _id : 0  ,
                'orderDetails.quantity' : 1
            }
        },
        {
            $group:{
                _id : '$items.category',
                count : {
                    $sum : 1
                }
            }
        }
      
    ]);
    let orders = await Order.aggregate([
        {
            $match :{
                status : 'delivered'
            }

        },
        {
            $unwind : '$orderDetails'
        },
        {
            $group: {
                _id: {

                    $slice: [{
                        $split: [
                            "$date", " "
                        ]
                    }, 1, 1]

                },
                count:
                    { $sum: 1 }

            }
        }
    ]);
    console.log(orders)
    console.log(categories)

    res.json({orders,categories});
});  

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const adminData = await Admin.findOne({ email }); // Use findOne instead of find

        if (!adminData) {
            req.flash('error', 'Incorrect email or password'); // Inform the user that no admin was found
            return res.redirect('/admin');
        }

        const passwordMatch = await bcrypt.compare(password, adminData.password);
        
        if (!passwordMatch) {
            req.flash('error', 'Your password is wrong!'); // Password doesn't match
            return res.redirect('/admin');
        }

        req.session.admin = true; // Authentication successful
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'An error occurred. Please try again later.');
        return res.redirect('/admin');
    }
});






router.get('/users',async (req, res) => {
    try {
        const count = await User.countDocuments();
        const users = await User.find();
        

        const admin = req.session.admin;

        res.render('admin/users', { users:users, admin, count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/banner', auth.isAdmin, async (req, res) => {
    try {
        const banners = await Banner.find().exec();
        const admin = req.session.admin;
        const success = req.flash('success');
        const error = req.flash('error');

        res.render('admin/banner', { banners, admin, success, error });
    } catch (err) {
        console.error(err);
        // Handle the error and send an appropriate response to the client.
        res.status(500).send('Internal Server Error');
    }
});
router.get('/banner/add-banner', auth.isAdmin, async (req, res) => {
    try {
        const categories = await Category.find().exec();
        const admin = req.session.admin;

        res.render('admin/add-banner', { admin, categories });
    } catch (err) {
        console.error(err);
        // Handle the error and send an appropriate response to the client.
        res.status(500).send('Internal Server Error');
    }
});

router.post('/banner/add-banner', upload.single('banner'), async (req, res) => {
    try {
        const { title, caption, category } = req.body;
        const banner = req.file.filename;

        const newBanner = new Banner({
            banner,
            title,
            caption,
            category
        });

        await newBanner.save();

        const banners = await Banner.find().exec();
        req.app.locals.banners = banners;

        req.flash('success', 'Banner added successfully');
        res.redirect('/admin/banner');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error adding banner');
        res.redirect('/admin/banner/add-banner');
    }
});

router.get('/banner/edit-banner/:id', auth.isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const bnr = await Banner.findById(id).exec();

        if (!bnr) {
            return res.render('admin/404');
        }

        const admin = req.session.admin;

        res.render('admin/edit-banner', {
            admin,
            id,
            title: bnr.title,
            caption: bnr.caption,
            banner: bnr.banner
        });
    } catch (err) {
        console.error(err);
        res.render('admin/404'); // Handle the error by rendering an appropriate error page.
    }
});

router.post('/banner/edit-banner/:id', upload.single('banner'), async (req, res) => {
    try {
        const id = req.params.id;
        const { title, caption } = req.body;
        const banner = req.file.filename;

        const bnr = await Banner.findById(id).exec();

        if (!bnr) {
            return res.render('admin/404');
        }

        bnr.title = title;
        bnr.caption = caption;
        bnr.banner = banner;

        await bnr.save();

        const pimage = req.body.pimage;
        fs.unlink('public/images/admin-img/' + pimage, (err) => {
            if (err) {
                console.error(err);
            }
        });

        req.flash('success', 'Banner edited successfully.');
        res.redirect('/admin/banner');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error editing banner.');
        res.redirect('/admin/banner/edit-banner/' + id);
    }
});

// router.get('/banner/delete/:id', auth.isAdmin, async (req, res) => {
//     try {
//         const id = req.params.id;
//         const bnr = await Banner.findById(id).exec();

//         if (bnr) {
//             const banner = bnr.banner;
//             fs.unlink('public/images/banner-img/' + banner, (err) => {
//                 if (err) {
//                     console.error(err);
//                 }
//             });

//             await Banner.deleteOne(bnr);

//             req.flash('success', 'Banner deleted successfully.');
//         } else {
//             req.flash('error', "Banner couldn't be found.");
//         }

//         res.redirect('/admin/banner');
//     } catch (err) {
//         console.error(err);
//         req.flash('error', 'Error deleting banner.');
//         res.redirect('/admin/banner');
//     }
// });


router.get('/banner/delete/:id', auth.isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        console.log('ID:', id); // Log the ID to verify it's correct

        const bnr = await Banner.findById(id).exec();
        console.log('Banner found:', bnr); // Log the banner to see if it's found

        if (bnr) {
            const banner = bnr.banner;
            console.log('Banner file:', banner); // Log the banner file

            fs.unlink('public/images/banner-img/' + banner, (err) => {
                if (err) {
                    console.error(err);
                    req.flash('error', 'Error deleting banner file.');
                } else {
                    console.log('Banner file deleted successfully.'); // Log successful deletion
                }
            });

            await bnr.remove(); // Change to remove() to delete the document
            console.log('Banner document deleted successfully.'); // Log successful deletion

            req.flash('success', 'Banner deleted successfully.');
        } else {
            req.flash('error', "Banner couldn't be found.");
        }

        res.redirect('/admin/banner');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error deleting banner.');
        res.redirect('/admin/banner');
    }
})
router.get('/logout', (req, res) => {

    req.session.destroy();
    res.redirect('/admin');
 
});
router.get('/users/block/:id', (req, res) => {

    User.findByIdAndUpdate(req.params.id, { status: "true" }).then((err) => {

        if (err) console.log(err);

        res.redirect('/admin/users');

    });

});

router.get('/users/unblock/:id', auth.isAdmin, (req, res) => {

    User.findByIdAndUpdate(req.params.id, { status: "false" }).then((err) => {

        if (err) console.log(err);

        res.redirect('/admin/users');

    });

});

router.get('/not', (req, res) => {

    res.render('admin/404');

});


///////////


module.exports=router;