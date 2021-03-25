const addImage = require("./addImage.js");

exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobID) => socket.join(jobID));
    socket.on('add image', (jobID, image) => addImage(io, socket, jobID, image));
  });
}
