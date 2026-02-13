import mongoose from 'mongoose';
import { UserModel } from '../modules/users/user.schema';
import { ENV } from '../config/env';

/**
 * Backfill User Identity Script
 * 
 * Goal: Populate missing username and displayName for existing records.
 */

async function backfill() {
  try {
    console.log('--- STARTING IDENTITY BACKFILL ---');
    
    // 1. Connect to DB
    await mongoose.connect(ENV.DATABASE_URL);
    console.log('Connected to MongoDB.');

    // 2. Identify target users
    const users = await UserModel.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' },
        { displayName: { $exists: false } },
        { displayName: null },
        { displayName: '' }
      ]
    });

    console.log(`Found ${users.length} users requiring update.`);

    if (users.length === 0) {
      console.log('All users have identities. Nothing to do.');
      return;
    }

    let scannedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      scannedCount++;
      const email = user.email;
      let needsUpdate = false;

      // --- DISPLAY NAME LOGIC ---
      if (!user.displayName) {
        // Fallback: Use email local part capitalized or 'Member'
        const emailPrefix = email.split('@')[0];
        user.displayName = (emailPrefix && emailPrefix.length > 0)
          ? (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1))
          : 'Member';
        needsUpdate = true;
      }

      // --- USERNAME LOGIC ---
      if (!user.username) {
        // Refined: alphanumeric + underscores
        let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        if (!baseUsername) baseUsername = 'user';

        // Ensure uniqueness
        let finalUsername = baseUsername;
        let suffix = 1;
        
        while (await UserModel.findOne({ username: finalUsername, _id: { $ne: user._id } })) {
          finalUsername = `${baseUsername}_${suffix}`; // Use underscore for suffix too
          suffix++;
        }

        user.username = finalUsername;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Scanned: ${scannedCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('--- BACKFILL COMPLETE ---');

  } catch (error) {
    console.error('Backfill failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

backfill();
