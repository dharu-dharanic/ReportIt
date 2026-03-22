const cron = require('node-cron');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');

const startEscalationService = (io) => {

  // Runs every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running escalation check...');

    try {
      const now = new Date();

      // Find all unresolved overdue issues
      const overdueIssues = await Issue.find({
        status: { $in: ['reported', 'assigned', 'in-progress'] },
        deadline: { $lt: now },
        escalated: { $ne: true }
      }).populate('reporter', 'name email');

      console.log(`Found ${overdueIssues.length} overdue issues`);

      for (const issue of overdueIssues) {
        // Escalate severity
        if (issue.severity === 'minor') issue.severity = 'moderate';
        else if (issue.severity === 'moderate') issue.severity = 'critical';

        // Mark as escalated
        issue.escalated = true;

        // Extend deadline by 7 more days
        const newDeadline = new Date();
        newDeadline.setDate(newDeadline.getDate() + 7);
        issue.deadline = newDeadline;

        await issue.save();

        // Create notification for admin
        await Notification.create({
          message: `⚠️ Issue "${issue.title}" is overdue and has been escalated to ${issue.severity}`,
          type: 'issue_escalated',
          forRole: 'admin',
          userId: null
        });

        // Notify admin via socket
        if (io) {
          io.emit('issueEscalated', {
            issueId: issue._id,
            title: issue.title,
            severity: issue.severity,
            message: `Issue "${issue.title}" escalated to ${issue.severity}`
          });
        }

        // Notify reporter via socket
        if (io && issue.reporter) {
          io.to(issue.reporter._id.toString()).emit('issueUpdated', {
            issueId: issue._id,
            status: issue.status,
            message: `Your issue "${issue.title}" is overdue and has been escalated`
          });
        }

        console.log(`Escalated issue: ${issue.title}`);
      }

    } catch (error) {
      console.log('Escalation error:', error);
    }
  });

  console.log('Escalation service started');
};

module.exports = startEscalationService;