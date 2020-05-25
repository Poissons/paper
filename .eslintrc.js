module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'script',
  },
  env: {
    browser: true,
    node: false,
    es6: true,
  },
  plugins: ['html'],
  extends: ['eslint:recommended', 'plugin:flowtype/recommended', 'standard'],
  rules: {
    indent: ['error', 2],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'comma-dangle': ['error', 'only-multiline'],
    'linebreak-style': ['error', 'unix'],
    'eol-last': ['error', 'always'],
    'wrap-iife': ['error', 'inside'],
  },
}
