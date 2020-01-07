const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    date:{
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    turnover: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('amount',StoreSchema);