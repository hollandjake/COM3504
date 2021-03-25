const Image = require("../models/image");

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
    let jobImage = {
        title: req.body.image_title,
        author: req.body.image_author,
        description: req.body.image_description,
    };
    if (req.files && req.files.length > 0) {
        let imageData = req.files[0].buffer.toString('base64');

        jobImage.imageUrl = `data:image/png;base64,${imageData}`;
    } else if (req.body.image_url) {
        jobImage.imageUrl = req.body.image_url;
    } else {
        return null;
    }
    return jobImage;
}