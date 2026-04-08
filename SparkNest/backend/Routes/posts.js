const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect } = require('../Middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, user, likedBy } = req.query;

    let query = { isDeleted: false };
    if (user) {
      query.user = user;
    }
    if (likedBy) {
      query.likes = likedBy;
    }

    const posts = await Post.find(query)
      .populate('user', 'name email profilePic')
      .populate('comments.user', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate('user', 'name email profilePic bio')
      .populate('comments.user', 'name profilePic');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { caption, image, tags } = req.body;

    if (!caption || !image) {
      return res.status(400).json({ error: 'Caption and image are required' });
    }

    const post = await Post.create({
      user: req.user._id,
      caption,
      image,
      tags: tags || []
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name email profilePic');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { caption, tags } = req.body;

    if (caption) post.caption = caption;
    if (tags) post.tags = tags;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name email profilePic');

    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id,
          text: 'liked your post'
        });
      }
    }

    await post.save();

    res.json({ 
      liked: !isLiked,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text
    };

    post.comments.push(comment);
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: `commented: "${text.substring(0, 30)}..."`
      });
    }

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePic')
      .populate('comments.user', 'name profilePic');

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;