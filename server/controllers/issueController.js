const Issue = require('../models/Issue');

// Create Issue
exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, address, coordinates, isAnonymous } = req.body;

    const severity = 'minor';
    let deadline = new Date();
    if (severity === 'critical') deadline.setHours(deadline.getHours() + 24);
    else if (severity === 'moderate') deadline.setDate(deadline.getDate() + 7);
    else deadline.setDate(deadline.getDate() + 30);

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
      isAnonymous: isAnonymous === 'true' || isAnonymous === true || false,
      deadline
    });

    // Emit new issue to all users on issues page
    const io = req.app.get('io');
    if (io) {
      io.to('issues').emit('newIssue', issue);
    }

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

    // Emit status update to reporter
    const io = req.app.get('io');
    if (io) {
      // Notify reporter
      io.to(issue.reporter.toString()).emit('issueUpdated', {
        issueId: issue._id,
        status: issue.status,
        message: `Your issue "${issue.title}" status updated to ${status}`
      });
      // Notify all on issues page
      io.to('issues').emit('issueStatusChanged', {
        issueId: issue._id,
        status: issue.status
      });
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

    if (issue.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    issue.upvotes.push(req.user.id);
    issue.upvoteCount = issue.upvotes.length;

    if (issue.upvoteCount >= 50) issue.severity = 'critical';
    else if (issue.upvoteCount >= 20) issue.severity = 'moderate';

    await issue.save();

    // Emit upvote update to issues room
    const io = req.app.get('io');
    if (io) {
      io.to('issues').emit('issueUpvoted', {
        issueId: issue._id,
        upvoteCount: issue.upvoteCount,
        severity: issue.severity
      });
    }

    res.status(200).json({
      message: 'Upvoted successfully',
      upvoteCount: issue.upvoteCount
    });

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

    // Emit deletion to issues room
    const io = req.app.get('io');
    if (io) {
      io.to('issues').emit('issueDeleted', { issueId: issue._id });
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

    const Notification = require('../models/Notification');
    await Notification.create({
      message: `You have been assigned a new issue: ${issue.title}`,
      type: 'issue_assigned',
      forRole: 'worker',
      userId: workerId
    });

    // Emit to assigned worker
    const io = req.app.get('io');
    if (io) {
      io.to(workerId.toString()).emit('issueAssigned', {
        issueId: issue._id,
        message: `New issue assigned: ${issue.title}`
      });
    }

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

    const Notification = require('../models/Notification');
    await Notification.create({
      message: `Your reported issue "${issue.title}" has been resolved!`,
      type: 'issue_resolved',
      forRole: 'citizen',
      userId: issue.reporter
    });

    // Emit resolution to reporter
    const io = req.app.get('io');
    if (io) {
      io.to(issue.reporter.toString()).emit('issueResolved', {
        issueId: issue._id,
        message: `Your issue "${issue.title}" has been resolved!`
      });
      io.to('issues').emit('issueStatusChanged', {
        issueId: issue._id,
        status: 'resolved'
      });
    }

    res.status(200).json({ message: 'Resolution proof uploaded', issue });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};