const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'profile'
    }
})

module.exports = mongoose.model('user', UserSchema);