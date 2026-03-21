const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { upload } = require('../config/cloudinary');
const {
  createIssue,
  getAllIssues,
  getIssue,
  updateStatus,
  upvoteIssue,
  deleteIssue,
  assignIssue,
  uploadResolutionProof
} = require('../controllers/issueController');

// Create issue (citizen + admin)
router.post('/', auth, role('citizen', 'admin'), upload.array('images', 5), createIssue);

// Get all issues (public)
router.get('/', getAllIssues);

// Get single issue (public)
router.get('/:id', getIssue);

// Update status (worker + admin)
router.put('/:id/status', auth, role('worker', 'admin'), updateStatus);

// Upvote issue (citizen only)
router.put('/:id/upvote', auth, role('citizen'), upvoteIssue);

// Assign issue (admin only)
router.put('/:id/assign', auth, role('admin'), assignIssue);

// Upload resolution proof (worker only)
router.put('/:id/resolve', auth, role('worker'), upload.array('images', 5), uploadResolutionProof);

// Delete issue (admin only)
router.delete('/:id', auth, role('admin'), deleteIssue);

module.exports = router;