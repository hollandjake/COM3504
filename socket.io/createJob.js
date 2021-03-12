const jobController = require("../controllers/job");

module.exports = async function (io, socket, data) {
    console.log(data);
    let job = await jobController.addJob(data);
    socket.broadcast.emit('newJob', job);
    socket.emit('jobCreateRedirect', job.url);
}