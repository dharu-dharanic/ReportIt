const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['road', 'garbage', 'water', 'electricity', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['reported', 'assigned', 'in-progress', 'resolved'],
    default: 'reported'
  },
  severity: {
    type: String,
    enum: ['critical', 'moderate', 'minor'],
    default: 'minor'
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  images: [{
    type: String
  }],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolutionImages: [{
    type: String
  }],
  escalated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geospatial index
IssueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', IssueSchema);