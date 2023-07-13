const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    }, 
    name: {
        type: String,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    reset_token: {
        type: String,
        default: null
    }, 
    reset_token_expiring: {
        type: String,
        default: null
    },
    inviteExpireDate: {
        type: Number
    },
    inviteToken: {
        type: String
    },
    roles: [{
        type: String,
        default: "User"
    }],
    status: {
        type: String,
        default: 'Active'
    },
    picture: {
        type: String,
    },
    color: {
        type: String,
        default: '#BC4830'
    }
});

module.exports = mongoose.model('User', userSchema);