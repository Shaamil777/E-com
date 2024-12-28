const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    withoutOfferPrice:{type:Number,default:0},
    brand:{ type: String, required: true},
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: [{ type: String}],
    warrenty:{type: String, required: true},
    returnPolicy : { type: String, required: true},
    stock: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now},
    isDeleted: { type: Boolean, default: false },
})

module.exports = mongoose.model('Product', productSchema);