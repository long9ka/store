const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportDay: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    inventory: {
        type: Number,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('report', reportSchema);