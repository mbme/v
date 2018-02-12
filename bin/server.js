import startServer from 'server';

async function run() {
  if (process.env.NODE_ENV !== 'production') console.warn('WARN: server should run in production mode');

  const args = process.argv.slice(3);
  const rootDir = args[0];
  if (!rootDir) throw new Error('rootDir must be provided');

  const port = 8080;
  const server = await startServer(port, { rootDir });
  console.log(`Server listening on http://localhost:${port}`);

  const close = async () => {
    console.log('Stopping...');
    await server.close();
    process.exit(1);
  };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

run();
