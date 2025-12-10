const express = require('express');
const { body, validationResult } = require('express-validator');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public RSVP endpoint (for guests to submit responses)
router.post('/submit/:eventId/:guestId', [
  body('status').isIn(['accepted', 'declined', 'maybe']).withMessage('Valid status required'),
  body('message').optional().trim().isLength({ max: 500 }),
  body('dietaryRestrictions').optional().isArray(),
  body('actualGuestCount').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, guestId } = req.params;
    const { status, message, dietaryRestrictions, specialRequests, plusOneNames, actualGuestCount, customResponses } = req.body;

    // Verify guest exists for this event
    const guest = await Guest.findOne({ _id: guestId, eventId });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Update RSVP
    const updateData = {
      'rsvp.status': status,
      'rsvp.respondedAt': new Date(),
      ...(message && { 'rsvp.message': message }),
      ...(dietaryRestrictions && { 'rsvp.dietaryRestrictions': dietaryRestrictions }),
      ...(specialRequests && { 'rsvp.specialRequests': specialRequests }),
      ...(plusOneNames && { 'rsvp.plusOneNames': plusOneNames }),
      ...(actualGuestCount && { 'rsvp.actualGuestCount': actualGuestCount }),
      ...(customResponses && { 'rsvp.customResponses': customResponses })
    };

    const updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      updateData,
      { new: true, runValidators: true }
    );

    // Create notification for event owner
    const event = await Event.findById(eventId);
    if (event) {
      await Notification.create({
        userId: event.userId,
        eventId,
        guestId,
        type: `rsvp_${status}`,
        title: `RSVP ${status}`,
        message: `${guest.name} has ${status} your invitation`,
        channels: { inApp: true, email: true },
        status: 'pending'
      });
    }

    res.json({
      message: 'RSVP submitted successfully',
      guest: updatedGuest
    });
  } catch (error) {
    console.error('Submit RSVP error:', error);
    res.status(500).json({ error: 'Failed to submit RSVP' });
  }
});

// Get RSVP responses for event (owner only)
router.get('/responses/:eventId', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // If not authenticated user, check if event is public
    if (!req.user || event.userId.toString() !== req.user._id.toString()) {
      if (!event.sharing.isPublic) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const guests = await Guest.find({ eventId: req.params.eventId })
      .select('name email phone rsvp partySize')
      .sort({ 'rsvp.respondedAt': -1 });

    // Group by status
    const responses = {
      accepted: guests.filter(g => g.rsvp.status === 'accepted'),
      declined: guests.filter(g => g.rsvp.status === 'declined'),
      pending: guests.filter(g => g.rsvp.status === 'pending'),
      maybe: guests.filter(g => g.rsvp.status === 'maybe')
    };

    // Calculate summary
    const summary = {
      total: guests.length,
      responded: guests.filter(g => g.rsvp.status !== 'pending').length,
      accepted: responses.accepted.length,
      declined: responses.declined.length,
      pending: responses.pending.length,
      maybe: responses.maybe.length,
      totalGuests: guests.reduce((sum, g) => sum + g.partySize, 0),
      confirmedGuests: responses.accepted.reduce((sum, g) => sum + (g.rsvp.actualGuestCount || g.partySize), 0)
    };

    res.json({ responses, summary });
  } catch (error) {
    console.error('Get RSVP responses error:', error);
    res.status(500).json({ error: 'Failed to fetch RSVP responses' });
  }
});

// Send RSVP reminder
router.post('/remind/:eventId/:guestId', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || (req.user && event.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const guest = await Guest.findOne({ _id: req.params.guestId, eventId: req.params.eventId });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Update reminder count
    await Guest.findByIdAndUpdate(req.params.guestId, {
      $inc: { 'metadata.reminderCount': 1 },
      'metadata.lastContacted': new Date()
    });

    // Create notification
    await Notification.create({
      userId: event.userId,
      eventId: req.params.eventId,
      guestId: req.params.guestId,
      type: 'reminder_sent',
      title: 'Reminder Sent',
      message: `Reminder sent to ${guest.name}`,
      channels: { inApp: true },
      status: 'sent',
      sentAt: new Date()
    });

    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

module.exports = router;