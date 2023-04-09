const express = require('express')
const app = express();
const port = process.env.PORT;
var bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
var path = require('path');
var cors = require('cors')
const { initializeApp } = require("firebase/app");
// MULTER
const multer  = require('multer')
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

// To access public folder
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

// Set up Global configuration access
dotenv.config();
initializeApp({
  apiKey: "AIzaSyB4xWnbISqN6o4e74rnqYGvU27oEYt0RzU",
  authDomain: "shop-e7d32.firebaseapp.com",
  projectId: "shop-e7d32",
  storageBucket: "shop-e7d32.appspot.com",
  messagingSenderId: "984270697481",
  appId: "1:984270697481:web:dc708480be86905be8f4d8"
});

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });



const { register, login, updateUser, deleteUser, userById, resetPassword } = require("./controllers/auth/auth");
const { addProduct, updateProduct, deleteProduct, getAllProducts } = require("./controllers/products/products")
const { checkout, addToCart, cart, removeFromCart } = require("./controllers/user/cart")
const { isAdmin, checkAuth } = require("./controllers/middlewares/auth");
const { dashboardData, getAllUsers } = require('./controllers/admin/dashboard');
const { getAllOrders, changeStatusOfOrder } = require('./controllers/admin/orders');
const { orders } = require('./controllers/user/orders');
const { addCategory, getCategories, updateCategory, deleteCategory } = require('./controllers/categories/category');
const { addToWishlist, wishlist, removeFromWishlist } = require('./controllers/user/wishlist');
const mongoose = require("./config/database")()


app.get('/', (req, res) => {
  res.send('Hello World!')
});


// AUTH
app.post('/register', register);
app.post("/login", login)


// User Routes
app.post("/update-user", updateUser)
app.get("/user", userById)
app.get("/delete-user", deleteUser)
app.post("/reset-password", resetPassword)


// Products
app.post("/product", [isAdmin], addProduct)
app.get("/products", getAllProducts)
app.post("/update-product", [isAdmin], updateProduct)
app.get("/delete-product", [isAdmin], deleteProduct)


// CATEGORIES
app.post("/category", [isAdmin], addCategory)
app.get("/categories", getCategories)
app.post("/update-category", [isAdmin], updateCategory)
app.get("/delete-category", [isAdmin], deleteCategory)


// ORDERS
app.get("/orders",[checkAuth],orders)

// CHECKOUT
app.post("/checkout",[checkAuth],checkout)

// WISHLIST
app.post("/add-to-wishlist",[checkAuth],addToWishlist)
app.get("/wishlist",[checkAuth],wishlist)
app.get("/remove-from-wishlist",[checkAuth],removeFromWishlist)

// ADMIN
app.get("/dashboard",[isAdmin],dashboardData)
app.get("/admin/orders",[isAdmin],getAllOrders)
app.get("/admin/order-status",[isAdmin],changeStatusOfOrder)
app.get("/admin/users",[isAdmin],getAllUsers)

app.post("/photos/upload", upload.single("filename"), async (req, res) => {
  try {
      const dateTime = giveCurrentDateTime();

      const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);

      // Create file metadata including the content type
      const metadata = {
          contentType: req.file.mimetype,
      };

      // Upload the file in the bucket storage
      const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
      //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

      // Grab the public url
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('File successfully uploaded.');
      return res.send({
          message: 'file uploaded to firebase storage',
          name: req.file.originalname,
          type: req.file.mimetype,
          downloadURL: downloadURL
      })
  } catch (error) {
      return res.status(400).send(error.message)
  }
});

const giveCurrentDateTime = () => {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + ' ' + time;
  return dateTime;
}


app.listen((process.env.PORT || 8081), () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
});