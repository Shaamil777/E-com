const OTP = require('../models/otpModel')
const {sentOtpEmail} = require('../utils/mailSender')

function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function createAndSendOtp(email) {
    

const otp = generateOtp()

const otpInstance = new OTP({email,otp})

try {
    await otpInstance.save()

    await sentOtpEmail(email,otp);
    console.log("OTP created succesfully and verification email sent successfully");
    
} catch (error) {
    console.error("Error occured while generating OTP",error);
    throw error;
}
}

module.exports = {createAndSendOtp}
