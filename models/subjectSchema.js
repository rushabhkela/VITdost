const mongoose = require('mongoose');

var subjectSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Subject', subjectSchema);
