const { response } = require('express');
const Coupon =  require('../models/couponModel')

const loadCouponManagement = async(req,res)=>{
    try {
        const coupons = await Coupon.find();
        res.render('admin/couponManagement',{coupons})
    } catch (error) {
        console.error("Error loading coupon management page :",error)
        res.status(500).send("Error loading coupon management page. Please try again.") 
    }
}

const loadAddCoupon = async(req,res)=>{
    try {
        res.render('admin/addCoupon')
    } catch (error) {
        console.error("Error loading add coupon page :",error)
    }
}

const addCoupon = async (req,res)=>{
    const {couponCode,validFrom,validTo,discount,minPrice,maxDisc,count} = req.body
    try {
        const newCoupon = new Coupon({
            couponCode,
            validFrom,
            validUpto: validTo,
            discountPercentage: discount,
            minPrice,
            maxDiscount: maxDisc,
            couponCount: count
        })

        await newCoupon.save();

        return res.status(200).json({success:true,message:"Coupon Added successfully"})
    } catch (error) {
        console.error('Error while adding coupon:',error);
        return res.status(500).json({success:false,message:'Error while adding coupon'})
    }
}

const deleteCoupon = async(req,res)=>{
    const {couponId} = req.body
    try {
       const coupon = await Coupon.findByIdAndDelete(couponId) 
       if(!coupon){
        return res.status(404).json({success:false,message:"Coupon not found"})
       }
       return res.status(200).json({success:true,message:"Coupon deleted successfully"})
    } catch (error) {
        console.error('Error occured while deleting coupon')
    }
}

const loadUpdateCoupon = async(req,res)=>{
    const couponId = req.params.couponId
    try {
        const coupon = await Coupon.findById(couponId);
        if(!coupon){
            return res.redirect('/admin/couponmanagement')
        }
        res.render('admin/updateCoupon',{coupon})
    } catch (error) {
        console.error('Error while loading update coupon page:',error)
    }
}

const updateCoupon = async(req,res)=>{
    const {couponId,validFrom,validUpto,minPrice,discountPercentage,maxDiscount,count} = req.body;
    try {
        const coupon = await Coupon.findByIdAndUpdate(couponId,{$set:{
            validFrom,
            validUpto,
            minPrice,
            discountPercentage,
            maxDiscount,
            couponCount:count
        }},{new:true})

        if(!coupon){
            return res.status(404).json({success:false,message:'Coupon not found'})
        }
        return res.status(200).json({success:true,message:'Coupon updated successfully'})
    } catch (error) {
        console.error('Error while updating coupon:',error)
        return res.status(500).json({success:false,message:'Error while updating coupon'})  
    }
}

module.exports = {
    loadCouponManagement,
    loadAddCoupon,
    addCoupon,
    deleteCoupon,
    loadUpdateCoupon,
    updateCoupon
}