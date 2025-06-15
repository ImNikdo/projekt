
let loggedInUser = null;
const ARTICLE_ID = document.body.dataset.articleId || "default";

// Přihlášení a registrace
function showLoginOptions() {
  document.getElementById("authArea").innerHTML = `
    <div class="auth-box">
      <h2>Vítej! Máš už účet?</h2>
      <button onclick="showLoginForm()">Ano, přihlásit se</button>
      <button onclick="showRegisterForm()">Ne, vytvořit účet</button>
    </div>
  `;
}

function showLoginForm() {
  document.getElementById("authArea").innerHTML = `
    <div class="auth-box">
      <h2>Přihlášení</h2>
      <input type="text" id="loginUsername" placeholder="Uživatelské jméno">
      <input type="password" id="loginPassword" placeholder="Heslo">
      <button onclick="login()">Přihlásit se</button>
    </div>
  `;
}

function showRegisterForm() {
  document.getElementById("authArea").innerHTML = `
    <div class="auth-box">
      <h2>Registrace</h2>
      <input type="text" id="registerUsername" placeholder="Uživatelské jméno">
      <input type="password" id="registerPassword" placeholder="Heslo">
      <button onclick="register()">Vytvořit účet</button>
    </div>
  `;
}

async function register() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("loggedInMessage").textContent = data.message;

  if (res.ok) {
    loggedInUser = username;
    document.getElementById("authArea").innerHTML = "";
    document.getElementById("logoutBtn").style.display = "inline-block";
    fetchComments();
    checkLikeStatus();
  }
}

async function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("loggedInMessage").textContent = data.message;

  if (res.ok) {
    loggedInUser = username;
    document.getElementById("authArea").innerHTML = "";
    document.getElementById("logoutBtn").style.display = "inline-block";
    fetchComments();
    checkLikeStatus();
  }
}

function logout() {
  loggedInUser = null;
  document.getElementById("loggedInMessage").textContent = "Byl jsi odhlášen.";
  document.getElementById("logoutBtn").style.display = "none";
  document.querySelector(`#likeBtn_${ARTICLE_ID}`)?.classList.remove("liked");
}

// Komentáře
async function addComment() {
  if (!loggedInUser) {
    alert("Přihlas se, abys mohl komentovat.");
    return;
  }

  const text = document.getElementById(`commentInput_${ARTICLE_ID}`).value;
  if (!text.trim()) return;

  await fetch("/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: loggedInUser, postId: ARTICLE_ID, text }),
  });

  document.getElementById(`commentInput_${ARTICLE_ID}`).value = "";
  fetchComments();
}

async function fetchComments() {
  const res = await fetch(`/comments/${ARTICLE_ID}`);
  const comments = await res.json();
  const div = document.getElementById(`comments_${ARTICLE_ID}`);
  div.innerHTML = comments.map(c => `<strong>${c.username}</strong>: ${c.text}`).join("<br>");
}

// Lajkování
async function toggleLike() {
  if (!loggedInUser) {
    alert("Přihlas se, abys mohl lajkovat.");
    return;
  }

  await fetch("/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: loggedInUser, postId: ARTICLE_ID }),
  });

  document.querySelector(`#likeBtn_${ARTICLE_ID}`)?.classList.add("liked");
}

// Kontrola, jestli uživatel lajknul
async function checkLikeStatus() {
  if (!loggedInUser) return;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: loggedInUser, password: "" }), // Hack: jen pro načtení like info
  });

  const data = await res.json();
  if (data && data.likes) {
    const likes = JSON.parse(data.likes);
    if (likes[ARTICLE_ID]) {
      document.querySelector(`#likeBtn_${ARTICLE_ID}`)?.classList.add("liked");
    }
  }
}

// Spuštění při načtení
window.addEventListener("DOMContentLoaded", () => {
  fetchComments();
});
