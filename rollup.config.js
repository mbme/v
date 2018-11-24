import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import babelMinify from 'rollup-plugin-babel-minify';
import replace from 'rollup-plugin-replace';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/web-client/index.jsx',

  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true,
  },

  plugins: [
    nodeResolve({
      jsnext: true,
      extensions: [ '.mjs', '.js', '.jsx' ],
    }),

    babel({ exclude: 'node_modules/**' }),

    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.LOG': JSON.stringify(process.env.LOG),
      __SERVER__: JSON.stringify(false),
    }),

    commonjs({
      namedExports: {
        'node_modules/react/index.js': [
          'Component',
          'PureComponent',
          'Fragment',
          'StrictMode',
        ],
      },
    }),

    isProduction && babelMinify({ comments: false }),
  ],
};
