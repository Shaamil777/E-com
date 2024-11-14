const nodemailer = require('nodemailer')
import dotenv from 'dotenv'

dotenv.config()


const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASSWORD
    }
});



const sentOtpEmail = async(email,otp)=>{
    const mailOption={
        from:"shamilm2324@gmail.com",
        to:email,
        subject:"Your Email OTP",
        text:`your OTP code is ${otp}.valid for 5 minutes`
    }

    try {
        await transporter.sendMail(mailOption);
        console.log("mail sent successfully");
        
    } catch (error) {
        console.error("error occured in sending mail")
        throw error
    }
}


module.exports = {sentOtpEmail}

