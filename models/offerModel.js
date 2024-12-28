const mongoose = require('mongoose');

const offerModel = new mongoose.Schema({
    category:{type:String,required:true},
    startDate:{type:Date,required:true},
    endDate:{type:Date,required:true},
    discountPercentage:{type:Number,required:true},
    expireAt:{type:Date,required:true},
});

offerModel.index({expireAt:1},{expireAfterSeconds:0});

module.exports = mongoose.model('Offer', offerModel);