const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = new schema({
    fullName: {
        type: String,
        default: ''
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: Number
    },
    location: {
        type: String
    },
    fbTokens: Array,
    facebook: {
        type: String
    },
    google: {
        type: String
    },
    instagram: {
        type: String
    }

});

module.exports = mongoose.model(
    'user', userSchema
);