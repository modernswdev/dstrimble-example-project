//Setup tests
const {
  AUTH_TOKEN,
  hasValidAuthToken,
  normalizedQuery,
} = require('../lib/search-utils');


describe('search-utils unit tests', () => {
   
  // Tests for different failure types
  test('search has valid auth token', () => {
      expect(hasValidAuthToken(AUTH_TOKEN)).toBe(true);
  });
  test('search query text is normalized', () => {
      expect(normalizedQuery({ searchQuery: '  widget3  '})).toEqual({
          searchQuery: 'widget3'
      });
  });
  test('search query handles missing or invalid input', () => {
      expect(normalizedQuery()).toEqual({
          searchQuery: ''
      });
      expect(normalizedQuery({ searchQuery: 42 })).toEqual({
          searchQuery: ''
      });
  });
  

});
