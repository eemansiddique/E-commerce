const mongoose=require('mongoose')
  

const productSchema=mongoose.Schema({
    title : String,
    // slug : String,
    category : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    image : String,
    description : String,
    price : Number,
    // images: [String],
    special : Boolean,
    vegan : Boolean

},
{
    timestamps: true
})
exports.Product=mongoose.model('product',productSchema)