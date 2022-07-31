module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'max-len': ['error', {
      'code': 120,
      'tabWidth': 2,
      'ignoreTrailingComments': true,
      'ignoreTemplateLiterals': true,
      'ignoreRegExpLiterals': true,
    }],
  },
};
