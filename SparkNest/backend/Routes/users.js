const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../Middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name email profilePic')
      .populate('following', 'name email profilePic');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/preferences', protect, async (req, res) => {
  try {
    const { notifications, privacy } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences?.notifications?.toObject?.() ?? user.preferences?.notifications ?? {},
        ...notifications
      };
    }

    if (privacy) {
      user.preferences.privacy = {
        ...user.preferences?.privacy?.toObject?.() ?? user.preferences?.privacy ?? {},
        ...privacy
      };
    }

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
    } else {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ 
      following: !isFollowing,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name email profilePic bio');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name email profilePic bio');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;