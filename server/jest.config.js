module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    // Arquivo de entrada: só chama listen() e conecta ao banco, sem regra de negócio.
    '!src/server.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
}
