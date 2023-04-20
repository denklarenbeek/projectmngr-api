const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const projectSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User"
        },
        title: {
            type: String,
            required: true
        },
        value: {
            type: Number
        },
        status: {
            type: String,
            required: true //Draft, Active & Completed
        },
        started_at: {
            type: String
        },
        completed_at: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

projectSchema.plugin(AutoIncrement, {
    inc_field: 'project',
    id: 'projectIds',
    start_seq: 1
})

module.exports = mongoose.model('Project', projectSchema);