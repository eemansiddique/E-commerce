
const express=require('express')
const productRouter=express.Router();
const auth = require('../config/auth');
const fs = require('fs');
const Product = require('../model/product');
const Category = require('../model/category');
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
    productRouter.post('/add-product', upload.single('image'), async function (req, res) {
        try {
            let { description, price, category, special, vegan } = req.body;
            let title = req.body.title.toUpperCase();
            let slug = req.body.title.toLowerCase();
            let image = req.file ? req.file.filename : '';
    
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


    productRouter.post('/edit-product/:id', upload.single('image'), async (req, res) => {
        try {
            const { title, pimage, description, price, category, special, vegan } = req.body;
            console.log(special, '  ', vegan);
            const slug = title.toLowerCase();
            const image = req.file ? req.file.filename : "";
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
                product.image = img;
                product.special = special;
                product.vegan = vegan;
                
                await product.save();
                
                if (image !== "") {
                    console.log('image is already there');
                    
                    if (product.image !== "") {
                        console.log('image updated');
                        
                        fs.unlink('public/images/product-img/' + pimage, (err) => {
                            if (err) console.log(err);
                            console.log('old img deleted');
                        });
                    }
                }
                
                req.flash('success', 'Product edited successfully.');
                res.redirect('/admin/product');
            }
        } catch (err) {
            console.log(err);
            // Handle error response
        }
    });


    productRouter.get('/delete-product/:id',  async (req, res) => {
        try {
            const pro = await Product.findById(req.params.id);
    
            // Delete the main product image
            await fs.promises.unlink('public/images/product-img/' + pro.image);
            console.log('Main image deleted');
    
            // Delete other images
            await Promise.all(pro.images.map(async (img) => {
                await fs.promises.unlink('public/images/product-img/' + img);
                console.log('Image deleted:', img);
            }));
    
            await Product.deleteOne(pro);
            
            req.flash('success', 'Product deleted successfully!');
            res.redirect('/admin/product');
        } catch (err) {
            console.error(err);
            // Handle error and respond accordingly
            res.status(500).send('An error occurred while deleting the product.');
        }
    });
    
    
    // productRouter.post('/edit-product/add-gallery/:id', upload.array('images', 5),async (req, res) => {

    //     let id = req.params.id;
    //     console.log(id);
    //     let images = req.files;
    
    //     if (images.length > 0) {
    //         let imageName = images.map((img) => {
    //             return img.filename;
    //         })
    
    //         await imageName.map((img) => {
    //             Product.findByIdAndUpdate({ _id: id }, { $push: { images: img } })
    //                 .then((pro) => {
    //                     pro.save(() => {
    //                         console.log('saved');
    //                     })
    
    //                 })
                    
    //             })
    //             req.flash('success', 'gallery added!');
    //             res.redirect('/admin/product/edit-product/' + id);
    //     } else {
    //         res.redirect('/admin/product');
    //     }
    
    // })
     
    // productRouter.get('/edit-product/delete-gallery/:id/:img', auth.isAdmin, (req, res) => {
    //     let id = req.params.id;
    //     let img = req.params.img;
    
    //     Product.findById((id), async (err, pro) => {
    //         if(err){
    //             console.log(err)
    //             return res.redirect('/admin/*');
    //         }
    //         pro.images.pull(img);
    //         await pro.save(() => {
    //             fs.unlink('public/images/product-img/' + img, (err) => {
    //                 if (err) console.log(err);
    //                 console.log('old img deleted');
    
    //             })
    //             res.redirect('/admin/product/edit-product/' + id);
    //         })
    
    //     })
    // })
    
    
    
   
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