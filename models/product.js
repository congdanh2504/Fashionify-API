const mongoose = require("mongoose")
var random = require('mongoose-random');

const productSchema = mongoose.Schema({

    title : String,
    sku : {type : String},
    price : Number,
    image : String,
    description : String,
    category : {type:mongoose.Schema.Types.ObjectId, ref:'categories'},
    quantity : Number

}, { timestamps : true })

productSchema.plugin(random, { path: 'r' });

module.exports = mongoose.model("product", productSchema)