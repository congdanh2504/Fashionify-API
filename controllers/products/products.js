const productModel = require("../../models/product");
const { getUserOrders } = require("../user/orders");
const { getRecommendations } = require("./recommender");

module.exports.getProductById = async (req, res) => {
    try{

        const product_id = req.params['id'];

        const product = await productModel.findById(product_id)

        return res.json({
            success : true,
            message : "Get product successfully",
            data : product
        })

    }catch(error){
        return res.send(error.message)
    }
}

module.exports.addProduct = async (req, res) => {
    try{

        const {title, sku, price, image} = req.body;

        if(!title || !sku || !price) return res.send("Fields are empty")

        let product = new productModel(req.body)
        product.save()

        return res.json({
            success : true,
            message : "Product inserted successfully",
            data : product
        })

    }catch(error){
        return res.send(error.message)
    }
}

module.exports.getProducts = async (req, res) => {
    try{

        const products = await productModel.find();
        const productsCount = await productModel.find().count();

        return res.json({
            success : true,
            status : 400,
            message : "list of all products",
            products,
            count : productsCount
        })

    }catch(error){
        return res.send(error.message)
    }
}


module.exports.updateProduct = async (req, res) => {
    try{

        const {title, sku, price, image} = req.body;
        const {id} = req.query;

        // check if product exist with the given product id
        const product = await productModel.findOne({_id : id})

        if(product){
            const updatedProduct = await productModel.findOneAndUpdate({_id : id}, req.body, {new :true})

            return res.json({
                success : true,
                status : 200,  
                message : "product updated successfully",
                data : updatedProduct
            })
        }else{
            
            return res.json({
                success : false,
                status : 400,
                message : "product does not exist"
            })

        }

    }catch(error){
        return res.send(error.message)
    }
}

module.exports.deleteProduct = async (req, res) => {
    try{

        const {id} = req.query;
        
        // check if product exist with the given product id
        const product = await productModel.findOneAndDelete({_id : id})
        if(!product){
            return res.json({
                success : false,
                message : "product does not exist",
            })
        }
        return res.json({
            success : true,
            message : "product deleted successfully",
        })

    }catch(error){
        return res.send(error.message)
    } 
}

module.exports.getProductsPaginate = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const products = await productModel.find().populate("category").skip(skip).limit(limit);
        const total = await productModel.countDocuments();

        return res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });

    }catch(error){
        return res.json({
            success : false,
            status : 400,
            message : error.message
        })
    }
}

module.exports.getAllProducts = async (req, res) => {
    try{

        // Search through title names
        var {search} = req.query
        if(!search) search = ""

        const products = await productModel.find({title:{'$regex' : search, '$options' : 'i'}})
            .populate("category")

        return res.json({
            success : true,
            status : 200,
            message : "list of products",
            data : products
        })

    }catch(error){
        return res.json({
            success : false,
            status : 400,
            message : error.message
        })
    }
}

module.exports.getRecommendProducts = async (req, res) => {
    try {
        const orders = await getUserOrders(req.user)
        let products = []
        if (orders.length === 0) {
            products = await productModel.find({}).populate("category").skip(5).limit(10)
        } else {
            let historyProduct = []
            orders.forEach(order => {
                order.items.forEach(product => {
                    if (!historyProduct.includes(product.productId)) historyProduct.push(product.productId)
                })
            })
            products = getRecommendations(historyProduct)
        }

        return res.json({
            success : true,
            status : 200,
            message : "list of products",
            data : products
        })


    } catch (error) {
        console.log(error.message)
        return res.json({
            success : false,
            status : 400,
            message : error.message
        })
    }
}

