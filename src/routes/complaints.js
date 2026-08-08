const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ComplaintController = require('../controllers/complaintController');
const { requireAuth } = require('../middleware/auth');

// Configure multer for this route
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'evidence-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'));
    }
  }
});

// Routes
router.post('/', requireAuth, upload.single('evidenceImage'), ComplaintController.create);

router.get('/', requireAuth, ComplaintController.getByUser);
router.get('/stats', requireAuth, ComplaintController.getStats);
router.get('/recent', requireAuth, ComplaintController.getRecent);
router.get('/:id', requireAuth, ComplaintController.getById);
router.put('/:id', requireAuth, ComplaintController.update);
router.patch('/:id/status', requireAuth, ComplaintController.updateStatus);
router.delete('/:id', requireAuth, ComplaintController.delete);

module.exports = router;
