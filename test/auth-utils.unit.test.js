//Setup tests
const {
  AUTH_TOKEN,
  hasValidAuthToken,
  normalizeCredentials,
  hasLoginFields,
} = require('../lib/auth-utils');


describe('auth-utils unit tests', () => {
   
  // Tests for different failure types
  test('hasValidAuthToken returns true only for the expected auth token', () => {
    expect(hasValidAuthToken(AUTH_TOKEN)).toBe(true);
    expect(hasValidAuthToken('wrong-token')).toBe(false);
    expect(hasValidAuthToken(undefined)).toBe(false);
    expect(hasValidAuthToken(null)).toBe(false);
  });

   // Tests for functionality 
  test('normalizeCredentials trims username and preserves password value', () => {
    expect(normalizeCredentials({ username: '  admin  ', password: 'password' })).toEqual({
      username: 'admin',
      password: 'password',
    });

    expect(normalizeCredentials({ username: 42, password: ['not-a-string'] })).toEqual({
      username: '',
      password: '',
    });

    expect(normalizeCredentials()).toEqual({
      username: '',
      password: '',
    });
  });

   test('hasLoginFields enforces non-empty username and password', () => {
    expect(hasLoginFields({ username: 'admin', password: 'password' })).toBe(true);
    expect(hasLoginFields({ username: '   ', password: 'password' })).toBe(false);
    expect(hasLoginFields({ username: 'admin', password: '' })).toBe(false);
    expect(hasLoginFields({})).toBe(false);
  });
});
