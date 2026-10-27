require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Attempt database connection
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn('[Warning] MONGODB_URI is not set. Database not connected yet.');
    }

    app.listen(PORT, () => {
      console.log(`[Server] Payroll API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[Fatal] Could not start server: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
