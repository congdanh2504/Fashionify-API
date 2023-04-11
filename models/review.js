const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema({
    user : {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    productId: {type:mongoose.Schema.Types.ObjectId, ref:'product', required:true},
    rating : Number,
    comment: String,
    date: String
}, { timestamps : true })

module.exports = mongoose.model("review", reviewSchema)