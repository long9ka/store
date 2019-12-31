const mongoose = require('mongoose');

const amountSchema = new mongoose.Schema({
    productID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'product'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    soldAmount: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('amount', amountSchema);