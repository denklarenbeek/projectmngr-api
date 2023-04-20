const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },
        quantity: {
            type: Number
        },
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        start_date: {
            type: Date,
            required: true
        },
        end_date: {
            type: Date
        },
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User"
        },
        title: {
            type: String
        },
        color: {
            type: String
        }
    },    
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Activity', activitySchema);