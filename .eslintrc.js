module.exports = {
  "parserOptions": {
    "ecmaVersion": 8,
  },
  "env": {
    "node": true,
    "es6": true,
    "jest": true,
  },
  "extends": "eslint:recommended",
  "rules": {
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "never"
    ],
    "comma-dangle": [
      "error",
      "always-multiline"
    ],
    "no-console": "off",
  }
};
