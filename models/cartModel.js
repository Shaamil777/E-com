const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
    quantity: { type: Number, default: 1 },
    size: { type: Number}
  }]
});

module.exports= mongoose.model('cart', cartSchema);