module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!@i1k)/'],
  testPathIgnorePatterns: ['./test/cache-client.test.ts'],
}
