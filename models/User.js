const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    email: {
        type:String,
        required: [true, 'Email input is required']
    },
    username: {
        type:String,
        required: [true, 'Username input is required']
    },
    password: {
        type:String,
        required: [true, 'Password input is required']
    }


})

module.exports = mongoose.model('User', userSchema)