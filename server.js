const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const db = new sqlite3.Database('./users.db');

app.use(express.static('public'));
app.use(bodyParser.json());

// Vytvoření tabulky při prvním spuštění
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    likes TEXT DEFAULT '{}'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER,
    username TEXT,
    text TEXT
  )`);
});

// Registrace
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
    if (err) return res.status(400).send({ message: 'Uživatel už existuje.' });
    res.send({ message: 'Účet vytvořen.' });
  });
});

// Přihlášení
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return res.status(404).send({ message: 'Uživatel neexistuje.' });
    if (user.password !== password) return res.status(403).send({ message: 'Špatné heslo.' });
    res.send({ message: 'Přihlášení úspěšné.', username });
  });
});

// Uložení like
app.post('/like', (req, res) => {
  const { username, postId } = req.body;
  db.get('SELECT likes FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return res.status(404).send();
    let likes = JSON.parse(user.likes || '{}');
    likes[postId] = true;
    db.run('UPDATE users SET likes = ? WHERE username = ?', [JSON.stringify(likes), username]);
    res.send({ message: 'Like uložen.' });
  });
});

// Komentáře
app.post('/comment', (req, res) => {
  const { username, postId, text } = req.body;
  db.run('INSERT INTO comments (postId, username, text) VALUES (?, ?, ?)', [postId, username, text]);
  res.send({ message: 'Komentář uložen.' });
});

app.get('/comments/:postId', (req, res) => {
  const postId = req.params.postId;
  db.all('SELECT username, text FROM comments WHERE postId = ?', [postId], (err, rows) => {
    res.send(rows);
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));

