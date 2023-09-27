// const mongoose=require('mongoose')
  

// const productSchema=mongoose.Schema({
//     title : String,
//     // slug : String,
//     category : {
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'Category',
//         required:true
//     },
//     image : String,
//     description : String,
//     price : Number,
//     // images: [String],
//     special : Boolean,
//     vegan : Boolean

// },
// {
//     timestamps: true
// })
// exports.Product=mongoose.model('product',productSchema)

const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title : String,
    slug : String,
    category : String,
    image : String,
    description : String,
    price : Number,
    images: [String],
    special : Boolean,
    vegan : Boolean


},
{
        timestamps: true
 })
const Product = mongoose.model('Product', productSchema);
module.exports = Product ;