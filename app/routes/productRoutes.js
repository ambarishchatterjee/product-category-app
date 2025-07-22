const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// Home page with search
router.get('/', ProductController.home);

// Product detail page
router.get('/product/:slugOrId', ProductController.productDetail);

module.exports = router;
