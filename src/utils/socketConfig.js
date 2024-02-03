const socketIO = require("socket.io");

module.exports = (server, options) => {
  const io = socketIO(server, options);

  io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);

    // EVENT Event for joining a group
    socket.on("groupSetup", (groupID) => {
      socket.join(groupID);
      console.log("user joined group:", groupID);
    });

    // EVENT Event for message to a group
    socket.on("messageToGroup", (message) => {
      socket.to(message.group._id).emit("messageRecieved", message);
    });
  });

  return io;
};
