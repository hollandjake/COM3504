exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobID) => socket.join(jobID));
    socket.on('chat', function(jobID, userID, message, currentPage) {
      socket.to(jobID).emit('chat', jobID, userID, message, currentPage);    });
  });
}
