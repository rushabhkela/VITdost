var mongoose = require('mongoose');
var codeSchema = new mongoose.Schema({
    content: String,
    name: {
        type: String,
        unique: true
    },
    lastInput: String,
    lastOutput: String,
    lastTimeUsed: String,
    lastMemUsed: String,
    createdBy: mongoose.SchemaTypes.ObjectId
    // collaborators: [
    //     {
    //         userid : mongoose.SchemaTypes.ObjectId
    //     }
    // ]
});

module.exports = mongoose.model('Code', codeSchema);