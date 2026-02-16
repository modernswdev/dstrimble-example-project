const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Simple in-memory user
const USER = { username: 'admin', password: 'password' };

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    res.cookie('token', 'fake-jwt-token', { httpOnly: true });
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  if (req.cookies.token === 'fake-jwt-token') {
    return res.json({ username: USER.username });
  }
  res.status(401).json({ error: 'unauthorized' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
