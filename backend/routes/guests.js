const express = require('express');
const { body, validationResult } = require('express-validator');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');
const { isValidEmail, isValidPhone, sanitizeString } = require('../utils/helpers');

const router = express.Router();

// Get all guests for an event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    // Verify event ownership
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { category, status, search } = req.query;
    let query = { eventId: req.params.eventId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query['rsvp.status'] = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const guests = await Guest.find(query).sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: guests.length,
      pending: guests.filter(g => g.rsvp.status === 'pending').length,
      accepted: guests.filter(g => g.rsvp.status === 'accepted').length,
      declined: guests.filter(g => g.rsvp.status === 'declined').length,
      maybe: guests.filter(g => g.rsvp.status === 'maybe').length
    };

    res.json({ guests, stats });
  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// Add new guest
router.post('/event/:eventId', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().custom(isValidPhone).withMessage('Valid phone number required'),
  body('partySize').optional().isInt({ min: 1, max: 20 }).withMessage('Party size must be 1-20'),
  body('category').optional().isIn(['family', 'friends', 'colleagues', 'vendor', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify event ownership
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const guestData = {
      ...req.body,
      eventId: req.params.eventId,
      name: sanitizeString(req.body.name),
      email: req.body.email ? req.body.email.toLowerCase() : undefined
    };

    const guest = new Guest(guestData);
    await guest.save();

    res.status(201).json({
      message: 'Guest added successfully',
      guest
    });
  } catch (error) {
    console.error('Add guest error:', error);
    res.status(500).json({ error: 'Failed to add guest' });
  }
});

// Update guest
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail(),
  body('phone').optional().custom(isValidPhone),
  body('partySize').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify guest ownership through event
    const guest = await Guest.findById(req.params.id).populate('eventId');
    if (!guest || guest.eventId.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    const updateData = { ...req.body };
    if (updateData.name) updateData.name = sanitizeString(updateData.name);
    if (updateData.email) updateData.email = updateData.email.toLowerCase();

    const updatedGuest = await Guest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Guest updated successfully',
      guest: updatedGuest
    });
  } catch (error) {
    console.error('Update guest error:', error);
    res.status(500).json({ error: 'Failed to update guest' });
  }
});

// Update RSVP status
router.put('/:id/rsvp', authenticateToken, [
  body('status').isIn(['pending', 'accepted', 'declined', 'maybe']).withMessage('Invalid RSVP status'),
  body('message').optional().trim().isLength({ max: 500 }),
  body('dietaryRestrictions').optional().isArray(),
  body('actualGuestCount').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify guest ownership
    const guest = await Guest.findById(req.params.id).populate('eventId');
    if (!guest || guest.eventId.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    const { status, message, dietaryRestrictions, specialRequests, plusOneNames, actualGuestCount } = req.body;
    
    const updateData = {
      'rsvp.status': status,
      'rsvp.respondedAt': new Date(),
      ...(message && { 'rsvp.message': message }),
      ...(dietaryRestrictions && { 'rsvp.dietaryRestrictions': dietaryRestrictions }),
      ...(specialRequests && { 'rsvp.specialRequests': specialRequests }),
      ...(plusOneNames && { 'rsvp.plusOneNames': plusOneNames }),
      ...(actualGuestCount && { 'rsvp.actualGuestCount': actualGuestCount })
    };

    const updatedGuest = await Guest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'RSVP updated successfully',
      guest: updatedGuest
    });
  } catch (error) {
    console.error('Update RSVP error:', error);
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
});

// Delete guest
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verify guest ownership
    const guest = await Guest.findById(req.params.id).populate('eventId');
    if (!guest || guest.eventId.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    await Guest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

// Bulk import guests
router.post('/event/:eventId/import', authenticateToken, [
  body('guests').isArray().withMessage('Guests must be an array'),
  body('guests.*.name').trim().isLength({ min: 2, max: 100 }).withMessage('Name required for all guests'),
  body('guests.*.email').optional().isEmail().withMessage('Valid email required'),
  body('guests.*.phone').optional().custom(isValidPhone).withMessage('Valid phone required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify event ownership
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { guests } = req.body;
    const importResults = {
      successful: [],
      failed: []
    };

    for (const guestData of guests) {
      try {
        const newGuest = new Guest({
          ...guestData,
          eventId: req.params.eventId,
          name: sanitizeString(guestData.name),
          email: guestData.email ? guestData.email.toLowerCase() : undefined
        });
        await newGuest.save();
        importResults.successful.push(newGuest);
      } catch (error) {
        importResults.failed.push({
          guest: guestData,
          error: error.message
        });
      }
    }

    res.json({
      message: `Imported ${importResults.successful.length} guests successfully`,
      results: importResults
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import guests' });
  }
});

// Send invitations
router.post('/event/:eventId/invite', authenticateToken, async (req, res) => {
  try {
    // Verify event ownership
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { guestIds, method = 'email' } = req.body;

    // Update invitation status for selected guests
    const updateResult = await Guest.updateMany(
      { 
        _id: { $in: guestIds },
        eventId: req.params.eventId 
      },
      {
        'invitation.sent': true,
        'invitation.sentAt': new Date(),
        'invitation.deliveryStatus': 'sent',
        'invitation.method': method
      }
    );

    res.json({
      message: `Invitations sent to ${updateResult.modifiedCount} guests`,
      count: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Send invitations error:', error);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
});

// Get guest categories
router.get('/event/:eventId/categories', authenticateToken, async (req, res) => {
  try {
    // Verify event ownership
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const guests = await Guest.find({ eventId: req.params.eventId });
    
    const categories = guests.reduce((acc, guest) => {
      if (!acc[guest.category]) {
        acc[guest.category] = { total: 0, confirmed: 0, pending: 0, declined: 0 };
      }
      
      acc[guest.category].total++;
      
      switch (guest.rsvp.status) {
        case 'accepted':
          acc[guest.category].confirmed++;
          break;
        case 'pending':
          acc[guest.category].pending++;
          break;
        case 'declined':
          acc[guest.category].declined++;
          break;
      }
      
      return acc;
    }, {});

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;