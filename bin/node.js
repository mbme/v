#!/usr/bin/env node

require('babel-register');

const path = require('path');

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

require(path.join(process.cwd(), process.argv[2])); // eslint-disable-line import/no-dynamic-require
