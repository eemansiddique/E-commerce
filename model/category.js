const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    title : String,
    // slug : String,
    image : String
},{
    timestamps: true
}
);
const Category = mongoose.model('Category', categorySchema);
module.exports = Category ;