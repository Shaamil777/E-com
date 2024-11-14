const mongoose = require('mongoose')
const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Category = require('../models/categoryModel')




const loadAdminLogin = (req,res)=>{
    res.render('admin/login',{message:null})
}


const loginForm = async (req,res)=>{
    const {email,password} = req.body;
    console.log(email);
    console.log(password);
    
    try {
        const admin =await User.findOne({email:email,password:password,role:"admin"})
        if(admin){
            console.log("heyyyyyy");
            
            res.redirect('/admin/dashboard')
        }else{
            res.render('admin/login',{message:"enter valid admin"})
        }
    } catch (error) {
        console.error("Error occured while getting admin:",error)
    }
}


const loadDashboard = (req,res)=>{
    res.render('admin/dashboard')
}


const loadUserManagement = async(req,res)=>{
    try {
        const user = await User.find({role:'user'})
        if(!user){
           return res.render('admin/userManagement',{message:"No users found"})
        }else{
            return res.render('admin/usermanagement',{users:user})
        }  
    } catch (error) {
        console.error("Error while loading users:",error)

    }
}


const userBan = async(req,res)=>{
    try {
        const email = req.query.email;
        

        const user = await User.findOne({email: email});

        if(!user){
            return res.status(404).json({message:"user not found"})
        }

        user.isDeleted =!user.isDeleted;
        await user.save();

        const status = user.isDeleted?'Banned':'unbanned';

        return res.status(200).json({message:`user ${status} successfully`,isDeleted:user.isDeleted});
    } catch (error) {
        console.error("Error in banning/unbanning user:",error)
        res.status(500).json({message:"Internal Server Error"})
         }
    }

    
    const userView = async(req,res)=>{
        try {
            const email = req.query.email;
            const user = await User.findOne({email: email});

            if(!user){
                return res.status(404).json({mesaage:'user not found'})
            }
            return res.status(200).json(user)
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:'server error'});
        }
    }




module.exports = {
    loadUserManagement,
    loadAdminLogin,
    loginForm,
    loadDashboard,
    userBan,
    userView,
}