module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // HU-11, HU-02, etc.
        'fix',      // Corrección de bugs
        'docs',     // Cambios en README o documentación
        'style',    // Formateo (Prettier/Lint)
        'refactor', // Refactorización de código
        'perf',     // Mejoras de rendimiento
        'test',     // Pruebas unitarias/E2E
        'build',    // Cambios en el sistema de construcción
        'ci',       // GitHub Actions / Workflows
        'chore',    // Tareas de mantenimiento
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
  },
};