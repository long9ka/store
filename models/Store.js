const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        lowercase: true,
    },
    importDay: {
        type: Date,
        required: true
    },
    report: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'report'
    }
})

module.exports = mongoose.model('store', storeSchema);