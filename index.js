const crypto = require('crypto');
const db = require('better-sqlite3')('db.sqlite3')

// remake the `users` table
db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(`CREATE TABLE users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
);`);

// add an admin user with a random password
db.exec(`INSERT INTO users (username, password) VALUES (
  'admin',
  '${crypto.randomBytes(16).toString('hex')}'
)`);


const template = () => `

<!doctype html>
<html>
    <head>
        <link rel="stylesheet" href="/styles.css">
        <style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  display: grid;
  place-items: center;
}

body div {
  padding: 50px;
  border-radius: 3px;
  background-color: #EEE;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

h1 {
  padding: 0;
  padding-bottom: 10px;
  margin: 0;
}

input {
  padding: 10px;
  border: none;
  outline: none;
  border-radius: 3px;
  background-color: #FFF;
}

        </style>
    </head>
    <body>
        <div>
          <h1>Login</h1>
          <form method="POST" action="/login">
            <label for="username">Username</label>
            <input name="username" type="text" id="username"/>
            <label for="username">Password</label>
            <input name="password" type="password" id="password"/>
            <input type="submit" value="Submit"/>
          </form>
        </div>
    </body>
</html>

`;


const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse json and serve static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));


app.get('/', (req, res) => {
  // res.setHeader("Content-Security-Policy", `default-src none; script-src 'nonce-${NONCE}';`);
  res.send(template());
})


// login route
app.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.redirect('/');
  }

  if ([req.body.username, req.body.password].some(v => v.includes('\''))) {
    return res.redirect('/');
  }

  // see if user is in database
  const query = `SELECT id FROM users WHERE
    username = '${req.body.username}' AND
    password = '${req.body.password}'
  `;

  let id;
  try { id = db.prepare(query).get()?.id } catch {
    return res.redirect('/');
  }

  // correct login
  if (id) return res.sendFile('flag.html', { root: __dirname });

  // incorrect login
  return res.redirect('/');
});

app.listen(3000);
