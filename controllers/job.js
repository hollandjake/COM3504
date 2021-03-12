const Job = require("../models/job");
const Image = require("../models/image");

exports.get = async function (jobId) {
    return await Job.findById(jobId).populate('imageSequence').exec();
}

/**
 * Fetches all the Jobs
 */
exports.getAll = async function () {
    return await Job.find().populate('imageSequence').exec();
}

/**
 * Saves a job and returns the saved object (including its new id)
 * @param jobData
 * @returns {Job}
 */
exports.addJob = async function(jobData) {
    for (let i=0,len=jobData.imageSequence.length;i<len;i++) {
        jobData.imageSequence[i] = await Image.create(jobData.imageSequence[i]);
    }
    return await Job.create(jobData);
}