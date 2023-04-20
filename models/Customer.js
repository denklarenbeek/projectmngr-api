const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        subscription: {
            type: String,
            default: 'Pro'
        },
        primary_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            default: 'Active'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Customer', customerSchema);