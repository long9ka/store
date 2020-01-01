const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
    
    permission:{
        type: String,
        unique: true,
        required: true
    },
    profileId:{
        type: mongoose.SchemaTypes.ObjectId,
        unique: true,
        required: true
    }
})
module.exports = mongoose.model('permission', PermissionSchema);