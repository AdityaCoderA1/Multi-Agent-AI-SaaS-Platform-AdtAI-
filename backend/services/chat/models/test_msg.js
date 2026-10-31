import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './message.model.js';
import Conversation from './conversation.model.js';

dotenv.config();

async function run() {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL is not configured.");
    }
    await mongoose.connect(mongoUrl);
    
    // Pick an existing conversation
    const conv = await Conversation.findOne();
    if (!conv) {
      console.log("No conversation found.");
      process.exit(0);
    }
    console.log("Using conv:", conv._id);
    
    const message = await Message.create({
      conversationId: conv._id,
      role: 'user',
      content: 'test',
      parentId: null
    });
    
    console.log("Created message:", message._id);
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

run();
