const mongoose = require('mongoose');

var aptiQuesSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    optA: {
        type: String,
    },
    optB: {
        type: String,
    },
    optC: {
        type: String,
    },
    optD: {
        type: String,
    },
    correctOpt: {
        type: String,
    }
});

module.exports = mongoose.model('AptiQuestions', aptiQuesSchema);
