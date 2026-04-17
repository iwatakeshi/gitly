module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverage: true,
  testEnvironment: 'node',
}
