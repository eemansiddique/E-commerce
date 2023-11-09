
const express=require('express')
const sharp=require('sharp')
const productRouter=express.Router();
const auth = require('../config/auth');
 const fs = require('fs');
const Product = require('../model/product');
const Category = require('../model/category');
// const { cropImage, cropOptions } = require('../public/images/crop-img'); // Adjust the path as needed
//  const fs = require('fs').promises;
// const { cropImage, cropOptions}= require('../public/images/crop-img/crop-img.js'); 
const { cropImage, cropOptions } = require('../public/images/crop-img/crop-img');
const util = require('util');
const unlink = util.promisify(fs.unlink);

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/product-img');
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})
const upload = multer({ storage: storage })





productRouter.get('/',async  (req, res) => {
try{
    const count = await Product.countDocuments();
    const products = await Product.find().exec();
    const admin = req.session.admin;
        const success = req.flash('success');
        const error = req.flash('error');
        res.render('admin/product', { products, count, success, admin ,error});

}catch(error){
    console.log(error)
    res.status(500).send('An error occurred');
}
   
    });

    //to render add product page
    productRouter.get('/add-product', (req, res) => {
        let title = "";
        let description = "";
        let price = "";
    
        Category.find()
            .then(categories => {
                admin = req.session.admin;
                const error = req.flash('error');
    
                res.render('admin/add-product', {
                    admin,
                    error,
                    title,
                    description,
                    categories,
                    price,
                });
            })
            .catch(err => {
                // Handle error
                console.error("Error:", err);
                res.status(500).send("Internal Server Error");
            });
    });
    
   //to add the product
    // productRouter.post('/add-product', upload.single('image'), async function (req, res) {
    //     try {
    //         let { description, price, category, special, vegan } = req.body;
    //         let title = req.body.title.toUpperCase();
    //         let slug = req.body.title.toLowerCase();
    //         let image = req.file ? req.file.filename : '';
    
    //         const existingProduct = await Product.findOne({ slug: slug, category: category });
    
    //         if (existingProduct) {
    //             await unlinkAsync('public/images/product-img/' + image);
    //             req.flash('error', 'Product exists, choose another.');
    //             return res.redirect('/admin/product/add-product');
    //         } else {
    //             let price2 = parseFloat(price).toFixed(2);
    
    //             const product = new Product({
    //                 title: title,
    //                 slug: slug,
    //                 description: description,
    //                 price: price2,
    //                 category: category,
    //                 image: image,
    //                 images: [],
    //                 special: special,
    //                 vegan: vegan
    //             });
    
    //             await product.save();
    
    //             const products = await Product.find();
    //             req.app.locals.products = products;
    //         }
    
    //         req.flash('success', 'Product added!');
    //         res.redirect('/admin/product');
    //     } catch (err) {
    //         console.error(err);
    //         // Handle errors appropriately
    //     }
    // });

    //croped image 
    productRouter.post('/add-product', upload.single('image'), async function (req, res) {
        try {
            let { description, price, category, special, vegan } = req.body;
            let title = req.body.title.toUpperCase();
            let slug = req.body.title.toLowerCase();
            let image = req.file ? req.file.filename : '';
            console.log('Uploaded image filename:', image);
    
            // Crop the image if it exists
            if (image) {
                const croppedImageFileName = await cropImage(req.file, cropOptions);
                // Save the cropped image file name to use it in the product creation
                image = croppedImageFileName;
            }
    
            const existingProduct = await Product.findOne({ slug: slug, category: category });
    
            if (existingProduct) {
                await unlinkAsync('public/images/product-img/' + image);
                req.flash('error', 'Product exists, choose another.');
                return res.redirect('/admin/product/add-product');
            } else {
                let price2 = parseFloat(price).toFixed(2);
    
                const product = new Product({
                    title: title,
                    slug: slug,
                    description: description,
                    price: price2,
                    category: category,
                    image: image,
                    images: [],
                    special: special,
                    vegan: vegan
                });
    
                await product.save();
    
                const products = await Product.find();
                req.app.locals.products = products;
            }
    
            req.flash('success', 'Product added!');
            res.redirect('/admin/product');
        } catch (err) {
            console.error(err);
            // Handle errors appropriately
        }
    });

    productRouter.get('/edit-product/:id', (req, res) => {
        let categories;
    
        Category.find()
            .then(foundCategories => {
                categories = foundCategories;
    
                return Product.findById(req.params.id).exec();
            })
            .then(product => {
                if (!product) {
                    return res.render('admin/404');
                }
    
                const admin = req.session.admin;
                const error = req.flash('error');
                const success = req.flash('success');
    
                let vegan = true;
                let special = true;
                if (product.vegan == null || product.vegan == false) {
                    vegan = false;
                }
                if (product.special == null || product.special == false) {
                    special = false;
                }
    
                res.render('admin/edit-product', {
                    admin,
                    success: success,
                    error: error,
                    title: product.title,
                    description: product.description,
                    categories: categories,
                    category: product.category,
                    image: product.image,
                    special: special,
                    vegan: vegan,
                    price: product.price,
                    id: product._id,
                    gallery: product.images,
                });
            })
            .catch(err => {
                console.log(err);
                res.render('admin/404');
            });
    });


    
    //croped image

    productRouter.post('/edit-product/:id', upload.single('image'), async (req, res) => {
        try {
            const { title, pimage, description, price, category, special, vegan } = req.body;
            console.log(special, '  ', vegan);
            const slug = title.toLowerCase();
            let image = req.file ? req.file.filename : "";
            const id = req.params.id;
            const price2 = parseFloat(price).toFixed(2);
    
            const existingProduct = await Product.findOne({
                slug: slug,
                category: category,
                _id: { $ne: id }
            });
    
            if (existingProduct) {
                console.log('same product found');
                if (image !== "") {
                    fs.unlink('public/images/product-img/' + image, (err) => {
                        if (err) console.log(err);
                        console.log('new img deleted');
                    });
                }
                req.flash('error', 'Product exists, choose another name.');
                return res.redirect('/admin/product/edit-product/' + id);
            } else {
                console.log('updating product');
                
                const product = await Product.findById(id);
                const img = image !== "" ? image : pimage;
                
                product.title = title;
                product.slug = slug;
                product.description = description;
                product.price = price2;
                product.category = category;
    
                // Crop the new image if it exists
                if (image) {
                    const croppedImageFileName = await cropImage(req.file, cropOptions);
                    // Save the cropped image file name to use it in the product update
                    image = croppedImageFileName;
    
                    // Remove the old image if it exists
                    if (pimage !== "") {
                        fs.unlink('public/images/product-img/' + pimage, (err) => {
                            if (err) console.log(err);
                            console.log('old img deleted');
                        });
                    }
    
                    product.image = image;
                }
    
                product.special = special;
                product.vegan = vegan;
                
                await product.save();
                
                req.flash('success', 'Product edited successfully.');
                res.redirect('/admin/product');
            }
        } catch (err) {
            console.log(err);
            // Handle error response
        }
    });

    
    
    productRouter.get('/delete-product/:id', async (req, res) => {
        try {
            const pro = await Product.findById(req.params.id);
    
            // Check if the product exists
            if (!pro) {
                req.flash('error', 'Product not found.');
                return res.redirect('/admin/product');
            }
    
            // Delete the main product image if it exists
            if (pro.image) {
                await fs.promises.unlink('public/images/product-img/' + pro.image);
                console.log('Main image deleted:', pro.image);
            }
    
            // Delete other images if they exist
            if (pro.images && pro.images.length > 0) {
                await Promise.all(pro.images.map(async (img) => {
                    await fs.promises.unlink('public/images/product-img/' + img);
                    console.log('Image deleted:', img);
                }));
            }
    
            // Delete the product itself
            await Product.deleteOne(pro);
    
            req.flash('success', 'Product deleted successfully!');
            res.redirect('/admin/product');
        } catch (err) {
            console.error(err);
            // Handle error and respond accordingly
            req.flash('error', 'An error occurred while deleting the product.');
            res.redirect('/admin/product');
        }
    });
    
productRouter.post('/edit-product/add-gallery/:id', upload.array('images', 5), async (req, res) => {
    const id = req.params.id;
    const images = req.files;
  
    if (images.length > 0) {
      const imageNames = images.map((img) => img.filename);
  
      try {
        const pro = await Product.findByIdAndUpdate(id, { $push: { images: { $each: imageNames } } });
        console.log('Images added to gallery');
        req.flash('success', 'Gallery added!');
        res.redirect('/admin/product/edit-product/' + id);
      } catch (error) {
        console.error(error);
        res.redirect('/admin/product');
      }
    } else {
      res.redirect('/admin/product');
    }
  });
  
  // Corrected route for deleting images from a product's gallery
  productRouter.get('/edit-product/delete-gallery/:id/:img', auth.isAdmin, async (req, res) => {
    const id = req.params.id;
    const img = req.params.img;
  
    try {
      const pro = await Product.findByIdAndUpdate(id, { $pull: { images: img } });
      fs.unlink('public/images/product-img/' + img, (err) => {
        if (err) console.error(err);
        console.log('Old image deleted');
      });
      res.redirect('/admin/product/edit-product/' + id);
    } catch (error) {
      console.error(error);
      res.redirect('/admin/*');
    }
  });



module.exports=productRouter;