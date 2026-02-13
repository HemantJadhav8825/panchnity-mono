const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI =
  process.env.DATABASE_URL || "mongodb://localhost:27017/hold_yourself_chat";

async function verifyIndexes() {
  console.log("Connecting to database...");
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const Conversation = mongoose.connection.collection("conversations");
    const Message = mongoose.connection.collection("messages");

    console.log("\n--- Verify Conversations Indexes ---");
    const conversationIndexes = await Conversation.indexes();
    console.log(JSON.stringify(conversationIndexes, null, 2));

    // Check for new indexes
    const hasParticipantsLastMessage = conversationIndexes.some(
      (idx) => idx.key.participants === 1 && idx.key.lastMessageAt === -1,
    );
    const hasMuted = conversationIndexes.some(
      (idx) =>
        idx.key["participantSettings.userId"] === 1 &&
        idx.key["participantSettings.isMuted"] === 1,
    );

    if (hasParticipantsLastMessage)
      console.log("✅ Conversation compound index found");
    else console.error("❌ Conversation compound index MISSING");

    if (hasMuted) console.log("✅ Conversation muted index found");
    else console.error("❌ Conversation muted index MISSING");

    console.log("\n--- Verify Messages Indexes ---");
    const messageIndexes = await Message.indexes();
    console.log(JSON.stringify(messageIndexes, null, 2));

    // Check for new indexes
    const hasSender = messageIndexes.some(
      (idx) =>
        idx.key.conversationId === 1 &&
        idx.key.senderId === 1 &&
        idx.key.createdAt === -1,
    );
    const hasDelivered = messageIndexes.some(
      (idx) => idx.key.deliveredAt === 1,
    );
    const hasRead = messageIndexes.some((idx) => idx.key.readAt === 1);

    if (hasSender) console.log("✅ Message sender compound index found");
    else console.error("❌ Message sender compound index MISSING");

    if (hasDelivered) console.log("✅ Message deliveredAt index found");
    else console.error("❌ Message deliveredAt index MISSING");

    if (hasRead) console.log("✅ Message readAt index found");
    else console.error("❌ Message readAt index MISSING");
  } catch (error) {
    console.error("Error verifying indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDone.");
  }
}

verifyIndexes();
