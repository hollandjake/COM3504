exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('create', (data) => createJob(io, socket, data));
    socket.on('join', (jobID) => socket.join(jobID));
    socket.on('chat', function(jobID, userID, message) {
      io.of('/job').to(jobID).emit('chat', jobID, userID, message);
    });
  });
}
