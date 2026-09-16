import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/**', '*report/**', '*results/**', 'evidence/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.mjs', '**/*.ts'], languageOptions: { globals: globals.node } },
  { files: ['demo/public/*.js'], languageOptions: { globals: globals.browser } },
);
