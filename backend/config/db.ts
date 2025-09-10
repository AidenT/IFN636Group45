// config/db.ts
import mongoose from 'mongoose';

// Set strictQuery explicitly to suppress the warning
// mongoose.set('strictQuery', true);

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);  // Remove deprecated options
    console.log("MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Export using both CommonJS and ES6 for compatibility
export default connectDB;
//module.exports = connectDB;
