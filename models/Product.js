const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    storeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'store'
    },
    description: {
        type: String
    },
    inventory: {
        type: Number,
        default: 0
    },
    soldAmount: {
        type: Number,
        default: 0
    }
    
})

module.exports = mongoose.model('product', ProductSchema);