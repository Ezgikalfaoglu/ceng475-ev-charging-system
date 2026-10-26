// API server entry point. OWNER: PM.
//   npm run dev     starts this server (with auto-restart) together with the Vite dev server
//   npm start       starts only this server; it also serves the built app from dist/
import { config } from './config.js';
import { createApp } from './app.js';

try {
  const { app, close } = await createApp({ serveStatic: true });
  const server = app.listen(config.port, () => {
    console.log(`VoltFlow API listening on http://localhost:${config.port}  (database: ${config.dbPath})`);
  });
  server.on('error', async (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${config.port} is already in use. Stop the other server or set PORT.` : err);
    await close();
    process.exit(1);
  });

  const shutdown = async () => {
    server.close();
    await close(); // waits for queued writes and releases the database lock
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (err) {
  console.error(`Could not start the server: ${err.message}`);
  process.exit(1);
}
