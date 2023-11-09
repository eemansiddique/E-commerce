const express = require('express');
const categoryRouter = express.Router();
const auth = require('../config/auth');
const fs = require('fs');
const Category = require('../model/category');
const Product = require('../model/product');
const { check, validationResult } = require('express-validator');
const util = require('util');
const unlink = util.promisify(fs.unlink);




const multer = require('multer');
const storage = multer.diskStorage({
    destination : function(req,file,cb) {
        cb(null,'public/images/category-img');
    },
    filename : function (req,file,cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null,name);
    }
})
const upload = multer({storage : storage});

//to list out the category
categoryRouter.get('/', async (req, res) => {
    try {
        const count = await Category.countDocuments();
        const categories = await Category.find().exec();

        const admin = req.session.admin;
        const success = req.flash('success');
        const error = req.flash('error');

        res.render('admin/category', { categories, count, admin, success, error });
    } catch (error) {
        console.error(error);
        // Handle the error appropriately, e.g., send an error response
        res.status(500).send('An error occurred');
    }
});

//to add category

categoryRouter.post('/add-category', upload.single('image'), async function (req, res) {
    try {
        let title = req.body.title.replace(/\s+/g, '-').toUpperCase();
        let slug = title.replace(/\s+/g, '-').toLowerCase();
        let image = req.file ? req.file.filename : '';

        const existingCategory = await Category.findOne({ slug: slug }).exec();

        if (existingCategory) {
            console.log('Category exists');

            if (image) {
                await unlink('public/images/category-img/' + image);
                console.log('Old image deleted');
            }

            req.flash('error', 'Category title exists, choose another.');
            return res.redirect('/admin/category/add-category');
        } else {
            const newCategory = new Category({
                title: title,
                slug: slug,
                image: image
            });

            await newCategory.save();

            const categories = await Category.find().exec();
            req.app.locals.categories = categories;

            req.flash('success', 'Category added successfully!');
            return res.redirect('/admin/category');
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred.');
        return res.redirect('/admin/category/add-category');
    }
});
// categoryRouter.get('/', (req,res)=>{
//     // const admin = req.session.admin;
//     res.send("category page added")
// });

//to render add cateory view page

categoryRouter.get('/add-category',(req,res)=>{

    admin = req.session.admin;
    const title = ""
    const error = req.flash('error');

    res.render('admin/add-category',{admin,title,error});

});



//to render the edit category page

categoryRouter.get('/edit-category/:id', (req, res) => {
    Category.findById(req.params.id)
        .then(category => {
            if (!category) {
                return res.render('admin/404');
            }

            const admin = req.session.admin;
            const error = req.flash('error');

            res.render('admin/edit-category', {
                admin,
                error,
                title: category.title,
                image: category.image,
                id: category._id
            });
        })
        .catch(err => {
            console.log(err);
            res.render('admin/404');
        });
});


categoryRouter.post('/edit-category/:id', upload.single('image'), async (req, res) => {
    const { title, pimage } = req.body;
    const id = req.params.id;

    try {
        const existingCategory = await Category.findOne({ title: title, _id: { $ne: id } });

        if (existingCategory) {
            if (req.file) {
                // If a new image was uploaded, delete it
                fs.unlinkSync('public/images/category-img/' + req.file.filename);
            }

            req.flash('error', 'Category name already exists!');
            return res.redirect('/admin/category/edit-category/' + id);
        } else {
            const updateData = { title: title };

            if (req.file) {
                // If a new image was uploaded, update the image field
                updateData.image = req.file.filename;

                // Delete the old image
                fs.unlinkSync('public/images/category-img/' + pimage);
            }

            const updatedCategory = await Category.findByIdAndUpdate(id, { $set: updateData });

            req.flash('success', 'Category edited successfully!');
            return res.redirect('/admin/category');
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while editing the category.');
        res.redirect('/admin/category/edit-category/' + id);
    }
});



 module.exports=categoryRouter;