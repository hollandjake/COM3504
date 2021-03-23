const jobController = require("../controllers/job");
const escapeHtml = require('escape-html-in-json');

module.exports = async function (io, socket, jobID, image) {
    try {
        image = JSON.parse(JSON.stringify(image, escapeHtml));

        await jobController.addImage(jobID, image);
        socket.broadcast.in(jobID).emit('newImage', image)
        socket.emit('imageAddSuccess');
    } catch (e) {
        socket.emit('imageAddFailed', 'Failed to create Image');
    }
}