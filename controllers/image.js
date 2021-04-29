const Image = require("../models/image");

exports.get = async function (imageId) {
    return await Image.findById(imageId).exec();
}

/**
 * Fetches all the Jobs
 */
exports.getAll = async function () {
    return await Image.find().exec();
}

/**
 * Saves a job and returns the saved object (including its new id)
 * @returns {Image}
 * @param imageData
 */
exports.addImage = async function (imageData) {
    try {
        return await Image.create(imageData);
    } catch (e) {
        console.log(e._message);
        throw e;
    }
}

exports.parseImage = function(req) {
    let image = {
        title: req.body['image_title'],
        creator: req.body['image_creator'],
        description: req.body['image_description'],
    };
    if (req.body['image_type'] === "upload") {
        let imageData = req.files[0].buffer.toString('base64');
        image.imageData = `data:image/png;base64,${imageData}`;
    } else if (req.body['image_type'] === "camera") {
        image.imageData = req.body['image_source'];
    } else if (req.body['image_type'] === "url") {
        image.imageData = req.body['image_source'];
    } else {
        return null;
    }
    return image;
}