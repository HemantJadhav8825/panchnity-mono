import mongoose from 'mongoose';
import { ENV } from '../config/env';

export const connectDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(ENV.DATABASE_URL);
    
    console.log('✅ Chat Service DB connected:', ENV.DATABASE_URL);
  } catch (err: any) {
    console.error('❌ FATAL: Database connection failed:');
    console.error(`   - ${err.message || 'Unknown error'}`);
    process.exit(1);
  }
};
