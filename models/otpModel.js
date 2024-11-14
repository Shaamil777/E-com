const mongoose = require('mongoose')
const mailSender = require('../utils/mailSender')

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp :{
        type : Number,
        required :true
    },
    createdAt :{
        type : Date,
        default :Date.now,
        expires : 60*5   
    },
})

module.exports = mongoose.model('OTP',otpSchema)