const express = require('express');
const router = express.Router();

const Category = require('../model/category');
const Product = require('../model/product');

router.post('/add-category',async(req,res)=>{
    let category=new Category({
        title:req.body.title,
        image:req.body.image
    })
    category=await category.save()
    if(!category)
    return res.status(404).send('the category cannot be created')
    res.send(category)
})
router.put('/update/:id',async(req,res)=>{
    const category=await Category.findByIdAndUpdate(req.params.id,{
        title:req.body.title,
        image:req.body.image
    },
    {new:true}
    )
    if(!category)
    return res.status(200).send('the category cannot be created')

    res.send(category)

})
router.get('/list',async(req,res)=>{
    const categoryList=await Category.find()

    if(!categoryList)
    return res.status(500).json({success:false})

    res.status(200).send(categoryList)
})
router.get('/singlelist/:id',async(req,res)=>{
    const categoryList=await Category.findById(req.params.id)

    if(!categoryList)
    return res.status(500).json({success:false})

    res.status(200).send(categoryList)
})
router.delete("/delete/:id",async(req,res)=>{
    const category=await Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category)
        return res.status(200).json({sucess:true,message:"category deleted sucessfully"})
        else
        return res.status(404).json({sucess:false,message:"category not found"})
    })

})
module.exports=router;