const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Guest = require('../models/Guest');
const { authenticateToken } = require('../middleware/auth');
const { calculateEventStats, generateShareableLink } = require('../utils/helpers');

const router = express.Router();

// Get all events for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('design.colorPalette');

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create new event
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('type').isIn(['wedding', 'engagement', 'anniversary', 'other']).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Valid event date required'),
  body('eventTime').notEmpty().withMessage('Event time required'),
  body('venue.name').trim().isLength({ min: 2 }).withMessage('Venue name required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      userId: req.user._id
    };

    // Set default design if not provided
    if (!eventData.design) {
      eventData.design = {
        template: 'classic',
        colorPalette: [
          { name: 'Primary', hex: '#b447eb', role: 'primary' },
          { name: 'Secondary', hex: '#f7f6f8', role: 'background' }
        ]
      };
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get single event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('design.colorPalette');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get guest statistics
    const guests = await Guest.find({ eventId: event._id });
    const stats = calculateEventStats(guests);

    res.json({
      event,
      stats
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Update event
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('eventDate').optional().isISO8601(),
  body('type').optional().isIn(['wedding', 'engagement', 'anniversary', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Also delete associated guests
    await Guest.deleteMany({ eventId: event._id });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Update event design
router.put('/:id/design', authenticateToken, async (req, res) => {
  try {
    const { design } = req.body;
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { design },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event design updated successfully',
      event
    });
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
});

// Update sharing settings
router.put('/:id/sharing', authenticateToken, async (req, res) => {
  try {
    const { sharing } = req.body;
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { sharing },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate new shareable link if needed
    if (sharing.isPublic && !sharing.shareableLink) {
      event.sharing.shareableLink = generateShareableLink(event._id);
      await event.save();
    }

    res.json({
      message: 'Sharing settings updated successfully',
      event
    });
  } catch (error) {
    console.error('Update sharing error:', error);
    res.status(500).json({ error: 'Failed to update sharing settings' });
  }
});

// Get event analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const guests = await Guest.find({ eventId: event._id });
    const stats = calculateEventStats(guests);

    // Additional analytics
    const analytics = {
      ...event.analytics.toObject(),
      ...stats,
      responseRate: stats.total > 0 ? ((stats.accepted + stats.declined) / stats.total * 100).toFixed(1) : 0,
      pendingGuests: guests.filter(g => g.rsvp.status === 'pending').length,
      averageResponseTime: calculateAverageResponseTime(guests)
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Helper function to calculate average response time
function calculateAverageResponseTime(guests) {
  const responses = guests.filter(g => g.rsvp.respondedAt && g.invitation.sentAt);
  
  if (responses.length === 0) return null;

  const totalTime = responses.reduce((sum, guest) => {
    const responseTime = new Date(guest.rsvp.respondedAt) - new Date(guest.invitation.sentAt);
    return sum + responseTime;
  }, 0);

  const avgTime = totalTime / responses.length;
  const days = Math.floor(avgTime / (1000 * 60 * 60 * 24));
  
  return days > 0 ? `${days} day${days > 1 ? 's' : ''}` : 'Same day';
}

module.exports = router;