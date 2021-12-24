const mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Question', questionSchema);
