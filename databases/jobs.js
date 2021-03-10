let mongoose = require('mongoose');

require('../models/job');
require('../models/image');

let mongoDB = 'mongodb://localhost:27017/jobs';

try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
        useCreateIndex: true
    });
    console.log('connection to mongodb worked');
} catch (e) {
    console.log('error in db connection: ' + e.message);
}