// Přepínání tmavého režimu
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Přihlašovací funkce
function showLoginOptions() {
  const authArea = document.getElementById("authArea");
  authArea.innerHTML = `
    <div class="auth-box">
      <h2>Vítej! Máš už účet?</h2>
      <button onclick="showLoginForm()">Ano, přihlásit se</button>
      <button onclick="showRegisterForm()">Ne, vytvořit účet</button>
    </div>
  `;
}

function showLoginForm() {
  const authArea = document.getElementById("authArea");
  authArea.innerHTML = `
    <div class="auth-box">
      <h2>Přihlášení</h2>
      <input type="text" id="loginUsername" placeholder="Uživatelské jméno" />
      <input type="password" id="loginPassword" placeholder="Heslo" />
      <button onclick="login()">Přihlásit se</button>
    </div>
  `;
}

function showRegisterForm() {
  const authArea = document.getElementById("authArea");
  authArea.innerHTML = `
    <div class="auth-box">
      <h2>Registrace</h2>
      <input type="text" id="registerUsername" placeholder="Uživatelské jméno" />
      <input type="password" id="registerPassword" placeholder="Heslo" />
      <button onclick="register()">Vytvořit účet</button>
    </div>
  `;
}

// Jednoduchá databáze v localStorage
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
    //alert("Uživatel neexistuje.");
    document.getElementById("loggedInMessage").textContent = `Uživatel neexistuje`;
    return;
  }

  if (users[username] !== password) {
    //alert("Špatné heslo.");
    document.getElementById("loggedInMessage").textContent = `Špatné heslo`;
    return;
  }

  alert("Přihlášení úspěšné!");

  // Uložení přihlášeného uživatele
  localStorage.setItem("loggedInUser", username);

  // Zobrazení zprávy
  document.getElementById("authArea").innerHTML = "";
  document.getElementById("loggedInMessage").textContent = `✅ Přihlášen jako: ${username}`;
}

function register() {
  const users = getUsers();
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;


  
  fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => alert(data.message))
  .catch(err => alert('Chyba při registraci'));
  
  if (users[username]) {
    //alert("Uživatel už existuje.");
    document.getElementById("loggedInMessage").textContent = `Uživatel už existuje`;
    return;
  }

  users[username] = password;
  saveUsers(users);
  alert("Účet vytvořen!");
}

window.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    document.getElementById("loggedInMessage").textContent = `✅ Přihlášen jako: ${loggedInUser}`;
  }
});

function logout() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("loggedInMessage").textContent = "";
  alert("Byl jsi odhlášen.");
}
