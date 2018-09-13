import path from 'path';
import repl from 'repl';

export default function run() {
  const basePath = path.resolve(__dirname, '..');
  const nodeModulePath = path.resolve(basePath, 'node_modules');

  function clearRequireCache() {
    for (const fileName of Object.keys(require.cache)) {
      if (!fileName.startsWith(basePath) || fileName.startsWith(nodeModulePath)) continue;

      delete require.cache[fileName];
    }
  }

  const clearScreen = () => process.stdout.write('\x1Bc');

  const r = repl.start({ prompt: '[v] > ' });
  r.on('reset', clearRequireCache);
  r.on('reset', clearScreen);
}
