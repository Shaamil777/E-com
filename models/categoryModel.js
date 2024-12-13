const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true,unique:true },
    image : {type:String,required:true},
    description :{type:String},
    productCount:{type:Number},
    createdAt : { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now },
    isDeleted : { type: Boolean, default: false },
});

module.exports = mongoose.model('Category', categorySchema);