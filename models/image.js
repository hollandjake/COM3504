const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ImageSchema = new mongoose.Schema({
    _id: Number,
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
    imageData: {
        type: String,
        required: true,
        validate: {
            validator: v => (/(data:image\/.+)|((http|https):\/\/(\w+:?\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-/]))?)/).test(v),
            message: "Invalid image source"
        }
    },
}, {_id: false, toJSON: {virtuals: true}})
ImageSchema.plugin(AutoIncrement, {inc_field: "_id", id: "image"});


ImageSchema.virtual('url').get(function () {
    return "/image?id=" + this._id;
})

module.exports = mongoose.model('Image', ImageSchema);