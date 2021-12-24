
var mongoose = require('mongoose');
var collabSchema = new mongoose.Schema({
    workspaceid : mongoose.SchemaTypes.ObjectId,
    workspace :String,
    userid : mongoose.SchemaTypes.ObjectId
});

module.exports = mongoose.model('Collab', collabSchema);