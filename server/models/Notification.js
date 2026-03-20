const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'worker_registration',
      'account_approved',
      'account_rejected',
      'issue_reported',
      'issue_assigned',
      'issue_resolved',
      'issue_escalated'
    ]
  },
  forRole: {
    type: String,
    enum: ['citizen', 'worker', 'admin']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);