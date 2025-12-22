async function loadFileTree() {
  const res = await fetch("/api/v1/files", authHeaders());
  const files = await res.json();

  const tree = document.getElementById("file-tree");
  tree.innerHTML = "";

  files.forEach(f => {
    const node = document.createElement("div");
    node.textContent = f.path;
    node.onclick = () => loadFile(f.id);
    tree.appendChild(node);
  });
}

loadFileTree();