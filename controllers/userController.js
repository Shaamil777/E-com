const {createAndSendOtp} = require('../controllers/otpController.')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds=10;
const User=require('../models/userModel')
const OTP = require('../models/otpModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel')
const Wishlist = require('../models/wishlistModel')
const Wallet = require('../models/walletModel')
const Coupon = require('../models/couponModel')
const { response } = require('express');
const PDFDocument = require('pdfkit')
const instance = require('../utils/razorpay')


//laoding the signup page
const loadSignup = (req,res)=>{
    res.render('user/signup',{message:null,user:null})
}


//loading the login page
const loadLogin = async(req,res)=>{
    try{
    res.render('user/login',{message:null,user:null})
    }catch(error){
        console.error('Error loading login page',error);
        res.status(500).send({message:'Error loading login page'}) 
    }
}


//loading the verify page
const loadVerify = (req,res)=>{
    const {email}=req.session.user
    res.render('user/verify',{email})
}

//senting the otp after registering
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


//verifying the otp after registering
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
            name:req.session.user.username,
            email:req.session.user.email,
            phone:req.session.user.phone,
            password:req.session.user.password,
        });

        await user.save();

        // req.session.user = "";

        return res.redirect('/home')

    } catch (error) {
        console.error("Error during OTP verification :",error)
        return res.status(500).send("Error verifying OTP.Please try again.")
    }
}


//resending the otp after registering
const resendOTP = async (req, res) => {
    const {email} = req.body;
    
    if(!email){
        return res.status(400).send({error:'email required'});
    }
    try {
        await createAndSendOtp(email);
        return res.status(200).send({message:"OTP has sent successfully"})
    } catch (error) {
        return res.status(500).send({error:"Failed to resend OTP.Please try again"})
        
    }
}


//loading the about page
const loadAbout =async (req,res) =>{   
    try {
        res.render('user/about',{message:null})
    } catch (error) {
        console.error("Error loading about page :",error)  
        res.status(500).send("Error loading about page. Please try again.")   
    }
    
}


//loading the contact page
const loadContact = async(req,res)=>{
    try {
        res.render('user/contact',{message:null})
    } catch (error) {
        console.error("Error loading contact page :",error)
        res.status(500).send("Error loading contact page. Please try again.")     
    }
}

//login a user
const Login = async(req,res)=>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email:email})
        

        if(!user){
            return res.render('user/login',{message:"Invalid credentials"})
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.render('user/login',{message:"Invalid credentials"})
        }
        req.session.user = true;
        req.session.userData={email:user.email,id:user._id,name:user.name}
        res.redirect('/home')
    }catch(error){
        console.error("Error loading home page :",error)
        res.status(500).send("Error loading home page. Please try again.")
    }
}


//loading the home page 
const loadHome =async (req,res)=>{
    try{
        const category = await Category.find({isDeleted:false})
        // const product = await Product.find({isDeleted: false})
        const newArrivals = await Product.find({isDeleted: false}).sort({createdAt:-1}).limit(8)
        const user = req.session.userData
        res.render('user/home',{categories:category,user,newArrivals})
    }catch(error){
        console.error("Error loading home page :",error)
        res.status(500).send("Error loading home page. Please try again.")
    }
    
}


///////////////////////////MY ACCOUNT////////////////////////////////


//loading the profile page on my acoount
const loadProfile = async(req,res)=>{
    if(!req.session || !req.session.userData){
        return res.redirect('/login')
    }
    const {email} = req.session.userData
    console.log(email);
    
    const user = await User.findOne({email:email})
    try{
        res.render('user/profile',{user:user})

    }catch(error){
        console.error("Error loading profile page :",error)
        res.status(500).send("Error loading profile page. Please try again.")

    }
}


//loading the orders in my account
const loadOrders = async(req,res)=>{
    const orders = await Order.find()
 
    try {
        res.render('user/orders',{orders:orders})   
    } catch (error) {
        console.error("Error loading orders page :",error)
        res.status(500).send("Error loading orders page. Please try again.")
        
    }
}   



//viewing the order detail on my account
const viewOrder = async(req,res)=>{
    const orderId = req.params.orderId;
    try{
    const order = await Order.findById(orderId).populate('orderItems.productId').populate('userId').populate('addressId')
    if(!order){
        return res.status(404).send('Order not found. Please try again')
    }
    res.render('user/orderview',{order:order})
    }catch(error){
        console.error("Error loading order view page :",error)
        res.status(500).send("Error loading order view page. Please try again.")

    }
}



//cancelling the order on order section in my account
const cancelOrder = async(req,res)=>{
    const orderId = req.params.orderId;
    const userId = req.session.userData.id
   try {
        const order = await Order.findById(orderId)
        if(order.paymentMethod === 'Razorpay'){
            const wallet = await Wallet.findOne({userId:order.userId})
            if(!wallet){
                wallet = new Wallet({
                    userId:order.userId,
                    balance:0,
                    transactions:[],
                })
            }
            const refundableAmount = order.totalAmount;
            wallet.balance +=refundableAmount;

            wallet.transactions.push({
                amount:refundableAmount,
                type:'Credit',
                description:`Refund for Order ID : ${orderId}`
            })
            wallet.updatedAt = new Date();

            await wallet.save();
            
            order.status = 'Cancelled';
            order.updatedAt = new Date();
            await order.save()

            return res.redirect('/orders?cancelled=true');
        }
        order.status = "Cancelled"
        order.updatedAt = new Date();
        await order.save()
        return res.redirect('/orders?cancelled=true');


   } catch (error) {
    console.error("Error occured while cancelling the product",error);
    return res.status(500).send("Error cancelling the order. Please try again.")
   }
}



//loading the update profile in account
const loadUpdateProfile = async(req,res)=>{
    try {
        res.render('user/updateProfile')
    } catch (error) {
        console.error("Error loading update profile page :",error)
        res.status(500).send("Error loading update profile page. Please try again.")

    }
}



//loading the wallet page 
const loadWallet = async(req,res)=>{
    try{
    const userId = req.session.userData?.id;
    const wallet = await Wallet.findOne({userId:userId});
        if(!wallet){
            return res.render('user/wallet',{balance:0,transactions:[]})
        }

        res.render('user/wallet',{
            balance:wallet.balance,
            transactions:wallet.transactions
        })
    }catch(error){
        console.error(error)
        res.status(500).send("Error loading wallet page. Please try again.")
    }
}



//laoding the address page in my account
const loadAddress = async (req, res) => {
    const { email } = req.session.userData;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const addresses = await Address.find({ userId: user._id }); // Fetch all addresses
        res.render('user/address', { addresses }); // Pass as 'addresses'
    } catch (error) {
        console.error("Error loading address page:", error);
        res.status(500).send("Error loading address page. Please try again.");
    }
};



//adding the address
const addaddress = async(req,res)=>{
    const {houseName,country,state,city,district,pincode} = req.body
    const {email} = req.session.userData
    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({success:false,message:"User not found"})
        }
       const newAddress = await Address({
        userId:user._id,
        housename:houseName,
        country,
        state,
        city,
        district,
        pincode
       });

       await newAddress.save();

       res.status(201).json({success:true,message:"Address added successfully"})
    } catch (error) {
        console.error("Error adding address :".error);
        res.status(500).json({success:false,message:"Error adding address"})
    }
}



//deleting the address
const deleteAddress = async(req,res)=>{
    const addressId = req.params.id
    try {
        const address = await Address.findByIdAndDelete(addressId);
        if(!address){
            return res.status(404).json({success:false,message:"Address not found"})
        }
        res.status(200).json({success:true,message:"Address deleted successfully"})
    } catch (error) {
        console.error("Error deleting address :".error);
        res.status(500).json({success:false,message:"Error deleting address"})
        
    }
}


///updating the address which is already in the address
const updateAddress = async (req, res) => {
    const addressId = req.params.id;
    const { houseName, country, state, city, district, pincode } = req.body

    try {
        const updatedAddress = await Address.findByIdAndUpdate(addressId,{
            housename: houseName,
            country,
            state,
            city,
            district,
            pincode,
        },{new:true});
        
        if(!updatedAddress){
            return res.status(404).json({success:false,message:"Address not found"})
        }
        res.status(200).json({success:true,message:"Address updated successfully"})
    } catch (error) {
        console.error("Error updating address :".error);
        res.status(500).json({success:false,message:"Error updating address"})
    }
}



//laodingthe change password page
const loadChangePassword = async(req,res)=>{
    try {
        res.render('user/changepassword')
    } catch (error) {
        console.error("Error loading change password page :",error)
        res.status(500).send("Error loading change password page. Please try again.")  
    }
}


//for changing the password on the account page
const changePassword = async(req,res)=>{
    const {currentpassword,password,conpassword}=req.body;
    const {email} = req.session.userData

    try {
        const user = await User.findOne({email:email});
        if(!user){
            console.error("User not found");
            return res.status(404).json({success:false,message:"User not found"});
        }
        const isPasswordValid = await bcrypt.compare(currentpassword,user.password)
        if(!isPasswordValid){
            console.error('Current password is incorrect')
            return res.status(400).json({success:false,message:"Current password is incorrect"})
        }
        if(password!=conpassword){
            console.error("Password and confirm password do not match");
            return res.status(400).json({success:false,message:"Password and confirm password do not match"})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const updatedUser = await User.findOneAndUpdate({email:email},{$set:{password:hashedPassword}},{new:true});
        if(!updatedUser){
            console.error("Error updating user profile :",error)
            return res.status(500).json({success:false,message:"error updating user profile"})
        }
        return res.status(200).json({success:true,message:"Password updated successfully"})


    } catch (error) {
        console.error("Error changing password :",error)
        return res.status(500).json({success:false,message:"Error changing password. Please try again."})  
    }
}

 

//UPDATING USER NAME AND PHONE NUMBER
const updateProfile=async(req,res)=>{

    const {username,phone} = req.body
    if(!req.session|| !req.session.userData){
        console.error("session or userDara is undefined");
        return res.status(401).send("Session Expired. Please try again")
    }

   const {email} = req.session.userData

   try {

   const user = await User.findOneAndUpdate({email:email},{$set:{name:username,phone:phone}},{new:true});

   if(!user){
    console.error("Error updating user profile :",error)
    return res.status(500).json({success:false,message:"error updating user profile"})
   }

   req.session.userData.name = user.name;
   req.session.userData.phone = user.phone;
   
    
    
    return res.status(200).json({success:true,message:"User profile updated successfully"})
    } catch (error) {
        console.error("Error updating user profile :",error)
        return res.status(500).json({success:false,message:"Error updating user profile. Please try again."})
        
    }
}

/////////////////////////MY ACCOUNT END//////////////////////////////////



//loading the shop page with isdeleted false products
const loadShop = async (req,res)=>{
    try {
        const product = await Product.find({isDeleted: false})

        res.render('user/shop',{product})
    } catch (error) {
        console.error("Error loading shop :",error);
        res.status(500).send("Error loading shop. Please try again.")
    }
}



//loading the products detail page 
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






//laoding the cart page
const loadCart = async (req, res) => {
    
    try {
      const userId = req.session.userData.id; // Assuming user ID is in the session
      
      
      const cart = await Cart.findOne({ userId }).populate('items.productId'); // Populate product details
      
     
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.render('user/cart',{cart:{items:[]},Total:0,shipping:0,subtotal:0});
      }
  
      // Access the items array from the cart
      const items = cart.items;
      console.log(items);
      
      // Make sure items is defined and an array
      if (items && Array.isArray(items)) {
        // Calculate the total price
        let total = 0;
        items.forEach(item => {
          total += item.productId.price * item.quantity; // Calculate total for each item
        });
        
        let subtotal = 0;
        items.forEach(item=>{
            subtotal += item.productId.price * item.quantity
        })

        let shipping = 0;
      if (subtotal >= 0 && subtotal <= 1000) {
        shipping = 100;
      } else if (subtotal >= 1001 && subtotal <= 3000) {
        shipping = 150;
      } else if (subtotal >= 3001 && subtotal <= 5000) {
        shipping = 200;
      } else if (subtotal >= 5001 && subtotal <= 50000) {
        shipping = 200;
      } else {
        shipping = 0; // Free shipping for orders above ₹50,000
      }

        let Total = subtotal + shipping;
        


        // Pass both the cart and the total to the view
        res.render('user/cart', { cart, total,subtotal,shipping,Total });
      } else {
        throw new Error('Items array is not defined or is not an array');
      }
    } catch (error) {
      console.error('Error loading cart:', error); // Log the full error
      res.status(500).json({ success: false, message: 'Something went wrong while loading the cart', error: error.message });
    }
  };
  
    


  //adding products to the cart page
const addToCart = async (req,res)=>{

    if(!req.session || !req.session.userData){
        return res.status(401).json({success:false,message:"User not logged in"});
    }


    const productId = req.params.id
    const {quantity}=req.body;
    const userId = req.session.userData.id
    
    
    try {
        
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({success:false,message:"Product not found"});
        }

        if(product.stock < quantity){
            return res.status(400).json({success:false,message:"Insufficient stock"})
        }

        

        let cart = await Cart.findOne({userId});

        if(!cart){
            cart = new Cart({userId,items:[]});
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString()===productId);
        if(itemIndex >= 0){
            cart.items[itemIndex].quantity += Number(quantity);
        }else{
            cart.items.push({
                productId: productId,
                quantity: quantity
            })
        }

        await cart.save();

        product.stock -=parseInt(quantity,10)
        await product.save();


        res.status(200).json({success:true,message:"Product added to cart successfully"})
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"Something went wrong while adding to cart"})
    }
  }
    


  //removing the products from the cart page
const removeCart = async (req,res)=>{
    const productId = req.params.id;
    const userId = req.session.userData.id

    console.log(productId)
    try {
        await Cart.updateOne({userId:userId},{$pull:{items:{productId:productId}}});

        res.status(200).json({success:true,message:"Product removed from cart successfully."});
    } catch (error) {
        console.error('Error removing item from cart:',error);
        res.status(500).json({success:false,message:"Error occured while removing item from cart"})
    }
  }



  //loading the checkout page
const loadCheckout = async(req,res)=>{
    try {
    const userId = req.session.userData.id
    
    const addresses = await Address.find({userId: userId})
    const cart = await Cart.findOne({userId: userId}).populate('items.productId')
        
   let subtotal = 0 ;
   cart.items.forEach(item=>{
    subtotal += item.productId.price * item.quantity 
   });

   let shipping = 0;
        if (subtotal >= 0 && subtotal <= 1000) {
            shipping = 100;
        } else if (subtotal >= 1001 && subtotal <= 3000) {
            shipping = 150;
        } else if (subtotal >= 3001 && subtotal <= 5000) {
            shipping = 200;
        } else if (subtotal >= 5001 && subtotal <= 10000) {
            shipping = 200;
        } else {
            shipping = 0; 
        }

        const total = req.session.discountedTotal || subtotal+shipping

        

        res.render('user/checkout',{addresses,products:cart.items,subtotal,shipping,total})
    

    } catch (error) {
        console.error("Error loading checkout page :",error)
        res.status(500).send("Error loading checkout page. Please try again.")
        
    }
}


//placing the order from checkout page
const placeOrder = async (req,res)=>{
    const userId = req.session.userData.id
    const {selectedAddress,paymentMethod,total,orderItems}=req.body;
    
    try {
        if(!selectedAddress || !paymentMethod){
            return res.status(400).json({success:false,message:"Please select address and payment method"})
        }
        const address = await Address.findById(selectedAddress)

        if(!address){
            return res.status(404).json({success:false,message:"Selected address not found"})
        }

        if(paymentMethod == 'UPI'){
            return res.status(400).json({success:false,message:"Only COD payments are allowed"})
        }

        for(const item of orderItems){
            const product = await Product.findById(item.productId)
        
      
        

            
            if(!product){
                return res.status(404).json({success:false,message:"Product not found"})
            }
            if(product.stock < item.quantity){
                return res.status(400).json({success:false,message:"Insufficient stock for products"})
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const newOrder = new Order({
            userId : req.session.userData.id,
            addressId : selectedAddress,
            paymentMethod:paymentMethod,
            totalAmount:total,
            orderItems: orderItems,
            paymentStatus:'Pending',
            status:'Pending',
        });

        await newOrder.save();

        await Cart.deleteOne({userId});

        req.session.discountedTotal = null;

        res.status(200).json({success:true,message:"Order placed successfully",order:newOrder})
    } catch (error) {
        console.error("Error placing order",error);
        res.status(500).json({success:false,message:"Something went Wrong"})
    }
}

const orderSuccess = async(req,res)=>{
    try {
        res.render('user/success')
    } catch (error) {
        console.error("Error creating order",error);
    }
}

const razorPay = async(req,res)=>{
    const {total,orderItems} = req.body;
    try {
        const options = {
            amount:total*100,
            currency:"INR",
            receipt:"order_receipt_"+new Date().getTime(),
            payment_capture: 1,
            notes:{orderItems: JSON.stringify(orderItems)},
        }

        const response = await instance.orders.create(options);
        if(response){
            return res.status(200).json({success:true,orderId:response.id,orderItems})
        }else{
            return res.status(500).json({success:false,message:"Unable to create Razorpay order"})
        }
    } catch (error) {
        console.error("Error creating Razorpay order",error);
        return res.status(500).json({success:false,message:"Something went wrong"})
    }
}

const payNow = async(req,res)=>{
    const {orderId} = req.params
    
    try {
        const order = await Order.findById({_id:orderId})
        if(!order){
            return res.status(404).json({success:false,message:"Order not found"})
        }
       
        const options={
            amount:order.totalAmount*100,
            receipt:"order_receipt_"+ new Date().getTime()
        }

        const razorpayOrder = await instance.orders.create(options);
        order.razorpay.orderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success:true,
            razorpayKey:process.env.RAZORPAY_KEY_ID,
            amount:order.totalAmount*100,
            razorpayOrderId:razorpayOrder.id,
            message:"New razorpay order created successfully for retry payement"
        })
        
    } catch (error) {
        console.error("Error in retry payment",error);
        return res.status(500).json({success:false,message:"Failed to fetch payment details"})
    }
}

const verifyPayment = async (req, res) => {
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature,orderId} = req.body;
    const keySecret = process.env.RAZORPAY_SECRET_KEY;

    console.log(razorpay_payment_id,razorpay_order_id,razorpay_signature,orderId);
    
    try {
        if(!razorpay_order_id || !razorpay_order_id || !razorpay_signature || !orderId){
            return res.status(400).json({success:false,message:"Missing required fields"});
        }
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Find the order and update payment status to Completed
            const order = await Order.findById({_id:orderId});
            if (order) {
                order.paymentStatus = "Completed";
                order.razorpay = {
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    signature:razorpay_signature,
                };
                await order.save();

                const cart = await Cart.findOneAndDelete({userId:order.userId});

                req.session.discountedTotal = null;
                
                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully"
                });
            } else {
                return res.status(404).json({ success: false, message: "Order not found" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};


const saveOrder = async(req,res)=>{
    const userId = req.session.userData.id;
    const {selectedAddress,paymentMethod,total,orderItems} = req.body;

    try {
        const address = await Address.findById(selectedAddress);
        if(!address){
            return res.status(404).json({success:false,message:"Selected address not found"})
        }
        let razorpayOrderId = null;
        if(paymentMethod === 'Razorpay'){
            const options = {
                amount:total * 100,
                currency:"INR",
                receipt:"order_receipt_"+ new Date().getTime(),
             
            };
            
            const razorpayOrder = await instance.orders.create(options);
            razorpayOrderId = razorpayOrder.id  
        }

        const newOrder = new Order({
            userId,
            addressId:selectedAddress,
            paymentMethod,
            totalAmount:total,
            orderItems,
            paymentStatus:"Pending",
            razorpay:{orderId:razorpayOrderId},
            status:"Pending"
        });

        await newOrder.save();
        await Cart.findOneAndDelete({userId:userId})
        

        res.status(200).json({success:true,message:"Order placed successfully",order:newOrder})
    } catch (error) {
        console.error("Error saving order:",error);
        res.status(500).json({success:false,message:"Something went wrong while saving the order"})
    }
}

const returnOrder = async (req,res)=>{
    const orderId = req.params.orderId;
    const reason = req.body.reason
    try {
        console.log(orderId)
        const order =  await Order.findOne({_id: orderId})
        if(!order){
            return res.status(404).json({success:false,message:"Order not found"})
        }
        if(order.status === "Returned"){
            return res.status(400).json({success:false,message:"This order is not eligible for returning"})
        }

        order.status = 'Requested',
        order.isRefund = true,
        order.refundStatus = 'Requested',
        order.refundReason = reason;

        await order.save();

        res.status(200).json({success:true,message:"Order return request has been submitted successfully"})
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"Something went wring while requesting return for order"})
    }
}
const downloadInvoice = async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findOne({ _id: orderId })
            .populate('orderItems.productId')
            .populate('userId')
            .populate('addressId');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

        doc.pipe(res);

   
        doc.fontSize(20).text('Invoice', { align: 'center', underline: true });
        doc.moveDown();

        
        const boxX = 50;
        const boxY = 100;
        const boxWidth = 500;
        const boxHeight = 500;
        doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

        const contentStartY = boxY + 10;

        const fullAddress = `${order.addressId.housename},
        ${order.addressId.city},
        ${order.addressId.district},
        ${order.addressId.state},
        ${order.addressId.country} - ${order.addressId.pincode}`;

        
        doc.fontSize(12).text(`Order ID: ${order._id}`, boxX + 10, contentStartY);
        doc.text(`Customer Name: ${order.userId.name}`);
        doc.text('Address:');
        doc.text(fullAddress,{indent:10});
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.moveDown();

        
        doc.fontSize(14).text('Order Items:', { underline: true });
        doc.moveDown(0.5);

        
        const itemsStartY = doc.y;
        let rowY = itemsStartY;

        doc.fontSize(12).text('S.No', boxX + 10, rowY, { width: 50, align: 'center' });
        doc.text('Product Name', boxX + 70, rowY, { width: 200, align: 'left' });
        doc.text('Quantity', boxX + 280, rowY, { width: 100, align: 'center' });
        doc.text('Price (Rs.)', boxX + 380, rowY, { width: 100, align: 'right' });

        doc.moveDown(0.5);
        rowY += 20;

        order.orderItems.forEach((item, index) => {
            doc.text(index + 1, boxX + 10, rowY, { width: 50, align: 'center' });
            doc.text(item.productId.name, boxX + 70, rowY, { width: 200, align: 'left' });
            doc.text(item.quantity, boxX + 280, rowY, { width: 100, align: 'center' });
            doc.text(`₹${item.productId.price}`, boxX + 380, rowY, { width: 100, align: 'right' });

            rowY += 20;
        });

        doc.moveDown();
        
        const totalY = rowY + 20;
        if (totalY > boxY + boxHeight - 30) {
            rowY = boxY + boxHeight - 40; 
        }

        
        const totalX = boxX + boxWidth - 300; 
        doc.fontSize(16).text(`Total: Rs.${order.totalAmount}`, totalX, rowY, { align: 'right' });

        
        doc.end();


    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ success: false, message: "Failed to generate invoice" });
    }
};


//filtering the products in shop page
const filter = async (req, res) => {
    const { category, priceOrder, alphabetOrder } = req.query;

    let query = {}; // Filtering criteria
    let sort = {}; // Sorting criteria

    // Filter by category
    if (category && category !== 'all') {
        query.category = category;
    }

    // Add sorting for price if specified
    if (priceOrder) {
        sort.price = priceOrder === 'low-to-high' ? 1 : -1;
    }

    // Add sorting for alphabet if specified
    if (alphabetOrder) {
        sort.name = alphabetOrder === 'Aa-Zz' ? 1 : -1;
    }

    try {
        // Fetch products with applied filters and sorting
        const products = await Product.find(query)
            .sort(sort)
            .collation({ locale: 'en', strength: 2 }) // Case-insensitive sorting
            .exec();

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


//load wishlist page
const loadWishlist = async (req,res)=>{
    const userId = req.session.userData?.id
    try{
        const wishlistData= await Wishlist.findOne({userId}).populate('products.productId')

        const wishlist = wishlistData ? wishlistData.products.map(item => ({
            id: item.productId._id,
            name:item.productId.name,
            price:item.productId.price,
            stock:item.productId.stock,
            image:item.productId.image[0],
        })) : [];
        res.render('user/wishlist',{wishlist})
    }catch(error){
        console.error('Error fetching wishlist:', error);
        res.status(500).send('Error fetching wishlist')
    }
}

//product adding to wishlist
const addToWishlist = async(req,res)=>{

    if(!req.session || !req.session.userData){
        return res.status(401).json({success:false,message:"User not logged in"})
    }
    const {productId} = req.body
    const userId = req.session.userData?.id
    
    

    if(!userId){
        return res.status(400).json({success:false,message:"user not logged in"})
    }

    if(!productId){
        return res.status(400).json({success:false,message:"Product Id is required"})
    }
    
    try {
        const existingItem = await Wishlist.findOne({userId:userId,'products.productId':productId})

        if(existingItem){
            return res.status(400).json({success:false,message:"Product is already in your wishlist"})
        }
 
        const newItem = await Wishlist.findOneAndUpdate(
            {userId:userId},
            {$push:{products:{productId:productId}}},
            {new:true,upsert:true}
        )

        res.status(200).json({success:true,message:"Product added to wishlist successfully"})

    } catch (error) {
        console.error('Error adding to wishlist',error);
        res.status(500).json({success:false,message:"server error please try again later"})
    }
}

//product removing from wishlist
const removeWishlist = async(req,res)=>{
    const itemId = req.body.id;
    const userId = req.session.userData?.id;
    try {
        if(!userId){
            return res.status(400).json({success:false,message:"User not logged in"})   
        }
       const userWishlist = await Wishlist.findOne({userId:userId})
       console.log(userWishlist)

       if(!userWishlist){
        return res.status(404).json({success:false,message:"User wishlist not found"})
       }

       const updatedWishlist = await Wishlist.findOneAndUpdate(
        {userId:userId},
        {$pull:{products:{productId:itemId}}},
        {new:true}
       );

       if(!updatedWishlist){
        return res.status(404).json({success:false,message:'Failed to remove item from wishlist'})
       }

       return res.status(200).json({success:true,message:"Item removed from wishlist successfully"})

    } catch (error) {
        console.error("Error while removing item from wishlist",error);
        res.status(500).json({success:false,message:"An error occured while removing item form wishlist"});
        
    }

}

//add product to cart from wishlist
const wishlistCart = async (req,res)=>{
    const productId = req.params.productId;
    const userId = req.session.userData?.id;
    
    try{
        if(!userId){
            return res.status(404).json({success:false,message:"User not logged in"})
        }
        const userCart = await Cart.findOne({userId})
        
        if(userCart){
            const cartItem =userCart.items.find(item => item.productId.toString() === productId);
            if(cartItem){
                return res.status(400).json({success:false,message:"Product already exist in Cart"})
            }
            userCart.items.push({productId,quantity:1});
            await userCart.save()
        }else{
            await Cart.create({
                userId,
                items:[{productId,quantity:1}]
            })
        }

        await Wishlist.updateOne(
            {
                userId:userId,
                'products.productId':productId
            },{$pull:{products:{productId:productId}}}
        )
        return res.status(200).json({success:true,message:"Product added to cart successfully"})
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:"An error occurred while adding product to cart"})

    }
}

//applying coupon on cart page for discount
const applyCoupon = async(req,res) =>{
    const {couponCode} = req.body;
    userId = req.session.userData?.id;
    console.log(couponCode)
    try {
        const coupon = await Coupon.findOne({couponCode})
        if(!coupon){
            return res.status(400).json({success:false,message:"The coupon code is not valid !"})
        }
        if(!coupon.status || coupon.isDeleted){
            return res.status(400).json({success:false,message:"The coupon is expired or deleted"})
        }
        const currentDate = new Date();
        if (currentDate < new Date(coupon.validFrom) || currentDate > new Date(coupon.validUpto)) {
            return res.status(400).json({ success: false, message: "The coupon code has expired or is not yet valid." });
        }
        if (coupon.couponCount <= 0) {
            return res.status(400).json({ success: false, message: "The coupon code has been used up." });
        }

        const cart = await Cart.findOne({userId:userId}).populate('items.productId')
        if(!cart){
            return res.status(400).json({success:false,message:"Cart not found"})
        }
        const total = cart.items.reduce((acc,item) => acc + (item.productId.price * item.quantity), 0);
        if (total < coupon.minPrice) {
            return res.status(400).json({ success: false, message: "The  total amount is less than the minimum amount required for this coupon." });
        }

         // Calculate shipping based on total
         let shipping = 0;
         if (total >= 0 && total <= 1000) {
             shipping = 100;
         } else if (total >= 1001 && total <= 3000) {
             shipping = 150;
         } else if (total >= 3001 && total <= 5000) {
             shipping = 200;
         } else if (total >= 5001 && total <= 10000) {
             shipping = 200;
         } else {
             shipping = 0;
         }


        const discount = (total * (coupon.discountPercentage || 0)) / 100;
        const discountedTotal = total - discount + shipping



        
        
        await Coupon.updateOne({_id:coupon._id},{$inc:{couponCount:-1}})
        req.session.discountedTotal = discountedTotal
        console.log("descountedTotal now:",req.session.discountedTotal)

        return res.status(200).json({
            success:true,
            message:"Coupon applied successfully",
            discountedTotal:discountedTotal,
            discount:discount   
        })

    } catch (error) {
        console.error("Error applying coupon:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while applying the coupon."
        });
    }
}

//removing applied coupon 
const removeCoupon = async (req,res)=>{
    try {
    const userId = req.session.userData?.id
        
    const cart = await Cart.findOne({userId}).populate('items.productId')
    if(!cart){
        return res.status(400).json({success:false,message:"Cart not found"})
    }
    const total = cart.items.reduce((acc,item)=>acc+(item.productId.price * item.quantity),0);
    let shipping = 0;
        if (total >= 0 && total <= 1000) {
            shipping = 100;
        } else if (total >= 1001 && total <= 3000) {
            shipping = 150;
        } else if (total >= 3001 && total <= 5000) {
            shipping = 200;
        } else if (total >= 5001 && total <= 10000) {
            shipping = 200;
        } else {
            shipping = 0;
        }

        

        req.session.discountedTotal = null;

        return res.status(200).json({
            success: true,
            message: "Coupon removed successfully",
            subtotal:total,
            shipping,
            discount:0,
            total:total+shipping
        })
    } catch (error) {
        console.error("Error removing coupon:",error)
        return res.status(500).json({
            success:false,
            message: "An error occurred while removing the coupon."
        })
    }
}


//logging out the user
const logout =(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error("Failed to destroy session",err);
            return res.status(500).send('Failed to Logout')
        }
        res.redirect('/home')
    })
}



module.exports ={
loadSignup,
loadVerify,
sentOTP,
verifyOtp,
resendOTP,
loadHome,
loadShop,
loadItemDetails,
loadAbout,
loadContact,
loadLogin,
Login,
loadProfile,
loadOrders,
loadUpdateProfile,
loadWallet,
loadAddress,
loadChangePassword,
updateProfile,
changePassword,
addaddress,
deleteAddress,
updateAddress,
loadCart,
addToCart,
removeCart,
loadCheckout,
placeOrder,
viewOrder,
cancelOrder,
logout,
filter,
loadWishlist,
addToWishlist,
removeWishlist,
wishlistCart,
applyCoupon,
removeCoupon,
razorPay,
verifyPayment,
saveOrder,
returnOrder,
orderSuccess,
downloadInvoice,
payNow,
}