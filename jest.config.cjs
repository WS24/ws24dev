module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/client/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\.(t|j)sx?$': ['babel-jest', { rootMode: 'upward' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/client/src/__tests__/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(wouter)/)',
  ],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    '!client/src/**/__tests__/**',
  ],
};

