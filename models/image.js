const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ImageSchema = new mongoose.Schema({
    _id: Number,
    title: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageData: {
        type: String,
        required: true
    },
}, {_id: false, toJSON: {virtuals: true}})
ImageSchema.plugin(AutoIncrement, {inc_field: "_id", id: "image"});


ImageSchema.virtual('url').get(function () {
    return "/image?id=" + this._id;
})

module.exports = mongoose.model('Image', ImageSchema);