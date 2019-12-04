const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        unique: true,
        required: true
    },
    message: {
        type: String,
        trim: true,
        maxlength: 100,
        required: true
    },
    currentRoles: [
        {
            type: String,
            lowercase: true,
            enum: ['guess', 'staff', 'manager', 'admin']
        }
    ],
    upgradeTo: {
        type: String,
        lowercase: true,
        enum: ['guess', 'staff', 'manager', 'admin'],
        required: true
    },
    status: {
        type: String,
        lowercase: true,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    }
})

module.exports = mongoose.model('role', RoleSchema);