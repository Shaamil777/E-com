const Order =  require('../models/orderModel')
const User = require('../models/userModel')
const Wallet = require('../models/walletModel')


const loadOrderManagement = async(req,res)=>{
    const page = parseInt(req.query.page)||1;
    const limit = 5;
    try {
        const totalOrders = await Order.countDocuments({})
        const orders = await Order.find().populate('userId').skip((page-1)*limit).limit(limit);
        
    
       res.render('admin/orderManagement',{orders: orders,
        currentPage:page,
        totalPages:Math.ceil(totalOrders / limit),
        limit:limit
       }) 
    } catch (error) {
        console.error("Error occcured while loading order management",error);
   
    }
}


const viewOrder = async (req, res) => {
    const orderId = req.params.orderId;

    try {
        // Find order by ID and populate related fields
        const order = await Order.findById(orderId)
            .populate('userId')
            .populate('addressId')
            .populate('orderItems.productId')
            .exec();

        

        // Check if the order exists
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Render the order details page
        res.render('admin/viewOrder', { order: order });
    } catch (error) {
        console.error('Error occurred while loading order details:', error);  // Log the error
        res.status(500).send('Server error');
    }
};


const updateStatus = async(req,res)=>{
    const orderId = req.params.orderId;
    const newStatus = req.body.status
    try {
        const updateOrder = await Order.findByIdAndUpdate(orderId,{status:newStatus},{new:true});

        if(!updateOrder) {
            return res.status(404).json({success:false,message:"Order not found"})
        }

        res.status(200).json({success:true,message:"Order status updated successfully"})
    } catch (error) {
        console.error('Error updating order status',error);
        res.status(500).json({success:false,message:"Error occured while updating order status"})
    }
}

const returnRequest = async(req,res)=>{
    const orderId = req.params.orderId;
    const action = req.body.action;
    try {
       
        const order = await Order.findOne({_id:orderId})
        if(!order){
            return res.status(404).json({success:false,message:"Order not found"})
        }


        let wallet = await Wallet.findOne({userId:order.userId});

        if(!wallet && action === 'approve'){
            wallet = new Wallet({
                userId:order.userId,
                balance:0,
                transactions:[],
            })
        }

        if(action === 'approve'){
            order.refundStatus = 'Approved'
            order.status = 'Returned'

            const refundableAmount = order.totalAmount;
            wallet.balance +=refundableAmount;

            wallet.transactions.push({
                amount:refundableAmount,
                type:'Credit',
                description:`Refund for Order ID : ${orderId}`
            })
            wallet.updatedAt = new Date();

            await wallet.save();

        }else if(action === 'reject'){
            order.refundStatus = 'Rejected'
            order.status = 'Rejected'
        }else{
            return res.status(400).json({success:false,message:"Invalid action"})
        }
        await order.save();

        return res.status(200).json({
            success:true,
            message:`return request ${action} successfully`,
        
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({success:false,message:"Something went wrong while changing return status"})
    }
}

module.exports = {
    loadOrderManagement,
    viewOrder,
    updateStatus,
    returnRequest
}