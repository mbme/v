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
      {
        "arrays": "only-multiline",
        "objects": "only-multiline",
        "imports": "only-multiline",
        "exports": "only-multiline",
        "functions": "never",
      }
    ],
    "no-console": "off",
  }
};
