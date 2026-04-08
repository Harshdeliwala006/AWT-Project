const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [40, 'Board name cannot exceed 40 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  }
}, {
  timestamps: true
});

boardSchema.index({ user: 1, createdAt: -1 });

boardSchema.virtual('postCount').get(function() {
  return this.posts.length;
});

boardSchema.set('toJSON', { virtuals: true });
boardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Board', boardSchema);