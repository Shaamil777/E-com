const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
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
router.post('/admin/category/update/:categoryId', categoryController.categoryUpdate);

router.post('/update-category-image/:categoryId',upload_2.single('categoryImage'),categoryController.categoryImageUpdate);
router.post('/category/update/:categoryId', categoryController.categoryUpdate);


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
router.put('/product/update', upload.fields([
  { name: 'productImage1', maxCount: 1 },
  { name: 'productImage2', maxCount: 1 },
  { name: 'productImage3', maxCount: 1 },
  { name: 'productImage4', maxCount: 1 }
]), productController.updateProduct);



router.get('/ordermanagement',orderController.loadOrderManagement)
router.get('/vieworder/:orderId',orderController.viewOrder)
router.post('/order/:orderId/updatestatus',orderController.updateStatus)
router.put('/order/:orderId/returnstatus',orderController.returnRequest)


router.get('/couponmanagement',couponController.loadCouponManagement)
router.get('/coupon/add',couponController.loadAddCoupon)
router.post('/coupon/add',couponController.addCoupon)
router.put('/coupon/delete',couponController.deleteCoupon)
router.get('/coupon/update/:couponId',couponController.loadUpdateCoupon)
router.put('/coupon/update',couponController.updateCoupon)

router.get('/salesreport',adminController.loadSalesReport)
router.get('/salesreportdata',adminController.reportData)

module.exports = router