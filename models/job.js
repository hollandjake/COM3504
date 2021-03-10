const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        auto: true
    },
    name: {
        type: String,
        required: true
    },
    imageSequence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    }]
});

module.exports = mongoose.model('Job', JobSchema);