const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'user'
    },
    message: {
        type: String,
        trim: true,
        maxlength: 100,
        required: true
    },
    request: {
        type: String,
        lowercase: true,
        enum: ['guest', 'staff', 'manager', 'admin'],
        required: true
    },
    status: {
        type: String,
        lowercase: true,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d'
    }
})

module.exports = mongoose.model('role', RoleSchema);