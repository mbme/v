#!/usr/bin/env node

require('@babel/register');

const path = require('path');

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
global.__SERVER__ = true;
global.noop = () => {};

const { default: run } = require(path.join(process.cwd(), process.argv[2])); // eslint-disable-line import/no-dynamic-require

Promise.resolve(run(...process.argv.slice(3))).catch((e) => {
  console.error('process failed', e); // eslint-disable-line no-console
  process.exit(2);
});
