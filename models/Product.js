const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productCode:{ 
        type: Number,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    productType: {
        type: String,
        required: true,
        lowercase: true
    },
    storeID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'store'
    },
    importTime: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('product', ProductSchema);