let mongoose = require('mongoose');

require('../models/job');
require('../models/image');

let mongoDB = 'mongodb://localhost:27017/jobs';

try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
        useCreateIndex: true,
        useFindAndModify: false //This is needed for the auto incrementing id of the job
    });
    console.log('Connected to MongoDB');
} catch (e) {
    console.log('error in db connection: ' + e.message);
}