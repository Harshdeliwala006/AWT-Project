const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const { protect } = require('../Middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { user, search } = req.query;

    let query = {};
    
    if (user) {
      query.user = user;
    } else {
      query.isPrivate = false;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const boards = await Board.find(query)
      .populate('user', 'name email profilePic')
      .populate('posts', 'image caption likes')
      .sort({ createdAt: -1 });

    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user._id })
      .populate('posts', 'image caption likes comments')
      .sort({ createdAt: -1 });

    res.json(boards);
  } catch (error) {
    console.error('Get my boards error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('user', 'name email profilePic')
      .populate({
        path: 'posts',
        populate: {
          path: 'user',
          select: 'name profilePic'
        }
      });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.isPrivate && (!req.user || board.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'This board is private' });
    }

    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, isPrivate, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board = await Board.create({
      user: req.user._id,
      name,
      isPrivate: isPrivate || false,
      description: description || ''
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('user', 'name email profilePic');

    res.status(201).json(populatedBoard);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this board' });
    }

    const { name, isPrivate, description } = req.body;

    if (name) board.name = name;
    if (isPrivate !== undefined) board.isPrivate = isPrivate;
    if (description !== undefined) board.description = description;

    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('user', 'name email profilePic')
      .populate('posts', 'image caption');

    res.json(updatedBoard);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this board' });
    }

    await board.remove();

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:id/posts/:postId', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this board' });
    }

    if (board.posts.includes(req.params.postId)) {
      return res.status(400).json({ error: 'Post already saved to this board' });
    }

    board.posts.push(req.params.postId);
    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('posts', 'image caption likes');

    res.json(updatedBoard);
  } catch (error) {
    console.error('Add post to board error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.delete('/:id/posts/:postId', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this board' });
    }

    board.posts = board.posts.filter(
      postId => postId.toString() !== req.params.postId
    );

    await board.save();

    res.json({ message: 'Post removed from board' });
  } catch (error) {
    console.error('Remove post from board error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;