const jobController = require("../controllers/job");

module.exports = async function (io, socket, data) {
    let job = await jobController.addJob(data);
    console.log("New Job Created: "+job.name);
    socket.broadcast.emit('newJob', job);
    socket.emit('jobCreateRedirect', job.url);
}