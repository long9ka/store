const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('store',StoreSchema);