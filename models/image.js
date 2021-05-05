const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    creator: {
        type: String,
        required: [true, "Creator is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    imageUrl: {
        type: String,
        required: [true, "Invalid image source"]
    },
})

module.exports = mongoose.model('Image', ImageSchema);