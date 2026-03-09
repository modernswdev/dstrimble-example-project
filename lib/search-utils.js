const AUTH_TOKEN = 'fake-jwt-token';

function hasValidAuthToken(token) {
  return token === AUTH_TOKEN;
}

function normalizedQuery(input) {
  const payload = input || {};
  return {
    searchQuery: typeof payload.searchQuery === 'string' ? payload.searchQuery.trim() : '',
  };
}

module.exports = {
  AUTH_TOKEN,
  hasValidAuthToken,
  normalizedQuery,
};