const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const upload = require('../middlewares/multer');

// Routes
router.get('/', AdminController.getDashboard);
router.get('/products', AdminController.listProducts);
router.get('/products/add', AdminController.getAddProduct);
router.post('/products/add', upload.single('image'), AdminController.postAddProduct);
router.get('/products/edit/:id', AdminController.getEditProduct);
router.post('/products/edit/:id', upload.single('image'), AdminController.postEditProduct);
router.post('/products/delete/:id', AdminController.deleteProduct);
router.get('/products/deleted', AdminController.getDeletedProducts);
router.get('/products/restore/:id', AdminController.restoreProduct);
router.get('/products/permanent-delete/:id', AdminController.permanentlyDeleteProduct);

//Category
router.get('/categories', AdminController.listCategories);
router.get('/categories/add', AdminController.getAddCategory);
router.post('/categories/add', AdminController.postAddCategory);
router.get('/categories/edit/:id', AdminController.getEditCategory);
router.post('/categories/edit/:id', AdminController.postEditCategory);
router.post('/categories/delete/:id', AdminController.deleteCategory);
//router.get('/categories/deleted', AdminController.get);



module.exports = router;