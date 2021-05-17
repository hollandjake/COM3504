const Image = require("../models/image");

const axios = require("axios")

exports.get = async function (imageId) {
    return await Image.findById(imageId).exec();
}

/**
 * Fetches all the images
 */
exports.getAll = async function () {
    return await Image.find().exec();
}

/**
 * Saves an image and returns the saved object (including its new id)
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

exports.parseImage = async function (req) {
    let image = {
        title: req.body['image_title'],
        creator: req.body['image_creator'],
        description: req.body['image_description'],
        type: req.body['image_type']
    };
    if (req.body['image_type'] === "upload") {
        let mimetype = req.files[0].mimetype;
        let imageData = req.files[0].buffer.toString('base64');
        image.imageData = `data:${mimetype};base64,${imageData}`;
    } else if (req.body['image_type'] === "camera") {
        image.imageData = req.body['image_source'];
    } else if (req.body['image_type'] === "url") {
        try {
            image.imageData = await getBase64FromUrl(req.body['image_source'])
        } catch (e) {
            console.log(e);
        }
    } else {
        return null;
    }
    return image;
}

const getBase64FromUrl = async (url) => {

    if ((/(data:image\/.+)/).test(url)) {
        return url
    }

    const data = await axios.get(url, {responseType:"arraybuffer"});

    const base64 = Buffer.from(data.data).toString("base64");
    return "data:" + data.headers["content-type"] + ";base64," + base64
}