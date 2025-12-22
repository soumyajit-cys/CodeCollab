let saveTimer = null;

function scheduleAutosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 800);
}

async function saveNow() {
  if (!currentFileId) return;

  await fetch(`/api/v1/files/${currentFileId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content: editor.getValue() })
  });
}