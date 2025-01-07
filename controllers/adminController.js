const mongoose = require('mongoose')
const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')




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
          req.session.admin = true;
            res.redirect('/admin/dashboard')
        }else{
            res.render('admin/login',{message:"enter valid admin"})
        }
    } catch (error) {
        console.error("Error occured while getting admin:",error)
    }
}

const loadDashboard = async (req, res) => {
    try {
        const order = await Order.find({}).populate('orderItems.productId');
        const total = order.reduce((sum, current) => sum + (current.totalAmount || 0), 0);
        const { type = 'yearly' } = req.query;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        let labels = [];
        let salesData = [];

        const productSales = {};
        order.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.productId && item.productId.name) {
                    const productId = item.productId._id.toString();
                    if (!productSales[productId]) {
                        productSales[productId] = { name: item.productId.name, quantity: 0 };
                    }
                    productSales[productId].quantity += item.quantity;
                }
            });
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        if (type === 'weekly') {
            const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            const orders = await Order.find({
                createdAt: { $gte: startOfWeek, $lt: endOfWeek }
            });

            labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            salesData = Array(7).fill(0);

            orders.forEach(order => {
                const dayIndex = new Date(order.createdAt).getDay();
                salesData[dayIndex]++;
            });
        } else if (type === 'monthly') {
            const startOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentYear, currentDate.getMonth() + 1, 1);

            const orders = await Order.find({
                createdAt: { $gte: startOfMonth, $lt: endOfMonth }
            });

            const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            salesData = Array(daysInMonth).fill(0);

            orders.forEach(order => {
                const day = new Date(order.createdAt).getDate() - 1;
                salesData[day]++;
            });
        } else {
            const startDate = new Date(`${currentYear}-01-01`);
            const endDate = new Date(`${currentYear + 1}-01-01`);

            const orders = await Order.find({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            salesData = Array(12).fill(0);

            orders.forEach(order => {
                const monthIndex = new Date(order.createdAt).getMonth();
                salesData[monthIndex]++;
            });
        }

        // Check if the request expects JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ labels, salesData });
        }

        const users = await User.find({});
        const product = await Product.find({});

    

        res.render('admin/dashboard', {
            type,
            labels,
            order,
            total,
            product,
            users,
            salesData,
            year: currentYear,
            topProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

const loadUserManagement = async(req,res)=>{
    try {
        const user = await User.find({role:'user'})
        if(!user){
           return res.render('admin/userManagement',{message:"No users found"})
        }else{
            return res.render('admin/userManagement',{users:user})
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


const loadSalesReport = async(req,res)=>{
    try{
        const now = new Date();
        const startDate = new Date(now.getFullYear(),now.getMonth(),1);
        const endDate = new Date(now.getFullYear(),now.getMonth()+1,0);
        const orders = await Order.find({
            createdAt:{$gte: startDate , $lte:endDate},
        }).populate('userId','name')

        const totalSaleAmount = orders.reduce((sum,order) => sum+order.totalAmount,0)
        res.render('admin/salesReport',{
            totalSaleAmount,
            orders:orders.map((order)=>({
                orderId:order._id,
                userId:order.userId._id,
                customerName:order.userId.name,
                saleAmount:order.totalAmount,
                orderDate:order.createdAt,
            }))
    })
    }catch(error){
        console.error('Error loading sales report',error);
        res.status(500).json({message:'Internal server error'})
    }
}


const reportData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Ensure start is at midnight
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Ensure end is at the last millisecond of the day

        if (start > end) {
            return res.status(400).json({ success: false, message: "Start date should be less than end date" });
        }

        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end }, // Query orders within the date range
        }).populate('userId', 'name');

        const totalSaleAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return res.status(200).json({
            success: true,
            totalSaleAmount,
            orders: orders.map((order) => ({
                orderId: order._id,
                userId: order.userId._id,
                customerName: order.userId.name,
                saleAmount: order.totalAmount,
                orderDate: order.createdAt,
            })),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Error occurred while fetching the sales report" });
    }
};

const logout = (req,res)=>{
    req.session.admin = null;
    res.redirect('/admin/login');
}

module.exports = {
    loadUserManagement,
    loadAdminLogin,
    loginForm,
    loadDashboard,
    userBan,
    userView,
    loadSalesReport,
    reportData,
    logout
}