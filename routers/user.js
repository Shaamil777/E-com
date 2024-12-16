const express=require('express')
const router=express.Router()
const userController = require('../controllers/userController')
const passport = require('../config/passport')
const checkBan = require('../middleware/checkBan')


router.get('/signup',userController.loadSignup)
router.get('/login',userController.loadLogin)   
router.post('/login',userController.Login)
router.post('/signup',userController.sentOTP)
router.get('/register/verify',userController.loadVerify)
router.post('/register/verify',userController.verifyOtp)
router.post('/resend-otp',userController.resendOTP)
router.get('/home',userController.loadHome)

router.get('/about',checkBan,userController.loadAbout)
router.get('/contact',checkBan,userController.loadContact)
router.get('/profile',checkBan,userController.loadProfile)
router.get('/orders',checkBan,userController.loadOrders)
router.get('/updateprofile',checkBan,userController.loadUpdateProfile)
router.post('/updateprofile',checkBan,userController.updateProfile)
router.get('/wallet',checkBan,userController.loadWallet)

router.get('/address',checkBan,userController.loadAddress)
router.post('/addaddress',checkBan,userController.addaddress)
router.put('/deleteaddress/:id',checkBan,userController.deleteAddress)
router.put('/updateaddress/:id',checkBan,userController.updateAddress)

router.get('/changepassword',checkBan,userController.loadChangePassword)
router.post('/changepassword',checkBan,userController.changePassword)

router.get('/shop',checkBan,userController.loadShop)
router.get('/itemDetail/:id',checkBan,userController.loadItemDetails)


router.get('/cart',checkBan,userController.loadCart)
router.post('/addtocart/:id',checkBan,userController.addToCart)
router.put('/cart/remove/:id',checkBan,userController.removeCart)


router.post('/applycoupon',checkBan,userController.applyCoupon)
router.post('/removecoupon',checkBan,userController.removeCoupon)

router.get('/checkout',checkBan,userController.loadCheckout)
router.post('/checkout',checkBan,userController.placeOrder)
router.post('/razorpay',checkBan,userController.razorPay)
router.post('/verify-payment',checkBan,userController.verifyPayment)
router.post('/save-order',checkBan,userController.saveOrder)

router.get('/wishlist',checkBan,userController.loadWishlist)
router.post('/wishlist/add',checkBan,userController.addToWishlist)
router.put('/wishlist/remove',checkBan,userController.removeWishlist)
router.post('/wishlist/addtocart/:productId',checkBan,userController.wishlistCart)

router.get('/orders/:orderId/vieworder',checkBan,userController.viewOrder)
router.get('/orders/:orderId/cancelorder',checkBan,userController.cancelOrder)
router.post('/orders/:orderId/returnorder',checkBan,userController.returnOrder)
router.get('/orders/:orderId/downloadinvoice',checkBan,userController.downloadInvoice)
router.get('/order/success',checkBan,userController.orderSuccess)


router.get('/api/products',userController.filter)


router.get('/logout',userController.logout)


router.get('/auth/google',passport.authenticate('google',{scope: ['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/register'}),(req, res) => 
    {
        req.session.userData = {
            email: req.user.email,
            name: req.user.name,
            id: req.user._id,
        };
        res.redirect('/home');
    }
)

module.exports = router