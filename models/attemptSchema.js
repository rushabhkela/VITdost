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
    ],
    thumbsup: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        default: []
    },
    claps: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        default: []
    },
    hundred: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        default: []
    },
    heart: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        default: []
    }
});

module.exports = mongoose.model('Attempt', attemptSchema);
