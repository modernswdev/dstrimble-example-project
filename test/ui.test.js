const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const bundlePath = path.join(__dirname, '..', 'public', 'static', 'js', 'bundle.js');
const bundleSource = fs.readFileSync(bundlePath, 'utf8');

function makeJsonResponse(ok, body) {
  return {
    ok,
    status: ok ? 200 : 401,
    json: async () => body,
  };
}

async function waitForUpdates(window, turns = 4) {
  for (let index = 0; index < turns; index += 1) {
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

describe('UI tests - bundle.js app behavior', () => {
  test('renders login form when unauthenticated', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root">Loading...</div></body></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });

    const fetchMock = jest.fn(async (url) => {
      if (url === '/api/me') return makeJsonResponse(false, { error: 'unauthorized' });
      throw new Error(`Unexpected URL: ${url}`);
    });

    dom.window.fetch = fetchMock;
    dom.window.alert = jest.fn();

    dom.window.eval(bundleSource);
    await waitForUpdates(dom.window);

    const usernameInput = dom.window.document.querySelector('input[placeholder="username"]');
    const passwordInput = dom.window.document.querySelector('input[placeholder="password"]');
    const loginButton = dom.window.document.querySelector('button');

    expect(usernameInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(loginButton).not.toBeNull();
    expect(loginButton.textContent).toBe('Login');
    expect(fetchMock).toHaveBeenCalledWith('/api/me');
  });

  test('submits login and renders widgets on success', async () => {
    const widgets = [
      { id: 1, name: 'Widget A', description: 'A basic widget', price: '9.99' },
      { id: 2, name: 'Widget B', description: 'An advanced widget', price: '19.99' },
    ];

    const dom = new JSDOM('<!doctype html><html><body><div id="root">Loading...</div></body></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });

    let meChecks = 0;
    const fetchMock = jest.fn(async (url, options = {}) => {
      if (url === '/api/me') {
        meChecks += 1;
        if (meChecks === 1) return makeJsonResponse(false, { error: 'unauthorized' });
        return makeJsonResponse(true, { username: 'admin' });
      }
      if (url === '/api/login' && options.method === 'POST') {
        return makeJsonResponse(true, { ok: true });
      }
      if (url === '/api/widgets') {
        return makeJsonResponse(true, widgets);
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    dom.window.fetch = fetchMock;
    dom.window.alert = jest.fn();

    dom.window.eval(bundleSource);
    await waitForUpdates(dom.window);

    const usernameInput = dom.window.document.querySelector('input[placeholder="username"]');
    const passwordInput = dom.window.document.querySelector('input[placeholder="password"]');
    const loginButton = dom.window.document.querySelector('button');

    usernameInput.value = 'admin';
    passwordInput.value = 'password';
    loginButton.dispatchEvent(new dom.window.Event('click'));

    await waitForUpdates(dom.window, 6);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const widgetsTitle = dom.window.document.querySelector('h2');
    expect(widgetsTitle).not.toBeNull();
    expect(widgetsTitle.textContent).toBe('Widgets');
    expect(dom.window.document.body.textContent).toContain('Widget A');
    expect(dom.window.document.body.textContent).toContain('Widget B');
    expect(dom.window.alert).not.toHaveBeenCalled();
  });

  test('shows alert when login request fails', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root">Loading...</div></body></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });

    const fetchMock = jest.fn(async (url, options = {}) => {
      if (url === '/api/me') return makeJsonResponse(false, { error: 'unauthorized' });
      if (url === '/api/login' && options.method === 'POST') return makeJsonResponse(false, { ok: false });
      throw new Error(`Unexpected request: ${url}`);
    });

    dom.window.fetch = fetchMock;
    dom.window.alert = jest.fn();

    dom.window.eval(bundleSource);
    await waitForUpdates(dom.window);

    const usernameInput = dom.window.document.querySelector('input[placeholder="username"]');
    const passwordInput = dom.window.document.querySelector('input[placeholder="password"]');
    const loginButton = dom.window.document.querySelector('button');

    usernameInput.value = 'admin';
    passwordInput.value = 'bad-password';
    loginButton.dispatchEvent(new dom.window.Event('click'));

    await waitForUpdates(dom.window, 6);

    expect(dom.window.alert).toHaveBeenCalledWith('login failed');
    expect(dom.window.document.querySelector('h2')).toBeNull();
    expect(dom.window.document.querySelector('input[placeholder="username"]')).not.toBeNull();
  });

  test('shows widgets load failure message for authenticated users when /api/widgets fails', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root">Loading...</div></body></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });

    const fetchMock = jest.fn(async (url) => {
      if (url === '/api/me') return makeJsonResponse(true, { username: 'admin' });
      if (url === '/api/widgets') return makeJsonResponse(false, { error: 'unauthorized' });
      throw new Error(`Unexpected request: ${url}`);
    });

    dom.window.fetch = fetchMock;
    dom.window.alert = jest.fn();

    dom.window.eval(bundleSource);
    await waitForUpdates(dom.window, 6);

    expect(dom.window.document.body.textContent).toContain('Failed to load widgets');
  });

  test('logout posts to /api/logout and returns to login form', async () => {
    const widgets = [
      { id: 1, name: 'Widget A', description: 'A basic widget', price: '9.99' },
    ];

    const dom = new JSDOM('<!doctype html><html><body><div id="root">Loading...</div></body></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });

    let meChecks = 0;
    const fetchMock = jest.fn(async (url, options = {}) => {
      if (url === '/api/me') {
        meChecks += 1;
        if (meChecks === 1) return makeJsonResponse(true, { username: 'admin' });
        return makeJsonResponse(false, { error: 'unauthorized' });
      }
      if (url === '/api/widgets') return makeJsonResponse(true, widgets);
      if (url === '/api/logout' && options.method === 'POST') return makeJsonResponse(true, { ok: true });
      throw new Error(`Unexpected request: ${url}`);
    });

    dom.window.fetch = fetchMock;
    dom.window.alert = jest.fn();

    dom.window.eval(bundleSource);
    await waitForUpdates(dom.window, 6);

    const logoutButton = Array.from(dom.window.document.querySelectorAll('button'))
      .find((button) => button.textContent === 'Logout');

    expect(logoutButton).toBeDefined();
    logoutButton.dispatchEvent(new dom.window.Event('click'));

    await waitForUpdates(dom.window, 6);

    expect(fetchMock).toHaveBeenCalledWith('/api/logout', { method: 'POST' });
    expect(dom.window.document.querySelector('input[placeholder="username"]')).not.toBeNull();
  });
});
