const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// Home page with search
router.get('/', ProductController.home);

router.get('/products', ProductController.getProducts);
router.get('/category/:categoryName', ProductController.getProductByCategory);

// Product detail page
router.get('/product/:slugOrId', ProductController.productDetail);

module.exports = router;
