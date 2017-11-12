module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es6: true,
  },
  globals: {
    __DEVELOPMENT__: true,
    __CLIENT__: true,
  },
  overrides: [
    {
      files: [
        'client/**/*.js',
        'client/**/*.jsx',
      ],
      env: {
        browser: true,
      },
    },
    {
      files: [
        'server/**/*.js',
      ],
      env: {
        node: true,
      },
    },
  ],
  extends: [ 'airbnb' ],
  plugins: [ 'react' ],
  rules: {
    'max-len': 0,
    'no-console': 0,
    'no-confusing-arrow': 0,
    'no-unused-expressions': [
      'error',
      {
        allowTernary: true,
        allowShortCircuit: true,
      },
    ],
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          '__DEVELOPMENT__',
          '__CLIENT__',
        ],
      },
    ],
    'prefer-arrow-callback': 0,
    'prefer-template': 0,
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'semi': [
      'error',
      'never',
    ],
    'quote-props': [
      'error',
      'consistent-as-needed',
    ],
    'react/require-default-props': 0,
    'react/forbid-prop-types': 0,
    'react/sort-comp': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'function-paren-newline': [
      'error',
      'consistent',
    ],
    'object-curly-newline': [
      'error',
      {
        multiline: true,
        consistent: true,
      },
    ],
    'array-bracket-spacing': [
      'error',
      'always',
    ],
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: [ '.', 'node_modules' ]
      },
    },
  },
}
