import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.PORT ?? 3001);

const server = app.listen(port, () => {
  console.log(`API em http://localhost:${port}/api/v1`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);