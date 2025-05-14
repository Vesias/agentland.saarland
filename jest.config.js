module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.spec.ts',
    '**/tests/unit/**/*.test.ts',
    '**/tests/integration/**/*.spec.ts',
    '**/tests/integration/**/*.test.ts',
    '**/libs/**/*.spec.ts',
    '**/libs/**/*.test.ts',
    '**/apps/**/*.spec.ts',
    '**/apps/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Optional: Fügen Sie hier weitere Jest-Konfigurationen hinzu, falls erforderlich.
  // z.B. Coverage-Berichte, Setup-Dateien etc.
  // coverageDirectory: 'coverage',
  // collectCoverageFrom: [
  //   'apps/**/*.{ts,tsx}',
  //   'libs/**/*.{ts,tsx}',
  //   '!**/node_modules/**',
  //   '!**/vendor/**',
  // ],
};