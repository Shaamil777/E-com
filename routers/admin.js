const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const upload = require('../utils/multer')
const upload_2 = require('../utils/categoryMulter')

router.get('/login',adminController.loadAdminLogin)
router.post('/login',adminController.loginForm)
router.get('/dashboard',adminController.loadDashboard)


router.get('/usermanagement',adminController.loadUserManagement)
router.put('/usermanagement/ban',adminController.userBan)
router.get('/usermanagement/view',adminController.userView)



router.get('/categorymanagement',categoryController.loadCategoryManagement)
router.get('/category/add',categoryController.loadAddCategory)
router.post('/category/add',upload_2.single('categoryImage'),categoryController.addCategory)
router.get('/category/update/:id',categoryController.loadUpdateCategory)
router.put('/category/update',categoryController.updateCategory)
router.get('/category/deletedcategory',categoryController.loadDeletedCategory)
router.put('/category/delete',categoryController.deleteCategory)
router.put('/category/recover',categoryController.recoverCategory);



router.get('/productmanagement',productController.loadProductManagement)
router.get('/product/add',productController.loadAddProduct)
router.post('/product/add',upload.fields([
    { name: 'productImage1', maxCount: 1 },
    { name: 'productImage2', maxCount: 1 },
    { name: 'productImage3', maxCount: 1 },
    { name: 'productImage4', maxCount: 1 },
    { name: 'productImage5', maxCount: 1 }
  ]),productController.addProduct)
router.put('/product/delete',productController.deleteProduct)
router.get('/product/deletedproduct',productController.loadDeletedProduct)
router.put('/product/recover',productController.recoverProduct)
router.get('/product/update/:id',productController.loadUpdateProduct)
router.put('/product/update',productController.updateProduct)
module.exports = router