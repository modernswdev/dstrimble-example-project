const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Postgres pool - configured from environment with sensible defaults for Docker Compose
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER || 'example',
  password: process.env.POSTGRES_PASSWORD || 'example',
  database: process.env.POSTGRES_DB || 'exampledb',
});

// Initialize DB: create users table and insert default user if not exists
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'password';

async function initDb(){
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try{
    const { rows } = await pool.query('SELECT * FROM users WHERE username=$1 AND password=$2', [username, password]);
    if (rows.length > 0){
      res.cookie('token', 'fake-jwt-token', { httpOnly: true });
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
  if (req.cookies.token === 'fake-jwt-token') {
    return res.json({ username: 'admin' });
  }
  res.status(401).json({ error: 'unauthorized' });
});

// API to return widgets (requires the same simple cookie-based auth)
app.get('/api/widgets', async (req, res) => {
  if (req.cookies.token !== 'fake-jwt-token') return res.status(401).json({ error: 'unauthorized' });
  try{
    const { rows } = await pool.query('SELECT id, name, description, price FROM widgets ORDER BY id');
    res.json(rows);
  } catch (err){
    console.error('Error fetching widgets', err);
    res.status(500).json({ error: 'server error' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
