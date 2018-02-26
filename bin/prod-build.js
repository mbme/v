import path from 'path';
import webpack from 'webpack'; // eslint-disable-line import/no-extraneous-dependencies
import webpackConfig from '../webpack.config.babel';
import { rmrfSync } from '../server/utils';

rmrfSync(path.resolve(__dirname, '../dist'));

webpack(webpackConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('prod build failed', err);
  }
  console.log(stats.toString({ colors: true }));
});
