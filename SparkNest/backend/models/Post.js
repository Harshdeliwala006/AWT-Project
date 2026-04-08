const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }, 
  reported: {
    type: Boolean,
    default: false
  },
  reports: [{
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}]
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    maxlength: [280, 'Caption cannot exceed 280 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);