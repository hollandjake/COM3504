const jobController = require("../controllers/job");
const escapeHtml = require('escape-html-in-json');

module.exports = async function (io, socket, data) {
    try {
        data = JSON.parse(JSON.stringify(data, escapeHtml));

        let job = await jobController.addJob(data);
        console.log("New Job Created: " + job.name);
        socket.broadcast.emit('newJob', job);
        socket.emit('jobCreateRedirect', job.url);
    } catch (e) {
        socket.emit('jobCreateFailed', 'Failed to create Job');
    }
}