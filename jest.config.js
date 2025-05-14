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
    '**/tools/**/*.spec.ts', // Hinzugefügt für das tools-Verzeichnis
    '**/tools/**/*.test.ts', // Hinzugefügt für das tools-Verzeichnis
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tools/validators/tsconfig.json',
      },
    ],
  },
  // Ggf. weitere nx-spezifische Konfigurationen hier einfügen,
  // falls die globale Konfiguration nicht ausreicht.
  // Für ein von Nx verwaltetes Projekt ist es oft besser,
  // die von Nx generierte Konfiguration zu erweitern.
  // Wenn eine jest.preset.js von Nx existiert, sollte diese hier verwendet werden:
  // preset: './jest.preset.js', // Beispiel
};