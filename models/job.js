const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const JobSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    creator: {
        type: String,
        required: [true, "Creator is required"]
    },
    imageSequence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: [true, "Initial image is required"]
    }]
}, {_id: false, toJSON: {virtuals: true}});
JobSchema.plugin(AutoIncrement);

JobSchema.virtual('url').get(function () {
    return "/job?id="+this._id;
})

module.exports = mongoose.model('Job', JobSchema);