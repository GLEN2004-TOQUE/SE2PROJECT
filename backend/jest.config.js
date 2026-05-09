module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["**/*.js", "!jest.config.js", "!**/node_modules/**"],
};

