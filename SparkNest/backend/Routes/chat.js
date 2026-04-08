const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../Middleware/auth');

router.get('/conversations', protect, async (req, res) => {
  try {

    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email profilePic isOnline lastSeen');

    const conversations = await Promise.all(
      users.map(async (user) => {

        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, receiver: user._id },
            { sender: user._id, receiver: req.user._id }
          ]
        })
        .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: req.user._id,
          isRead: false
        });

        return {
          user,
          lastMessage: lastMessage || null,
          unreadCount
        };
      })
    );

    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || 0;
      const timeB = b.lastMessage?.createdAt || 0;
      return timeB - timeA;
    });

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name profilePic')
    .populate('receiver', 'name profilePic')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    messages.reverse();

    await Message.updateMany(
      { 
        sender: req.params.userId, 
        receiver: req.user._id, 
        isRead: false 
      },
      { 
        isRead: true,
        readAt: Date.now()
      }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    });

    res.json({
      messages,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:userId', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const receiver = await User.findById(req.params.userId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      text
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profilePic')
      .populate('receiver', 'name profilePic');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/mark-read/:userId', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        sender: req.params.userId, 
        receiver: req.user._id, 
        isRead: false 
      },
      { 
        isRead: true,
        readAt: Date.now()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await message.deleteOne();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;