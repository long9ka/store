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
    role: {
        type: String,
        lowercase: true,
        enum: ['guest', 'staff', 'manager', 'admin'],
        default: 'guest'
    },
    profile: {
        name: {
            type: String,
            trim: true,
            required: true
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
            required: true
        },
        birthday: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            lowercase: true,
            trim: true,
            enum: ['male', 'female'],
            required: true
        }
    }
})

module.exports = mongoose.model('user', UserSchema);