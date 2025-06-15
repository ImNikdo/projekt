
window.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (loggedInUser) {
    document.getElementById("loggedInMessage").textContent = `✅ Přihlášen jako: ${loggedInUser}`;
    document.getElementById("logoutBtn").style.display = "inline-block";

    // Kontrola, jestli uživatel lajknul článek při načtení
    const userLikes = JSON.parse(localStorage.getItem("userLikes_clanek1") || "[]");
    if (userLikes.includes(loggedInUser)) {
      const likeBtn = document.querySelector(`button[onclick="toggleLike('clanek1')"]`);
      if (likeBtn) likeBtn.classList.add("liked");
    }

  } else {
    document.getElementById("logoutBtn").style.display = "none";
  }

  displayComments("clanek1");
  updateLikeCounter("clanek1");
});

// Přihlašovací funkce
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

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function login() {
  const users = getUsers();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!users[username]) {
    document.getElementById("loggedInMessage").textContent = "❌ Uživatel neexistuje.";
    return;
  }

  if (users[username] !== password) {
    document.getElementById("loggedInMessage").textContent = "❌ Špatné heslo.";
    return;
  }

  localStorage.setItem("loggedInUser", username);
  document.getElementById("authArea").innerHTML = "";
  document.getElementById("loggedInMessage").textContent = `✅ Přihlášen jako: ${username}`;
  document.getElementById("logoutBtn").style.display = "inline-block";

  // Při přihlášení zkontroluj like stav
  const userLikes = JSON.parse(localStorage.getItem("userLikes_clanek1") || "[]");
  const likeBtn = document.querySelector(`button[onclick="toggleLike('clanek1')"]`);
  if (likeBtn && userLikes.includes(username)) {
    likeBtn.classList.add("liked");
  } else {
    likeBtn.classList.remove("liked");
  }
}

function register() {
  const users = getUsers();
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  if (users[username]) {
    document.getElementById("loggedInMessage").textContent = "❌ Uživatel už existuje.";
    return;
  }

  users[username] = password;
  saveUsers(users);
  localStorage.setItem("loggedInUser", username); // automatické přihlášení
  document.getElementById("authArea").innerHTML = "";
  document.getElementById("loggedInMessage").textContent = `✅ Přihlášen jako: ${username}`;
  document.getElementById("logoutBtn").style.display = "inline-block";
}

function logout() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("loggedInMessage").textContent = "Byl jsi odhlášen.";
  document.getElementById("logoutBtn").style.display = "none";

  const likeBtn = document.querySelector(`button[onclick="toggleLike('clanek1')"]`);
  if (likeBtn) likeBtn.classList.remove("liked");
}

function isLoggedIn() {
  return localStorage.getItem("loggedInUser") !== null;
}

// Komentáře
function addComment(articleId) {
  if (!isLoggedIn()) {
    alert("Pro komentování se přihlaste.");
    return;
  }

  const commentText = document.getElementById(`commentInput_${articleId}`).value;
  if (!commentText.trim()) return;

  const username = localStorage.getItem("loggedInUser");
  const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || "[]");
  comments.push({ username, comment: commentText.trim() });
  localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
  document.getElementById(`commentInput_${articleId}`).value = "";
  displayComments(articleId);
}

function displayComments(articleId) {
  const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || "[]");
  const commentsDiv = document.getElementById(`comments_${articleId}`);
  commentsDiv.innerHTML = comments
    .map(c => `<strong>${c.username}:</strong> ${c.comment}`)
    .join("<br>");
}

// Lajky + efekt „liked“
function toggleLike(articleId) {
  if (!isLoggedIn()) {
    alert("Pro lajkování se přihlaste.");
    return;
  }

  let likes = parseInt(localStorage.getItem(`likes_${articleId}`) || "0");
  const userLikes = JSON.parse(localStorage.getItem(`userLikes_${articleId}`) || "[]");
  const username = localStorage.getItem("loggedInUser");

  const button = document.querySelector(`button[onclick="toggleLike('${articleId}')"]`);

  if (userLikes.includes(username)) {
    userLikes.splice(userLikes.indexOf(username), 1);
    likes--;
    button.classList.remove("liked");
  } else {
    userLikes.push(username);
    likes++;
    button.classList.add("liked");
  }

  localStorage.setItem(`userLikes_${articleId}`, JSON.stringify(userLikes));
  localStorage.setItem(`likes_${articleId}`, JSON.stringify(likes));
  updateLikeCounter(articleId);
}

function updateLikeCounter(articleId) {
  const likes = parseInt(localStorage.getItem(`likes_${articleId}`) || "0");
  document.getElementById(`likeCounter_${articleId}`).textContent = likes;
}
