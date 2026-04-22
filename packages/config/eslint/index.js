/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**'],
  },
  {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'off',
    },
  },
];

module.exports = config;
