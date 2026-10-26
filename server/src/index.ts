import app from './app';
import { config } from './config';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  CITY HOSPITAL PUNE - HEALTHCARE MANAGEMENT API    `);
  console.log(`  Port: ${PORT}                                     `);
  console.log(`  Environment: Development (Demo Mode Active)      `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health `);
  console.log(`====================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
