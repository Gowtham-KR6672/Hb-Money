import mongoose from 'mongoose';

export default async function connectDb() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hb-money';
  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    error.message = `MongoDB connection failed for URI "${mongoUri}". ${error.message}`;
    throw error;
  }
}
