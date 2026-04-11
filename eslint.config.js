// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
