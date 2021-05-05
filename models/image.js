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
        required: true,
        validate: {
            validator: v => (/(data:image\/.+)|((http|https):\/\/(\w+:?\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-/]))?)/).test(v),
            message: "Invalid image source"
        }
    },
})

module.exports = mongoose.model('Image', ImageSchema);