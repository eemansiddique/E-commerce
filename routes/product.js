const {Product}=require('../model/product')
const express=require('express')
const {Category}=require("../model/category")
const router=express.Router();


router.post('/',async (req,res)=>{
    // const category=await Category.findById(req.body.category);
    // if(!category)
    // return res.status(400).send("Invalid Category")
    const product=new Product({
        title : req.body.title,
        category : req.body.category,
        image : req.body.image,
        description : req.body.description,
        price : req.body.price,
        // images: [],
        special : req.body.special,
        vegan : req.body.vegan
    })
  product.save().then((createdProduct=>{
    res.status(201).json({createdProduct})
  })).catch((err)=>{
    res.status(500).json({
        error:err,
        sucess:false
    })
  })
})
router.put('/update/:id',async(req,res)=>{
    const product=await Product.findByIdAndUpdate(req.params.id,{
        title : req.body.title,
        category : req.body.category,
        image : req.body.image,
        description : req.body.description,
        price : req.body.price,
        // images: [],
        special : req.body.special,
        vegan : req.body.vegan
    },
    {new:true}
    )
    if(!product)
    return res.status(200).send('the product cannot be created')

    res.send(product)

})
router.get('/list',async(req,res)=>{
    const productList=await Product.find()

    if(!productList)
    return res.status(500).json({success:false})

    res.status(200).send(productList)
})
router.get('/singlelist/:id',async(req,res)=>{
    const productList=await Product.findById(req.params.id)

    if(!productList)
    return res.status(500).json({success:false})

    res.status(200).send(productList)
})
router.delete("/delete/:id",async(req,res)=>{
    const product=await Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product)
        return res.status(200).json({sucess:true,message:"product deleted sucessfully"})
        else
        return res.status(404).json({sucess:false,message:"product not found"})
    })

})
module.exports=router;