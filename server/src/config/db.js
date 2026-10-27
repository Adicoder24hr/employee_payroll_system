const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the configured connection URI.
 */
async function connectDB(uri) {
  const mongoURI = uri || process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Disconnects from MongoDB.
 */
async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = {
  connectDB,
  disconnectDB,
};
