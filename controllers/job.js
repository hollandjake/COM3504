const Job = require("../models/job");
const ImageController = require("./image");

exports.get = async function (jobId) {
    return await Job.findById(jobId).exec();
}

/**
 * Fetches all the Jobs
 */
exports.getAll = async function () {
    return await Job.find().exec();
}

/**
 * Saves a job and returns the saved object (including its new id)
 * @param jobData
 * @returns {Job}
 */
exports.addJob = async function (jobData) {
    try {
        for (let i = 0, len = jobData.imageSequence.length; i < len; i++) {
            jobData.imageSequence[i] = (await ImageController.addImage(jobData.imageSequence[i]))._id;
        }
        return await Job.create(jobData);
    } catch (e) {
        console.log(e._message);
        throw e;
    }
}

exports.addImage = async function (jobID, imageData) {
    let newImage = await ImageController.addImage(imageData);
    await Job.findByIdAndUpdate(jobID, {$push: {imageSequence: newImage._id}});
    return newImage;
}