const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  video: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    maxlength: [280, 'Caption cannot exceed 280 characters'],
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  muted: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reelSchema.index({ user: 1, createdAt: -1 });

reelSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

reelSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

reelSchema.set('toJSON', { virtuals: true });
reelSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reel', reelSchema);