const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const { body, validationResult } = require('express-validator');
const Export = require('../models/Export');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all exports for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, type, status } = req.query;
    let query = { userId: req.user._id };

    if (eventId) query.eventId = eventId;
    if (type) query.type = type;
    if (status) query.status = status;

    const exports = await Export.find(query)
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    res.json({ exports });
  } catch (error) {
    console.error('Get exports error:', error);
    res.status(500).json({ error: 'Failed to fetch exports' });
  }
});

// Create new export job
router.post('/', authenticateToken, [
  body('eventId').isMongoId().withMessage('Valid event ID required'),
  body('type').isIn(['invitation', 'save_date', 'rsvp_card', 'thank_you', 'sign', 'menu', 'timeline']).withMessage('Invalid export type'),
  body('format').isIn(['pdf', 'png', 'jpg', 'svg', 'html', 'docx']).withMessage('Invalid export format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify event ownership
    const event = await Event.findOne({
      _id: req.body.eventId,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const exportJob = new Export({
      ...req.body,
      userId: req.user._id,
      status: 'pending'
    });

    await exportJob.save();

    // Start processing asynchronously
    processExport(exportJob._id);

    res.status(201).json({
      message: 'Export job created',
      export: exportJob
    });
  } catch (error) {
    console.error('Create export error:', error);
    res.status(500).json({ error: 'Failed to create export job' });
  }
});

// Get single export
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exportJob = await Export.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('eventId', 'title');

    if (!exportJob) {
      return res.status(404).json({ error: 'Export not found' });
    }

    res.json({ export: exportJob });
  } catch (error) {
    console.error('Get export error:', error);
    res.status(500).json({ error: 'Failed to fetch export' });
  }
});

// Download exported file
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const exportJob = await Export.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exportJob) {
      return res.status(404).json({ error: 'Export not found' });
    }

    if (exportJob.status !== 'completed') {
      return res.status(400).json({ error: 'Export not ready for download' });
    }

    // Check if file exists
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads/exports', exportJob.fileInfo.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Export file not found' });
    }

    // Update download count
    await Export.findByIdAndUpdate(req.params.id, {
      $inc: { 'downloads.total': 1 },
      'downloads.lastDownloaded': new Date()
    });

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${exportJob.fileInfo.filename}"`);
    res.setHeader('Content-Type', exportJob.fileInfo.mimeType);

    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download export error:', error);
    res.status(500).json({ error: 'Failed to download export' });
  }
});

// Delete export
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exportJob = await Export.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exportJob) {
      return res.status(404).json({ error: 'Export not found' });
    }

    // Delete associated file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads/exports', exportJob.fileInfo.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Export deleted successfully' });
  } catch (error) {
    console.error('Delete export error:', error);
    res.status(500).json({ error: 'Failed to delete export' });
  }
});

// Upload custom assets for export
router.post('/upload-assets', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/assets/${file.filename}`
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload assets error:', error);
    res.status(500).json({ error: 'Failed to upload assets' });
  }
});

// Async export processing function
async function processExport(exportId) {
  try {
    const exportJob = await Export.findById(exportId);
    if (!exportJob) return;

    // Update status to processing
    exportJob.status = 'processing';
    exportJob.processing.startedAt = new Date();
    exportJob.processing.progress = 10;
    await exportJob.save();

    // Simulate processing steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    exportJob.processing.progress = 30;
    await exportJob.save();

    await new Promise(resolve => setTimeout(resolve, 1000));
    exportJob.processing.progress = 60;
    await exportJob.save();

    // Generate the actual file based on format
    let fileBuffer;
    let mimeType;
    let extension;

    switch (exportJob.format) {
      case 'pdf':
        fileBuffer = await generatePDF(exportJob);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'png':
      case 'jpg':
        fileBuffer = await generateImage(exportJob, exportJob.format);
        mimeType = `image/${exportJob.format}`;
        extension = exportJob.format;
        break;
      default:
        throw new Error(`Unsupported format: ${exportJob.format}`);
    }

    // Save file
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../uploads/exports');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `export_${exportId}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filePath, fileBuffer);

    // Update export job
    exportJob.status = 'completed';
    exportJob.processing.completedAt = new Date();
    exportJob.processing.progress = 100;
    exportJob.fileInfo = {
      filename,
      size: fileBuffer.length,
      mimeType,
      url: `/api/export/${exportId}/download`,
      storageProvider: 'local'
    };

    await exportJob.save();

  } catch (error) {
    console.error('Export processing error:', error);
    
    // Update export job with error
    await Export.findByIdAndUpdate(exportId, {
      status: 'failed',
      'processing.error': error.message
    });
  }
}

// Generate PDF export
async function generatePDF(exportJob) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  
  // Add basic content (in a real implementation, you'd use proper PDF generation libraries)
  const fontSize = 16;
  page.drawText(`Event Export: ${exportJob.type}`, {
    x: 50,
    y: 742,
    size: fontSize,
  });

  // Add more content based on export type
  // This is a simplified example
  
  return await pdfDoc.save();
}

// Generate image export
async function generateImage(exportJob, format) {
  // Create a simple image with event information
  const width = 800;
  const height = 600;
  
  let imageBuffer;
  
  if (format === 'png') {
    imageBuffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();
  } else {
    imageBuffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).jpeg().toBuffer();
  }
  
  return imageBuffer;
}

module.exports = router;