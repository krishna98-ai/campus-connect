const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/index');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect to MongoDB then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Campus Connect server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});
