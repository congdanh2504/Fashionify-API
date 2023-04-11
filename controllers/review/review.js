const reviewModel = require("../../models/review");

module.exports.getProductReviews = async (req, res) => {
    try{

        const productId = req.params['productId']

        const reviews = await reviewModel.find({
            productId: productId
        }).populate("user");        

        return res.json({
            success : true,
            message : "Get reviews successfully",
            data : reviews
        })

    }catch(error){
        return res.send(error.message)
    }
}

module.exports.addReview = async (req, res) => {
    try{

        const {comment, rating, productId, date} = req.body;
        const user = req.user;
       
        if(!comment || !rating || !productId) return res.send("Fields are empty")

        let review = new reviewModel({
            user: user._id,
            comment: comment,
            rating: parseInt(rating),
            productId: productId,
            date: date
        })
        review.save();

        return res.json({
            success : true,
            message : "Product inserted successfully",
            data : review
        })

    }catch(error){
        return res.send(error.message)
    }
}