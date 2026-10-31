import Conversation
  from "../models/conversation.model.js";

export const createConversation = async (req, res) => {

  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId)
    const conversation = await Conversation.create({
      userId: userId
    });

    res.json(
      conversation
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

}


export const getConversations = async (req, res) => {

  try {
    const userId = req.headers["x-user-id"];
    const conversations = await Conversation.find({

      userId: userId

    })
      .sort({
        updatedAt: -1
      });

    res.json(
      conversations
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

}

import Message
  from "../models/message.model.js";

export const saveMessage = async (req, res) => {

  try {
    const userId = req.headers["x-user-id"];
    const {
      conversationId,
      role,
      content,
      images,
      artifacts,
      parentId
    } = req.body;

    // Authorization check
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(403).json({ message: "Forbidden: You do not own this conversation." });
    }

    const message = await Message.create({
      conversationId,
      role,
      images,
      content,
      parentId: parentId || null,
      artifacts: artifacts || []
    });

    res.json(
      message
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

}



export const getMessages = async (req, res) => {

  try {
    const userId = req.headers["x-user-id"];

    // Authorization check
    const conversation = await Conversation.findOne({ _id: req.params.id, userId });
    if (!conversation) {
      return res.status(403).json({ message: "Forbidden: You do not own this conversation." });
    }

    const messages = await Message.find({

      conversationId:
        req.params.id

    })
      .sort({
        createdAt: 1
      });

    res.json(
      messages
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

}


export const updateConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { conversationId, title } = req.body

    // Authorization check + update
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(403).json({ message: "Forbidden: You do not own this conversation." });
    }

    res.json(
      conversation
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
}

export const deleteConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const conversations = await Conversation.find({ userId: userId });
    const conversationIds = conversations.map(c => c._id);

    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ userId: userId });

    res.json({ message: "Conversations deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const conversationId = req.params.id;

    // Authorization check
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(403).json({ message: "Forbidden: You do not own this conversation." });
    }

    await Message.deleteMany({ conversationId: conversationId });
    await Conversation.deleteOne({ _id: conversationId, userId: userId });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}