const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Only citizen and worker can register
    if (role === 'admin') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Worker starts as pending, citizen starts as active
    const status = role === 'worker' ? 'pending' : 'active';

    // Create user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status
    });

    // If worker — create notification for admin
    if (role === 'worker') {
      await Notification.create({
        message: `New worker registration: ${name} (${email}) is waiting for approval`,
        type: 'worker_registration',
        forRole: 'admin',
        userId: user._id
      });

      return res.status(201).json({
        message: 'Registration successful. Waiting for admin approval.',
        status: 'pending'
      });
    }

    // Generate token for citizen
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if worker is pending
    if (user.status === 'pending') {
      return res.status(400).json({ 
        message: 'Your account is pending approval',
        status: 'pending'
      });
    }

    // Check if worker is rejected
    if (user.status === 'rejected') {
      return res.status(400).json({ 
        message: 'Your account has been rejected',
        status: 'rejected'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve worker (admin only)
exports.approveWorker = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'worker') {
      return res.status(400).json({ message: 'User is not a worker' });
    }

    user.status = 'active';
    await user.save();

    // Create notification for worker
    await Notification.create({
      message: 'Your worker account has been approved! You can now login.',
      type: 'account_approved',
      forRole: 'worker',
      userId: user._id
    });

    res.status(200).json({ message: 'Worker approved successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject worker (admin only)
exports.rejectWorker = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'rejected';
    await user.save();

    // Create notification for worker
    await Notification.create({
      message: 'Your worker account registration has been rejected. Please contact admin.',
      type: 'account_rejected',
      forRole: 'worker',
      userId: user._id
    });

    res.status(200).json({ message: 'Worker rejected' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pending workers (admin only)
exports.getPendingWorkers = async (req, res) => {
  try {
    const workers = await User.find({ 
      role: 'worker', 
      status: 'pending' 
    }).select('-password');

    res.status(200).json(workers);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};