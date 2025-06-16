const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const db = new sqlite3.Database('./users.db');

app.use(express.static('public'));
app.use(bodyParser.json());

//
app.get('/likes/:postId', (req, res) => {
  const postId = req.params.postId;
  db.all('SELECT likes FROM users', [], (err, rows) => {
    if (err) return res.status(500).send({ count: 0 });

    let count = 0;
    rows.forEach(user => {
      try {
        const likes = JSON.parse(user.likes || '{}');
        if (likes[postId]) count++;
      } catch (_) {}
    });

    res.send({ count });
  });
});

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

  if (!username || !postId) {
    return res.status(400).send({ message: 'Chybí username nebo postId.' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(403).send({ message: 'Neautorizováno.' });

    let likes = JSON.parse(user.likes || '{}');

    // Přepnout stav lajku
    if (likes[postId]) {
      delete likes[postId]; // Unlike
    } else {
      likes[postId] = true; // Like
    }

    db.run('UPDATE users SET likes = ? WHERE username = ?', [JSON.stringify(likes), username]);
    res.send({ message: 'Stav lajku uložen.' });
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

app.get('/likes/:postId', (req, res) => {
  const postId = req.params.postId;
  db.all('SELECT likes FROM users', [], (err, rows) => {
    if (err) return res.status(500).send();
    const count = rows.filter(row => {
      const liked = JSON.parse(row.likes || '{}');
      return liked[postId];
    }).length;
    res.send({ count });
  });
});

// Získání informací o uživateli podle username
app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  db.get('SELECT username, likes FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(404).send({ message: 'Uživatel nenalezen.' });
    }
    res.send(user);
  });
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));

