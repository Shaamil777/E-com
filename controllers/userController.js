const {createAndSendOtp} = require('../controllers/otpController.')
const bcrypt = require('bcrypt');
const saltRounds=10;
const User=require('../models/userModel')
const OTP = require('../models/otpModel')
const Product = require('../models/productModel')


const loadSignup = (req,res)=>{
    res.render('user/signup',{message:null})
}


const loadVerify = (req,res)=>{
    res.render('user/verify',{message:null})
}


const sentOTP = async(req,res)=>{
    const {username,email,phone,password}=req.body
    const existUser=await User.findOne({email})
    if(existUser){
        return res.render('user/signup',{message:"User already exists"})
        
    }
   try {

    const hashedPassword = await bcrypt.hash(password,saltRounds)
    req.session.user={
        username,
        email,
        phone,
        password:hashedPassword,
    };
    await createAndSendOtp(email);
    return res.redirect('/register/verify')

   } catch (error) {
    console.error("Error occure during OTP sending : ",error);
    return res.status(500).send("Error sending OTP,Please try again")
   }
}

const verifyOtp= async(req,res)=>{
    const {email}=req.session.user
    const {otp}=req.body
    
    try {
        
        const otpRecord = await OTP.findOne({email});
        
        

        if(!otpRecord || otp.trim() !== otpRecord.otp.toString().trim()){
            console.log("error");
            
            return res.render('user/verify',{message:"Enter a valid OTP"})
        }

        const user = new User({
            username:req.session.user.username,
            email:req.session.user.email,
            phone:req.session.user.phone,
            password:req.session.user.password,
        });

        await user.save();

        req.session.user = "";

        return res.redirect('/home')

    } catch (error) {
        console.error("Error during OTP verification :",error)
        return res.status(500).send("Error verifying OTP.Please try again.")
    }
}

const loadHome = (req,res)=>{
    res.send("hellll yeahhhhh")
}


const loadShop = async (req,res)=>{
    try {
        const product = await Product.find({isDeleted: false})

        res.render('user/shop',{product})
    } catch (error) {
        
    }
}


const loadItemDetails =async (req,res)=>{
    try{
    const productId = req.params.id;
    const product = await Product.findById(productId)
    const similarProducts =  await Product.find({category: product.category,_id:{$ne:productId}})
    res.render('user/itemDetail',{product,similarProducts})
    }catch(error){
        console.error("Error loading product details : ",error)
        res.status(500).send("Error loading product details. Please try again.")
    }
    
}

module.exports ={
loadSignup,
loadVerify,
sentOTP,
verifyOtp,
loadHome,
loadShop,
loadItemDetails
}