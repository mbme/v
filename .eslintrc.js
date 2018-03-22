module.exports = {
  parser: 'babel-eslint',
  globals: {
    __DEVELOPMENT__: true,
    __CLIENT__: true,
    global: true,
    console: true,
    noop: true,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: [ __dirname ],
      },
    },
  },
  overrides: [
    {
      files: [
        'shared/**/*.js',
      ],
      env: {
        node: false,
        browser: false,
      },
    },
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
        '**/*.test.js',
      ],
      env: {
        node: true,
      },
    },
  ],
  extends: [ 'airbnb', 'plugin:import/errors', 'plugin:import/warnings'],
  plugins: [ 'babel' ],
  rules: {
    'max-len': 0,
    'no-console': 0,
    'no-confusing-arrow': 0,
    'no-await-in-loop': 0,
    'no-labels': 0,
    'no-extra-label': 0,
    'no-continue': 0,
    'no-unused-expressions': [
      'error',
      {
        allowTernary: true,
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
    'quote-props': 0,
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
      'WithStatement',
    ],

    'react/require-default-props': 0,
    'react/forbid-prop-types': 0,
    'react/sort-comp': 0,

    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,

    "babel/semi": 2,
  },
}
