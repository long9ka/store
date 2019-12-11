const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'profile'
    },
    roles: [
        {
            type: String,
            lowercase: true,
            enum: ['guest', 'staff', 'manager', 'admin']
        }
    ]
})

module.exports = mongoose.model('user', UserSchema);