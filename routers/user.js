const express=require('express')
const router=express.Router()
const userController = require('../controllers/userController')
const passport = require('../config/passport')


router.get('/signup',userController.loadSignup)
router.post('/signup',userController.sentOTP)
router.get('/register/verify',userController.loadVerify)
router.post('/register/verify',userController.verifyOtp)
router.get('/home',userController.loadHome)


router.get('/shop',userController.loadShop)
router.get('/itemDetail/:id',userController.loadItemDetails)

router.get('/auth/google',passport.authenticate('google',{scope: ['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/register'}),(req, res) => 
    {
        res.redirect('/home');
    }
)

module.exports = router