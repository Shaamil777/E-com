const mongoose = require('mongoose')


const orderSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "address"
    },
    totalAmount:{
        type: Number,
        required:true
    },
    orderItems:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity:{
                type: Number,
                required: true
            },
            price:{
                type: Number,
            }
        }
    ],
    status:{
        type: String,
        enum: ['Pending', 'Cancelled', 'Completed','Requested','Returned','Rejected'],
        default: 'Pending'
    },
    paymentMethod:{
        type: String,
        enum: ['COD', 'Online Payment','Razorpay'],
        default: 'COD'
    },
    isRefund: {
        type: Boolean,
        default: false
    },
    refundStatus: {
        type: String,
        enum: ['Requested', 'Approved', 'Rejected'],
    },
    refundReason: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    razorpay: {
        orderId: { type: String },
        paymentId: { type: String },
        signature: { type: String },
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model("Orders",orderSchema)