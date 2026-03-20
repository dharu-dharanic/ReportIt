const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  register,
  login,
  approveWorker,
  rejectWorker,
  getPendingWorkers,
  getAllUsers
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin only routes
router.get('/pending-workers', auth, role('admin'), getPendingWorkers);
router.get('/users', auth, role('admin'), getAllUsers);
router.put('/approve/:id', auth, role('admin'), approveWorker);
router.put('/reject/:id', auth, role('admin'), rejectWorker);

module.exports = router;