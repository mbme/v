const nodePlugins = [
  "@babel/plugin-transform-modules-commonjs",
];
const browserPlugins = [
  '@babel/plugin-syntax-jsx',
  '@babel/plugin-transform-react-jsx',
];
module.exports = {
  plugins: [
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-class-properties",
    ...(process.env.BROWSER_BUILD ? browserPlugins : nodePlugins),
  ],
};
