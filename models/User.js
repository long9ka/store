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
    profileId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'profile'
    },
    roles: {
        type: String,
        lowercase: true,
        enum: ['guess', 'staff', 'manager', 'admin'],
        default: 'guess'
    }
})

module.exports = mongoose.model('user', UserSchema);