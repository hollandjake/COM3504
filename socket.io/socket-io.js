const createJob = require("./createJob.js");

exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('create', (data) => createJob(io, socket, data));
  });
}
