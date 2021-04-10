const {addChat} = require("../controllers/image");

exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobId) => {
      socket.join(jobId);
    });
    socket.on('chat', async function(jobId, sender, message, imageId) {
      let chatObj = {sender: sender, message: message};
      await addChat(imageId, chatObj);
      socket.emit('chat', imageId, chatObj);
    });
  });
}
