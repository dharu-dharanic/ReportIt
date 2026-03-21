const Issue = require('../models/Issue');

// Create Issue
exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, address, coordinates, isAnonymous } = req.body;

    // Set deadline based on severity
    const severity = 'minor';
    let deadline = new Date();
    if (severity === 'critical') deadline.setHours(deadline.getHours() + 24);
    else if (severity === 'moderate') deadline.setDate(deadline.getDate() + 7);
    else deadline.setDate(deadline.getDate() + 30);

    // Get image urls from cloudinary
    const images = req.files ? req.files.map(file => file.path) : [];

    const issue = await Issue.create({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: JSON.parse(coordinates),
        address
      },
      images,
      reporter: req.user.id,
      isAnonymous: isAnonymous || false,
      deadline
    });

    res.status(201).json({ message: 'Issue reported successfully', issue });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Issues
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(issues);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Issue
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json(issue);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Issue Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({ message: 'Status updated', issue });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upvote Issue
exports.upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if already upvoted
    if (issue.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    issue.upvotes.push(req.user.id);
    issue.upvoteCount = issue.upvotes.length;

    // Auto set severity based on upvotes
    if (issue.upvoteCount >= 50) issue.severity = 'critical';
    else if (issue.upvoteCount >= 20) issue.severity = 'moderate';

    await issue.save();

    res.status(200).json({ message: 'Upvoted successfully', upvoteCount: issue.upvoteCount });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Issue
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({ message: 'Issue deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign Issue to Worker
exports.assignIssue = async (req, res) => {
  try {
    const { workerId } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: workerId,
        status: 'assigned'
      },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Create notification for worker
    const Notification = require('../models/Notification');
    await Notification.create({
      message: `You have been assigned a new issue: ${issue.title}`,
      type: 'issue_assigned',
      forRole: 'worker',
      userId: workerId
    });

    res.status(200).json({ message: 'Issue assigned successfully', issue });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload Resolution Proof
exports.uploadResolutionProof = async (req, res) => {
  try {
    const images = req.files ? req.files.map(file => file.path) : [];

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        resolutionImages: images,
        status: 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Create notification for reporter
    const Notification = require('../models/Notification');
    await Notification.create({
      message: `Your reported issue "${issue.title}" has been resolved!`,
      type: 'issue_resolved',
      forRole: 'citizen',
      userId: issue.reporter
    });

    res.status(200).json({ message: 'Resolution proof uploaded', issue });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};