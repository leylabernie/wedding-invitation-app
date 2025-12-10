const express = require('express');
const { body, validationResult } = require('express-validator');
const Design = require('../models/Design');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all designs for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { template, isTemplate, isPublic } = req.query;
    let query = { userId: req.user._id };

    if (template) query.template = template;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    const designs = await Design.find(query).sort({ createdAt: -1 });

    res.json({ designs });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Get public templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await Design.find({ 
      isTemplate: true, 
      isPublic: true 
    }).sort({ 'usage.used': -1 });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create new design
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('template').isIn(['classic', 'modern', 'rustic', 'elegant', 'minimalist', 'vintage', 'floral', 'geometric']).withMessage('Invalid template'),
  body('colorPalette').isArray({ min: 2 }).withMessage('At least 2 colors required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const design = new Design({
      ...req.body,
      userId: req.user._id
    });

    await design.save();

    res.status(201).json({
      message: 'Design created successfully',
      design
    });
  } catch (error) {
    console.error('Create design error:', error);
    res.status(500).json({ error: 'Failed to create design' });
  }
});

// Get single design
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    // Check if user can access this design
    if (!design.isPublic && (!req.user || design.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ design });
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// Update design
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const design = await Design.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    res.json({
      message: 'Design updated successfully',
      design
    });
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
});

// Delete design
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const design = await Design.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

// Clone design
router.post('/:id/clone', authenticateToken, async (req, res) => {
  try {
    const originalDesign = await Design.findById(req.params.id);

    if (!originalDesign) {
      return res.status(404).json({ error: 'Design not found' });
    }

    // Create a copy with new name
    const clonedDesign = new Design({
      ...originalDesign.toObject(),
      _id: undefined,
      name: `${originalDesign.name} (Copy)`,
      userId: req.user._id,
      isTemplate: false,
      isPublic: false,
      usage: {
        used: 0,
        favorites: 0,
        downloads: 0
      }
    });

    await clonedDesign.save();

    res.status(201).json({
      message: 'Design cloned successfully',
      design: clonedDesign
    });
  } catch (error) {
    console.error('Clone design error:', error);
    res.status(500).json({ error: 'Failed to clone design' });
  }
});

// Favorite/unfavorite design
router.put('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    // Toggle favorite status (this would need a user-specific favorites collection in production)
    // For now, just increment/decrement the favorites count
    const { favorite } = req.body;
    
    if (favorite) {
      design.usage.favorites++;
    } else {
      design.usage.favorites = Math.max(0, design.usage.favorites - 1);
    }

    await design.save();

    res.json({
      message: favorite ? 'Design favorited' : 'Design unfavorited',
      design
    });
  } catch (error) {
    console.error('Favorite design error:', error);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

// Get design analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const design = await Design.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    res.json({
      analytics: design.usage
    });
  } catch (error) {
    console.error('Get design analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch design analytics' });
  }
});

module.exports = router;