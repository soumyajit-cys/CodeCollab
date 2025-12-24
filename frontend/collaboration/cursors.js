editor.onDidChangeCursorPosition(e => {
  socket.emit("cursor_move", {
    room_id: currentRoom,
    position: e.position
  });
});

socket.on("cursor_move", data => {
  renderRemoteCursor(data.user_id, data.position);
});