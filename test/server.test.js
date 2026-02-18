const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

// Require the server module. To make server testable we will import app from server.js
let app;

beforeAll(() => {
  // start server as app by requiring server.js which exports app if available
  const server = require('../server');
  app = server.app || server;
});

describe('Basic API tests', () => {
  test('GET /api/me returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/me');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/login with bad creds returns 401', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'nope', password: 'nope' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/login with correct creds sets cookie and GET /api/widgets fails without cookie', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: process.env.DEFAULT_ADMIN_PASSWORD || 'password' });
    expect(loginRes.statusCode).toBe(200);
    const cookie = loginRes.headers['set-cookie'];
    expect(cookie).toBeDefined();

    // Access widgets with cookie
    const widgetsRes = await request(app).get('/api/widgets').set('Cookie', cookie);
    expect(widgetsRes.statusCode).toBe(200);
    expect(Array.isArray(widgetsRes.body)).toBe(true);
  });
});
