const mongoose = require('mongoose');

var subjectSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Subject', subjectSchema);
