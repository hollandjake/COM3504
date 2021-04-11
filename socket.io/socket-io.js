const {addChat} = require("../controllers/image");

exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobId) => {
      socket.join(jobId);
    });
    socket.on('chat', async function(jobId, sender, message, imageId) {
      let chatObj = {sender: sender, message: message};
      await addChat(imageId, chatObj);
      io.of('/job').emit('chat', imageId, chatObj);
    });
    socket.on('draw', function(annotationID, currE, funcName, uName, e) {
      io.of('/job').emit('draw', annotationID, currE, funcName, uName);
    });
  });
}
