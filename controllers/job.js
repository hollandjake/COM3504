const Job = require("../models/job");

exports.getAll = function(req, res) {
    Job.find().populate('imageSequence').exec(function (err, jobs) {
        res.send(jobs);
    });
}