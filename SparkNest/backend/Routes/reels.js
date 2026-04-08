const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const Notification = require('../models/Notification');
const { protect } = require('../Middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, user } = req.query;

    let query = { isDeleted: false };
    if (user) {
      query.user = user;
    }

    const reels = await Reel.find(query)
      .populate('user', 'name email profilePic')
      .populate('comments.user', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reel.countDocuments(query);

    res.json({
      reels,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false })
      .populate('user', 'name email profilePic')
      .populate('comments.user', 'name profilePic');

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    reel.views += 1;
    await reel.save();

    res.json(reel);
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, caption, muted } = req.body;
    const video = req.files?.video?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!title || !video) {
      return res.status(400).json({ error: 'Title and video are required' });
    }

    const reel = await Reel.create({
      user: req.user._id,
      title,
      video: video.path || video.filename,
      thumbnail: thumbnail?.path || thumbnail?.filename || '',
      caption: caption || '',
      muted: muted === 'true'
    });

    const populatedReel = await Reel.findById(reel._id)
      .populate('user', 'name email profilePic');

    res.status(201).json(populatedReel);
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    if (reel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this reel' });
    }

    const { title, caption, thumbnail } = req.body;

    if (title) reel.title = title;
    if (caption !== undefined) reel.caption = caption;
    if (thumbnail !== undefined) reel.thumbnail = thumbnail;

    await reel.save();

    const updatedReel = await Reel.findById(reel._id)
      .populate('user', 'name email profilePic');

    res.json(updatedReel);
  } catch (error) {
    console.error('Update reel error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    if (reel.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this reel' });
    }

    reel.isDeleted = true;
    await reel.save();

    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    const isLiked = reel.likes.includes(req.user._id);

    if (isLiked) {
      reel.likes = reel.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      reel.likes.push(req.user._id);
      if (reel.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: reel.user,
          sender: req.user._id,
          type: 'like',
          reel: reel._id,
          text: 'liked your reel'
        });
      }
    }

    await reel.save();

    res.json({ 
      liked: !isLiked,
      likeCount: reel.likes.length
    });
  } catch (error) {
    console.error('Like reel error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    const comment = {
      user: req.user._id,
      text
    };

    reel.comments.push(comment);
    await reel.save();

    if (reel.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: reel.user,
        sender: req.user._id,
        type: 'comment',
        reel: reel._id,
        text: `commented on your reel: "${text.substring(0, 30)}..."`
      });
    }

    const updatedReel = await Reel.findById(reel._id)
      .populate('user', 'name profilePic')
      .populate('comments.user', 'name profilePic');

    res.status(201).json(updatedReel);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    const comment = reel.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (
      comment.user.toString() !== req.user._id.toString() &&
      reel.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await reel.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;