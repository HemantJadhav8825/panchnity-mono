import mongoose from 'mongoose';
import { ENV } from '../config/env';
import { logDbConnection } from '@panchnity/utils';

export const connectDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(ENV.DATABASE_URL);
    
    logDbConnection('auth-service', ENV.DATABASE_URL);
  } catch (err: any) {
    console.error('❌ FATAL: Database connection failed:');
    console.error(`   - ${err.message || 'Unknown error'}`);
    process.exit(1);
  }
};
