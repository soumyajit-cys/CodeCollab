let editor;
let currentFileId = null;

require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" }});

require(["vs/editor/editor.main"], () => {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: "",
    language: "javascript",
    automaticLayout: true,
    minimap: { enabled: true }
  });

  editor.onDidChangeModelContent(() => scheduleAutosave());
});

async function loadFile(fileId) {
  const res = await fetch(`/api/v1/files/${fileId}`, authHeaders());
  const file = await res.json();

  currentFileId = file.id;
  const model = monaco.editor.createModel(file.content, file.language);
  editor.setModel(model);
}

