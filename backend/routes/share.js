const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');
const { generateShareableLink } = require('../utils/helpers');

const router = express.Router();

// Generate shareable link for event
router.post('/generate-link/:eventId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const shareableLink = generateShareableLink(event._id);
    
    event.sharing.shareableLink = shareableLink;
    await event.save();

    res.json({
      message: 'Shareable link generated',
      link: shareableLink
    });
  } catch (error) {
    console.error('Generate link error:', error);
    res.status(500).json({ error: 'Failed to generate shareable link' });
  }
});

// Get sharing options for event
router.get('/options/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only event owner can get detailed sharing options
    if (!req.user || event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sharingOptions = {
      shareableLink: event.sharing.shareableLink,
      isPublic: event.sharing.isPublic,
      qrCode: event.sharing.qrCode,
      socialSettings: event.sharing.socialSettings,
      stats: {
        totalViews: event.analytics.views,
        totalShares: event.analytics.shares,
        rsvpViews: event.analytics.rsvpViews
      }
    };

    res.json({ sharingOptions });
  } catch (error) {
    console.error('Get sharing options error:', error);
    res.status(500).json({ error: 'Failed to fetch sharing options' });
  }
});

// Update sharing settings
router.put('/settings/:eventId', authenticateToken, [
  body('isPublic').isBoolean(),
  body('socialSettings.facebook').optional().isBoolean(),
  body('socialSettings.instagram').optional().isBoolean(),
  body('socialSettings.twitter').optional().isBoolean(),
  body('socialSettings.whatsapp').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { isPublic, socialSettings } = req.body;

    event.sharing.isPublic = isPublic;
    if (socialSettings) {
      event.sharing.socialSettings = { ...event.sharing.socialSettings, ...socialSettings };
    }

    // Generate new link if making public
    if (isPublic && !event.sharing.shareableLink) {
      event.sharing.shareableLink = generateShareableLink(event._id);
    }

    await event.save();

    res.json({
      message: 'Sharing settings updated',
      sharing: event.sharing
    });
  } catch (error) {
    console.error('Update sharing settings error:', error);
    res.status(500).json({ error: 'Failed to update sharing settings' });
  }
});

// Get public event data (no authentication required)
router.get('/public/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('design.colorPalette');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.sharing.isPublic) {
      return res.status(403).json({ error: 'Event is not public' });
    }

    // Increment view count
    await Event.findByIdAndUpdate(req.params.eventId, {
      $inc: { 'analytics.views': 1 }
    });

    // Return public event data
    const publicEventData = {
      id: event._id,
      title: event.title,
      type: event.type,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venue: event.venue,
      details: event.details,
      design: event.design,
      settings: event.settings,
      createdAt: event.createdAt
    };

    res.json({ event: publicEventData });
  } catch (error) {
    console.error('Get public event error:', error);
    res.status(500).json({ error: 'Failed to fetch public event data' });
  }
});

// Track share event
router.post('/track-share/:eventId', async (req, res) => {
  try {
    const { platform, type } = req.body; // platform: 'facebook', 'twitter', etc. type: 'invitation', 'rsvp'
    
    await Event.findByIdAndUpdate(req.params.eventId, {
      $inc: { 'analytics.shares': 1 }
    });

    // Here you would integrate with actual social media APIs
    // For now, just return success
    res.json({ message: 'Share tracked successfully' });
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({ error: 'Failed to track share' });
  }
});

// Generate QR code for event
router.post('/qr-code/:eventId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const QRCode = require('qrcode');
    
    // Generate QR code for shareable link
    const link = event.sharing.shareableLink || generateShareableLink(event._id);
    const qrCodeDataURL = await QRCode.toDataURL(link, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    event.sharing.qrCode = qrCodeDataURL;
    await event.save();

    res.json({
      message: 'QR code generated',
      qrCode: qrCodeDataURL
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get sharing statistics
router.get('/stats/:eventId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const stats = {
      views: event.analytics.views,
      shares: event.analytics.shares,
      rsvpViews: event.analytics.rsvpViews,
      totalResponses: event.analytics.totalResponses,
      confirmedCount: event.analytics.confirmedCount,
      declinedCount: event.analytics.declinedCount,
      responseRate: event.analytics.views > 0 ? 
        ((event.analytics.totalResponses / event.analytics.views) * 100).toFixed(1) : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get sharing stats error:', error);
    res.status(500).json({ error: 'Failed to fetch sharing statistics' });
  }
});

module.exports = router;