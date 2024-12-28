const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const upload = require('../utils/multer')
const upload_2 = require('../utils/categoryMulter')

router.get('/login',adminController.loadAdminLogin)
router.post('/login',adminController.loginForm)
router.get('/dashboard',adminAuth,adminController.loadDashboard)


router.get('/usermanagement',adminAuth,adminController.loadUserManagement)
router.put('/usermanagement/ban',adminAuth,adminController.userBan)
router.get('/usermanagement/view',adminAuth,adminController.userView)



router.get('/categorymanagement',adminAuth,categoryController.loadCategoryManagement)
router.get('/category/add',adminAuth,categoryController.loadAddCategory)
router.post('/category/add',upload_2.single('categoryImage'),categoryController.addCategory)
router.get('/category/update/:id',adminAuth,categoryController.loadUpdateCategory)
router.put('/category/update',adminAuth,categoryController.updateCategory)
router.get('/category/deletedcategory',adminAuth,categoryController.loadDeletedCategory)
router.put('/category/delete',adminAuth,categoryController.deleteCategory)
router.put('/category/recover',adminAuth,categoryController.recoverCategory);
router.post('/admin/category/update/:categoryId',adminAuth, categoryController.categoryUpdate);
router.post('/update-category-image/:categoryId',upload_2.single('categoryImage'),categoryController.categoryImageUpdate);
router.post('/category/update/:categoryId',adminAuth, categoryController.categoryUpdate);
router.put('/categorymanagement/:catId/apply',adminAuth,categoryController.applyOffer)
router.put('/categorymanagement/:categoryId/remove',adminAuth,categoryController.removeOffer)

router.get('/productmanagement',adminAuth,productController.loadProductManagement)
router.get('/product/add',adminAuth,productController.loadAddProduct)
router.post('/product/add',upload.fields([
    { name: 'productImage1', maxCount: 1 },
    { name: 'productImage2', maxCount: 1 },
    { name: 'productImage3', maxCount: 1 },
    { name: 'productImage4', maxCount: 1 },
    { name: 'productImage5', maxCount: 1 }
  ]),productController.addProduct)
router.put('/product/delete',adminAuth,productController.deleteProduct)
router.get('/product/deletedproduct',adminAuth,productController.loadDeletedProduct)
router.put('/product/recover',adminAuth,productController.recoverProduct)
router.get('/product/update/:id',adminAuth,productController.loadUpdateProduct)
router.put('/product/update', upload.fields([
  { name: 'productImage1', maxCount: 1 },
  { name: 'productImage2', maxCount: 1 },
  { name: 'productImage3', maxCount: 1 },
  { name: 'productImage4', maxCount: 1 }
]), productController.updateProduct);



router.get('/ordermanagement',adminAuth,orderController.loadOrderManagement)
router.get('/vieworder/:orderId',adminAuth,orderController.viewOrder)
router.post('/order/:orderId/updatestatus',adminAuth,orderController.updateStatus)
router.put('/order/:orderId/returnstatus',adminAuth,orderController.returnRequest)


router.get('/couponmanagement',adminAuth,couponController.loadCouponManagement)
router.get('/coupon/add',adminAuth,couponController.loadAddCoupon)
router.post('/coupon/add',adminAuth,couponController.addCoupon)
router.put('/coupon/delete',adminAuth,couponController.deleteCoupon)
router.get('/coupon/update/:couponId',adminAuth,couponController.loadUpdateCoupon)
router.put('/coupon/update',adminAuth,couponController.updateCoupon)

router.get('/salesreport',adminAuth,adminController.loadSalesReport)
router.get('/salesreportdata',adminAuth,adminController.reportData)


router.get('/logout',adminAuth,adminController.logout);
module.exports = router