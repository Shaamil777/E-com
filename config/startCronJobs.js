const cron = require('node-cron');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Offer = require('../models/offerModel')
const moment = require('moment-timezone');

const startCronJobs = () => {
    cron.schedule('0 0 * * *',async () => {
        try {
            console.log("Cron Job Started: Checking expired offers...");
            
            const currentTimeIST = moment().tz('Asia/Kolkata').toDate();
            console.log("Current Time in ISt: " + currentTimeIST);
            
            const expiredOffers = await Offer.find({expireAt:{$lte:currentTimeIST}});
            console.log("expiredOffers:",expiredOffers)

            for(const offer of expiredOffers) {
                await Offer.findByIdAndDelete(offer._id);

                const products = await Product.find({category:offer.category});
               
                for(const product of products){
                    if(product.withoutOfferPrice){
                        product.price = product.withoutOfferPrice;
                        product.withoutOfferPrice = undefined;
                        await product.save();
                    }
                }
        
                await Category.updateOne({name:offer.category},{$set:{isOfferApplied:false}});
            }
            console.log('Expired offer removed successfully');
        } catch (error) {
            console.error("Error during cron job",error);
        }
    })
}

module.exports = startCronJobs;