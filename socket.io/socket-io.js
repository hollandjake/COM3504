exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobID) => socket.join(jobID));
  });
}
