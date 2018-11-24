module.exports = {
  parser: 'babel-eslint',
  globals: {
    __DEVELOPMENT__: true,
    __SERVER__: true,
    global: true,
    noop: true,
    process: true,
    console: true,
  },
  overrides: [
    {
      files: [
        'src/client/**/*.js',
        'src/client/**/*.jsx',
        'src/web-client/**/*.js',
        'src/web-client/**/*.jsx',
      ],
      env: {
        browser: true,
      },
    },
    {
      files: [
        'src/server/**/*.js',
        '**/*.test.js',
      ],
      env: {
        node: true,
      },
    },
  ],
  extends: [ 'airbnb', 'plugin:import/errors', 'plugin:import/warnings'],
  plugins: [ 'babel' ],
  settings: {
    react: {
      pragma: 'React',
      version: require('./package.json').dependencies.react,
    },
  },
  rules: {
    'max-len': 0,
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
    'no-underscore-dangle': 0,
    'no-prototype-builtins': 0,
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
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'prefer-promise-reject-errors': 0,
    'prefer-destructuring': 0,

    'react/require-default-props': 0,
    'react/forbid-prop-types': 0,
    'react/sort-comp': 0,
    'react/destructuring-assignment': 0,
    'react/jsx-one-expression-per-line': 0,

    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,

    'import/no-cycle': 0,
    'import/prefer-default-export': 0,

    'babel/semi': 2,
  },
}
