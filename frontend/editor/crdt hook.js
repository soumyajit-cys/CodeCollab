socket.on("crdt_update", delta => {
  ydoc.transact(() => {
    Y.applyUpdate(ydoc, delta);
  });
});

editor.onDidChangeModelContent(event => {
  const update = Y.encodeStateAsUpdate(ydoc);
  socket.emit("crdt_update", {
    room_id: currentRoom,
    delta: update
  });
});