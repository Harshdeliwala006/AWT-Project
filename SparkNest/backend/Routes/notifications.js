const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../Middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    let query = { recipient: req.user._id };
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name profilePic')
      .populate('post', 'image caption')
      .populate('reel', 'video title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.json({
      notifications,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await notification.remove();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });

    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;