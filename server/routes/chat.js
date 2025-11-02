const express = require('express');
const { Chat, Message } = require('../models/Chat');
const router = express.Router();

// Get all chats for a user
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const chats = await Chat.find({
      participants: decoded.userId,
      isActive: true
    }).populate('participants', 'username fullName avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to get chats' });
  }
});

// Get a specific chat with messages
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username fullName avatar status')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username fullName avatar'
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === decoded.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Failed to get chat' });
  }
});

// Create or get existing chat
router.post('/start', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { participantId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [decoded.userId, participantId] },
      isActive: true
    }).populate('participants', 'username fullName avatar status')
      .populate('lastMessage');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [decoded.userId, participantId],
        unreadCount: new Map([
          [decoded.userId.toString(), 0],
          [participantId.toString(), 0]
        ])
      });

      await chat.save();
      await chat.populate('participants', 'username fullName avatar status');
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ message: 'Failed to start chat' });
  }
});

// Send a message
router.post('/:id/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { content, type, metadata } = req.body;
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(decoded.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create new message
    const message = new Message({
      sender: decoded.userId,
      content,
      type: type || 'text',
      metadata
    });

    await message.save();

    // Update chat
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();

    // Update unread counts for other participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== decoded.userId) {
        const currentCount = chat.getUnreadCount(participantId);
        chat.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await chat.save();

    await message.populate('sender', 'username fullName avatar');

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark messages as read for this user
    await Message.updateMany(
      {
        chat: req.params.id,
        sender: { $ne: decoded.userId },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Update unread count
    chat.unreadCount.set(decoded.userId.toString(), 0);
    await chat.save();

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

module.exports = router;