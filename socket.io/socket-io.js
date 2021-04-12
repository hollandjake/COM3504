const {addChat, addAnnotation} = require("../controllers/image");

exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobId) => {
      socket.join(jobId);
    });
    socket.on('chat', async function(sender, message, imageId) {
      let chatObj = {sender: sender, message: message};
      io.of('/job').emit('chat', imageId, chatObj);
    });
    socket.on('draw', async function(imageId, event) {
      io.of('/job').emit('draw', imageId, event);
    });
  });
}
