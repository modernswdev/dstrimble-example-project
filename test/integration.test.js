const request = require('supertest');
const app = require('../server');

describe('Integration tests - authentication and widgets flow', () => {
  test('session lifecycle: login -> me -> widgets -> logout', async () => {
    const agent = request.agent(app);

    const meBeforeLogin = await agent.get('/api/me');
    expect(meBeforeLogin.statusCode).toBe(401);

    const loginRes = await agent
      .post('/api/login')
      .send({ username: 'admin', password: process.env.DEFAULT_ADMIN_PASSWORD || 'password' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toEqual({ ok: true });

    const meAfterLogin = await agent.get('/api/me');
    expect(meAfterLogin.statusCode).toBe(200);
    expect(meAfterLogin.body).toEqual({ username: 'admin' });

    const widgetsRes = await agent.get('/api/widgets');
    expect(widgetsRes.statusCode).toBe(200);
    expect(Array.isArray(widgetsRes.body)).toBe(true);
    expect(widgetsRes.body.length).toBeGreaterThan(0);
    expect(widgetsRes.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(String),
      })
    );

    const logoutRes = await agent.post('/api/logout');
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body).toEqual({ ok: true });

    const meAfterLogout = await agent.get('/api/me');
    expect(meAfterLogout.statusCode).toBe(401);
  });

  test('serves static app shell and bundle', async () => {
    const rootRes = await request(app).get('/');
    expect(rootRes.statusCode).toBe(200);
    expect(rootRes.text).toContain('<div id="root">Loading...</div>');

    const bundleRes = await request(app).get('/static/js/bundle.js');
    expect(bundleRes.statusCode).toBe(200);
    expect(bundleRes.text).toContain('function Login({onLogin})');
  });
});
