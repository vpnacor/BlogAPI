const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({

    title: {
        type:String,
        required: [true, 'Title input is required']
    },
    content: {
        type:String,
        required: [true, 'Content input is required']
    },
    author: {
        type:String,
        required: [true, 'Author input is required']
    },
    information: {
        type:String,
        required: [true, 'Information input is required']
    },
    creationDate: {
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model('Post', postSchema);