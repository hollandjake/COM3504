exports.init = function(io) {
  io.of('/job').on('connection', function(socket) {
    socket.on('join', (jobId) => {
      socket.join(jobId);
    });
    socket.on('chat', async function(sender, message, imageId) {
      if (message.length > 0) {
        let chatObj = {sender: sender, message: message};
        socket.broadcast.emit('chat', imageId, chatObj);
      }
    });
    socket.on('writingMessage', async function(imageId, sender) {
      socket.broadcast.emit('writingMessage', imageId, sender);
    });
    socket.on('newKnowledgeGraph', async function(JSONLD, imageId, color) {
      socket.broadcast.emit('newKnowledgeGraph', JSONLD, imageId, color);
    });
    socket.on('knowledgeGraphColor', async function(imageId, graphId, color) {
      socket.broadcast.emit('knowledgeGraphColor', imageId, graphId, color);
    });
    socket.on('knowledgeGraphDeleted', async function(imageId, graphId) {
      socket.broadcast.emit('knowledgeGraphDeleted', imageId, graphId);
    });
    socket.on('draw', async function(imageId, event) {
      socket.broadcast.emit('draw', imageId, event);
    });
  });
}
