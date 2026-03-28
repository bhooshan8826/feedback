// 🔴 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database().ref("messages");

// ── Palette for avatars ───────────────────────────
const COLORS = [
  "#00E5FF", "#FF4D8D", "#A78BFA", "#34D399",
  "#FBBF24", "#F87171", "#60A5FA", "#FB923C"
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ── Send message ──────────────────────────────────
function sendMessage() {
  const name    = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const btn     = document.querySelector("button");

  if (name && message) {
    btn.classList.add("sending");
    btn.querySelector("span").textContent = "Sending…";

    db.push({ name, message })
      .then(() => {
        document.getElementById("message").value = "";
        btn.classList.remove("sending");
        btn.querySelector("span").textContent = "Send Message";
      });
  }
}

// Allow Enter key to send
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("message").addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
});

// ── Render messages ───────────────────────────────
db.on("value", snapshot => {
  const data  = snapshot.val();
  const chat  = document.getElementById("chat");
  const count = document.getElementById("msg-count");

  if (!data) {
    chat.innerHTML = `
      <div class="empty-state">
        <div class="icon">💬</div>
        <p>No messages yet. Be the first!</p>
      </div>`;
    count.textContent = "0 posts";
    return;
  }

  const keys = Object.keys(data);
  count.textContent = `${keys.length} ${keys.length === 1 ? "post" : "posts"}`;

  let html = "";
  // Show newest first
  keys.reverse().forEach(id => {
    const { name, message } = data[id];
    const color    = getColor(name);
    const initials = getInitials(name);
    html += `
      <div class="msg">
        <div class="avatar" style="background:${color}">${initials}</div>
        <div class="msg-body">
          <div class="sender">${name}</div>
          <div class="text">${message}</div>
        </div>
      </div>`;
  });

  chat.innerHTML = html;
});
