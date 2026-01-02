// js/dashboard.js
import { authFetch } from "./auth-guard.js";

async function loadDashboard() {
  const res = await authFetch("/api/dashboard");
  const data = await res.json();

  document.getElementById("displayName").textContent =
    data.profile.display_name;

  document.getElementById("bio").textContent = data.profile.bio || "";

  document.getElementById("connectionsCount").textContent =
    data.connections_count;

  const sessions = document.getElementById("sessions");
  sessions.innerHTML = "";

  data.active_sessions.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.ip_address} • ${s.user_agent}`;
    sessions.appendChild(li);
  });
}

loadDashboard();

