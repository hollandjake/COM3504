const {addChat} = require("../controllers/image");

exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobID) => {
      socket.join(jobID);
    });
    socket.on('chat', function(jobID, userID, message, imageId) {
      let chatObj = {sender: userID, message: message};
      addChat(imageId, chatObj);
      socket.to(jobID).emit('chat', imageId, chatObj);
    });
  });
}
