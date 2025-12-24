socket.on("user_joined", userId => addUser(userId));
socket.on("user_left", userId => removeUser(userId));