const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, read } = req.query;
    let query = { userId: req.user._id };

    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (read !== undefined) {
      query.readAt = read === 'true' ? { $ne: null } : null;
    }

    const notifications = await Notification.find(query)
      .populate('eventId', 'title')
      .populate('guestId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      readAt: null
    });

    res.json({ 
      notifications,
      unreadCount 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      readAt: null
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        readAt: new Date(),
        status: 'read'
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, readAt: null },
      { 
        readAt: new Date(),
        status: 'read'
      }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create notification (for internal use)
router.post('/', authenticateToken, [
  body('eventId').optional().isMongoId(),
  body('guestId').optional().isMongoId(),
  body('type').isIn([
    'rsvp_accepted',
    'rsvp_declined',
    'rsvp_pending',
    'guest_added',
    'guest_removed',
    'reminder_sent',
    'event_shared',
    'invitation_opened',
    'design_updated',
    'export_completed',
    'system'
  ]).withMessage('Invalid notification type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify event ownership if eventId is provided
    if (req.body.eventId) {
      const event = await Event.findOne({
        _id: req.body.eventId,
        userId: req.user._id
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
    }

    const notification = new Notification({
      ...req.body,
      userId: req.user._id
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get notifications by type
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      type: req.params.type
    })
    .populate('eventId', 'title')
    .populate('guestId', 'name')
    .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications by type error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications by type' });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    // This would typically come from user preferences
    const settings = {
      email: req.user.preferences.notifications.email,
      push: req.user.preferences.notifications.push,
      rsvp: req.user.preferences.notifications.rsvp,
      types: {
        rsvp_accepted: true,
        rsvp_declined: true,
        rsvp_pending: false,
        guest_added: true,
        guest_removed: true,
        reminder_sent: true,
        event_shared: true,
        invitation_opened: true,
        design_updated: true,
        export_completed: true,
        system: true
      }
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { email, push, rsvp, types } = req.body;

    // Update user preferences
    const updatedUser = await Event.findByIdAndUpdate(
      req.user._id,
      {
        'preferences.notifications.email': email,
        'preferences.notifications.push': push,
        'preferences.notifications.rsvp': rsvp
      },
      { new: true }
    );

    res.json({
      message: 'Notification settings updated successfully',
      settings: {
        email: updatedUser.preferences.notifications.email,
        push: updatedUser.preferences.notifications.push,
        rsvp: updatedUser.preferences.notifications.rsvp,
        types
      }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Send test notification
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const testNotification = new Notification({
      userId: req.user._id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings are working correctly.',
      channels: { inApp: true, email: req.user.preferences.notifications.email },
      status: 'pending',
      priority: 'normal'
    });

    await testNotification.save();

    // In a real implementation, you would send the actual notification here
    // For now, just mark it as sent
    testNotification.status = 'sent';
    testNotification.sentAt = new Date();
    await testNotification.save();

    res.json({
      message: 'Test notification sent successfully',
      notification: testNotification
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

module.exports = router;