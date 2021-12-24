const mongoose = require('mongoose');

var materialSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    isBook: {
        type: Boolean,
        required: true,
        default: false
    },
    isPaper: {
        type: Boolean,
        required: true,
        default: false
    },
    location: {
        type: String,
        required: true,
        unique: true
    },
    uploadedBy : {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Material', materialSchema);
