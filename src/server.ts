import app from './app';
import { disconnectDatabase } from './config/database';

const PORT = process.env['PORT'] || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`🗄️ Database: SQLite (dev.db)`);
});

async function gracefulShutdown(signal: string) {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    console.log('HTTP server closed');
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
