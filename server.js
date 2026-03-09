const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const { AUTH_TOKEN, hasValidAuthToken } = require('./lib/auth-utils');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Postgres pool - configured from environment with sensible defaults for Docker Compose
let pool;
if (process.env.NODE_ENV === 'test') {
  // In-memory fake pool for tests to avoid needing a Postgres instance
  const seededUsers = [ { id: 1, username: 'admin', password: process.env.DEFAULT_ADMIN_PASSWORD || 'password' } ];
  const seededWidgets = [
    { id: 1, name: 'Widget A', description: 'A basic widget', price: '9.99' },
    { id: 2, name: 'Widget B', description: 'An advanced widget', price: '19.99' },
    { id: 3, name: 'Widget C', description: 'A premium widget', price: '29.99' }
  ];
  pool = {
    query: async (text, params) => {
      const sql = (text || '').toLowerCase();
      if (sql.includes('select * from users') && params && params.length >= 2) {
        const [username, password] = params;
        const found = seededUsers.filter(u => u.username === username && u.password === password);
        return { rows: found };
      }
      if (sql.includes('select id, name, description, price from widgets')) {
        return { rows: seededWidgets };
      }
      // Fallback: return empty
      return { rows: [] };
    },
    connect: async () => ({ query: async () => {}, release: () => {} })
  };
} else {
  pool = new Pool({
    host: process.env.POSTGRES_HOST || 'db',
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER || 'example',
    password: process.env.POSTGRES_PASSWORD || 'example',
    database: process.env.POSTGRES_DB || 'exampledb',
  });
}

// Initialize DB: create users table and insert default user if not exists
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'password';

async function initDb(){
  if (process.env.NODE_ENV === 'test') return; // skip real DB init during tests

  const client = await pool.connect();
  try{
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);

    // Insert default user if not exists (password taken from DEFAULT_ADMIN_PASSWORD env var)
    await client.query(
      `INSERT INTO users (username, password)
       SELECT $1, $2
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = $1)`,
      ['admin', DEFAULT_ADMIN_PASSWORD]
    );

    // Create widgets table
    await client.query(`CREATE TABLE IF NOT EXISTS widgets (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL DEFAULT 0
    )`);

    // Seed some example widgets if they do not exist
    await client.query(`INSERT INTO widgets (name, description, price)
      SELECT 'Widget A', 'A basic widget', 9.99
      WHERE NOT EXISTS (SELECT 1 FROM widgets WHERE name = 'Widget A')`);

    await client.query(`INSERT INTO widgets (name, description, price)
      SELECT 'Widget B', 'An advanced widget', 19.99
      WHERE NOT EXISTS (SELECT 1 FROM widgets WHERE name = 'Widget B')`);

    await client.query(`INSERT INTO widgets (name, description, price)
      SELECT 'Widget C', 'A premium widget', 29.99
      WHERE NOT EXISTS (SELECT 1 FROM widgets WHERE name = 'Widget C')`);

    console.log('Database initialized');
  } catch (err){
    console.error('Error initializing database', err);
  } finally{
    client.release();
  }
}

initDb();

// API endpoints
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try{
    const { rows } = await pool.query('SELECT * FROM users WHERE username=$1 AND password=$2', [username, password]);
    if (rows.length > 0){
      res.cookie('token', AUTH_TOKEN, { httpOnly: true });
      return res.json({ ok: true });
    }
    res.status(401).json({ ok: false });
  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  if (hasValidAuthToken(req.cookies.token)) {
    return res.json({ username: 'admin' });
  }
  res.status(401).json({ error: 'unauthorized' });
});

// API to return widgets (requires the same simple cookie-based auth)
app.get('/api/widgets', async (req, res) => {
  if (!hasValidAuthToken(req.cookies.token)) return res.status(401).json({ error: 'unauthorized' });
  try{
    const { rows } = await pool.query('SELECT id, name, description, price FROM widgets ORDER BY id');
    res.json(rows);
  } catch (err){
    console.error('Error fetching widgets', err);
    res.status(500).json({ error: 'server error' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = app;
