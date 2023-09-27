const express = require('express');
const categoryRouter = express.Router();
const auth = require('../config/auth');
const fs = require('fs');
const Category = require('../model/category');
const Product = require('../model/product');
const { check, validationResult } = require('express-validator');
const util = require('util');
const unlink = util.promisify(fs.unlink);


// router.post('/add-category',async(req,res)=>{
//     let category=new Category({
//         title:req.body.title,
//         image:req.body.image
//     })
//     category=await category.save()
//     if(!category)
//     return res.status(404).send('the category cannot be created')
//     res.send(category)
// })

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

// categoryRouter.post('/add-category',upload.single('image'), function (req, res) {
 
//     let title = req.body.title.replace(/\s+/g, '-').toUpperCase();
//     let slug = title.replace(/\s+/g, '-').toLowerCase();
//     let image = typeof req.file !== "undefined" ? req.file.filename : "";

     
//         Category.findOne({slug:slug}, function (err, category) {

//             if (err)
//                 return console.log(err);

//             if (category) {

//                 console.log("cat exists");

//                 fs.unlink('public/images/category-img/'+ image ,(err)=>{
//                     if(err) console.log(err);
//                     console.log('old img deleted');
//                 });

//                 req.flash('error', 'Category title exists, choose another.');
//                 return res.redirect('/api/v1/admin/category/add-category');

//             } else {

//                 let category = new Category({
//                                     title,
//                                     slug,
//                                     image
                                    
//                                 });

//                 category.save(function (err) {

//                     if (err)
//                         return console.log(err);

//                     Category.find(function (err, categories) {

//                         if (err) {
//                             console.log(err);
//                             console.log('error in finding');

//                         } else {

//                             req.app.locals.categories = categories;

//                         }

//                     });
 
                   
//                 });

//             }
        
//                     req.flash('success', 'Category added successfully!');
//                     res.redirect('/api/v1/admin/category');
    
// });
// });

// categoryRouter.post('/add-category', upload.single('image'), function (req, res) {
//     let title = req.body.title.replace(/\s+/g, '-').toUpperCase();
//     let slug = title.replace(/\s+/g, '-').toLowerCase();
//     let image = req.file ? req.file.filename : '';

//     Category.findOne({ slug: slug }).exec(function (err, existingCategory) {
//         if (err) {
//             console.error(err);
//             req.flash('error', 'An error occurred while checking for existing categories.');
//             return res.redirect('/api/v1/admin/category/add-category');
//         }

//         if (existingCategory) {
//             console.log('Category exists');

//             if (image) {
//                 fs.unlink('public/images/category-img/' + image, function (unlinkErr) {
//                     if (unlinkErr) console.error(unlinkErr);
//                     console.log('Old image deleted');
//                 });
//             }

//             req.flash('error', 'Category title exists, choose another.');
//             return res.redirect('/api/v1/admin/category/add-category');
//         } else {
//             let newCategory = new Category({
//                 title: title,
//                 slug: slug,
//                 image: image
//             });

//             newCategory.save(function (saveErr) {
//                 if (saveErr) {
//                     console.error(saveErr);
//                     req.flash('error', 'An error occurred while saving the new category.');
//                     return res.redirect('/api/v1/admin/category/add-category');
//                 }

//                 Category.find(function (findErr, categories) {
//                     if (findErr) {
//                         console.error(findErr);
//                         req.flash('error', 'An error occurred while retrieving categories.');
//                     } else {
//                         req.app.locals.categories = categories;
//                     }

//                     req.flash('success', 'Category added successfully!');
//                     return res.redirect('/api/v1/admin/category');
//                 });
//             });
//         }
//     });
// });
// categoryRouter.put('/update/:id',async(req,res)=>{
//     const category=await Category.findByIdAndUpdate(req.params.id,{
//         title:req.body.title,
//         image:req.body.image
//     },
//     {new:true}
//     )
//     if(!category)
//     return res.status(200).send('the category cannot be created')

//     res.send(category)

// })
// categoryRouter.get('/list',async(req,res)=>{
//     const categoryList=await Category.find()

//     if(!categoryList)
//     return res.status(500).json({success:false})

//     res.status(200).send(categoryList)
// })
// categoryRouter.get('/singlelist/:id',async(req,res)=>{
//     const categoryList=await Category.findById(req.params.id)

//     if(!categoryList)
//     return res.status(500).json({success:false})

//     res.status(200).send(categoryList)
// })
// categoryRouter.delete("/delete/:id",async(req,res)=>{
//     const category=await Category.findByIdAndRemove(req.params.id).then(category=>{
//         if(category)
//         return res.status(200).json({sucess:true,message:"category deleted sucessfully"})
//         else
//         return res.status(404).json({sucess:false,message:"category not found"})
//     })

// })

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
// categoryRouter.get('/edit-category/:id',(req,res)=>{

//     Category.findById(req.params.id, (err,category)=>{

//         if(err){
//             console.log(err)
//             return res.render('admin/404');
//         }

//         admin = req.session.admin;
//         const error = req.flash('error');

//         res.render('api/v1/admin/edit-category',{  admin,
//                                             error,
//                                             title: category.title,
//                                             image : category.image,
//                                             id : category._id
//                                         }
//         );
//     });
// });


//to edit the category

// categoryRouter.post('/edit-category/:id',upload.single('image'),(req,res)=>{

//     const {title,pimage} = req.body;
//     const image = typeof req.file !== "undefined" ? req.file.filename : "";
//     const id = req.params.id;
       
//         Category.findOne({title: title,_id: {$ne: id}},(err,category)=>{

//             if (category){

//                 fs.unlink('public/images/category-img/'+ image ,(err)=>{

//                     if(err) console.log(err);
//                     console.log('old img deleted');

//                 });

//                 req.flash('error', 'Category name already exists!');

//                 return res.redirect('/api/v1/admin/category/edit-category/'+id)

//             }else{

//                 if(image !== ""){

//                     Category.findByIdAndUpdate({_id:id},{$set:{title:title , image:image}})
//                     .then((cat)=>{
//                         cat.save((err)=>{

//                             if(err) return console.log(err);
                            
//                             fs.unlink('public/images/category-img/'+pimage ,(err)=>{
//                                         if(err) console.log(err);
//                                         console.log('old img deleted');
//                                     });
                                
//                             req.flash('success', `Category edited successfully!`);
//                             res.redirect('/api/v1/admin/category');

//                         });

//                     }).catch((err)=> console.log(err));
                         
//                 }else{

//                     Category.findByIdAndUpdate({_id:id},{$set:{title:title , image:pimage}})
//                     .then((cat)=>{

//                         if(err) return console.log(err);

//                         cat.save((err)=>{
                         
//                             if(err) return console.log(err);

//                             req.flash('success', `Category edited successfully!`);
    
//                             res.redirect('/api/v1/admin/category');
//                         });

//                     }).catch((err)=> console.log(err));

//                 }
                    
//             }

//         });

// });

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