const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../Middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Board = require('../models/Board');
const Notification = require('../models/Notification');

const getAudienceUsers = async (audience) => {
  switch (audience) {
    case 'all':
      return await User.find({});
    case 'active':
      return await User.find({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }); // last 30 days
    default:
      return [];
  }
};

router.get('/dashboard/stats', protect, isAdmin, async (req, res) => {
  const [users, posts, reels, boards] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ isDeleted: false }),
    Reel.countDocuments({ isDeleted: false }),
    Board.countDocuments()
  ]);
  res.json({ users, posts, reels, boards });
});

router.post('/admin/send', protect, isAdmin, async (req, res) => {
  try {
    const { title, message, type, audience } = req.body;
    
    const users = await getAudienceUsers(audience); 
    
    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: `admin-${type}`,
      text: `${title}: ${message}`,
      isRead: false
    }));
    
    await Notification.insertMany(notifications);
    
    res.json({ success: true, sent: notifications.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;