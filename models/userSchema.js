var mongoose = require('mongoose');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    linkedinURL: {
        type: String,
    },
    instagramURL: {
        type: String,
    },
    twitterURL: {
        type: String,
    },
    facebookURL: {
        type: String,
    },
    githubURL: {
        type: String
    },
    cfURL: {
        type: String,
    },
    ccURL: {
        type: String,
    },
    leetcodeURL: {
        type: String,
    },
    contact: {
        type: String
    },
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
    return this.hash === hash;
};

module.exports = mongoose.model('User', userSchema);
