const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  path: {
    type: String,
    required: true
  },
  isFolder: {
    type: Boolean,
    default: false
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }]
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'write'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  files: [fileSchema],
  activeUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    cursor: {
      line: Number,
      column: Number
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: 'javascript'
  }
}, {
  timestamps: true
});

// Index for efficient queries
projectSchema.index({ owner: 1, 'collaborators.user': 1 });
projectSchema.index({ 'collaborators.user': 1 });

module.exports = mongoose.model('Project', projectSchema);