const sendBtn = document.getElementById("ai-send");
const input = document.getElementById("ai-input");
const output = document.getElementById("ai-output");

sendBtn.onclick = async () => {
  const res = await fetch("/api/v1/ai/assist", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      file_id: currentFileId,
      instruction: input.value
    })
  });

  if (!res.ok) {
    output.textContent = "AI request failed";
    return;
  }

  const data = await res.json();
  output.textContent = data.result;
};