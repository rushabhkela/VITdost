const mongoose = require('mongoose');

var attemptSchema = new mongoose.Schema({
    ofUser: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    questionId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    videoLink: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    isFailed: {
        type: Boolean,
        required: true,
        default: false
    },
    comments: [
        {
            user : mongoose.SchemaTypes.ObjectId,
            comment : String,
            timestamp : Date
        }
    ]
});

module.exports = mongoose.model('Attempt', attemptSchema);
