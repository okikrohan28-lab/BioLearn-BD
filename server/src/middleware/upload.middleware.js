const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Destination directory for uploaded resources
const uploadDir = path.join(__dirname, '../../uploads/resources');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with safe unique filename generation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `res-${uniqueSuffix}${ext}`);
  },
});

// Permitted extensions and MIME types: PDF, Word (doc/docx), and Images (jpg/jpeg/png)
const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file format. Supported file formats: PDF (.pdf), Word documents (.doc, .docx), and images (.jpg, .jpeg, .png). Received: ${ext}`
    );
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// 25 MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

// Middleware wrapper to catch multer limits and errors gracefully
const handleResourceUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum permitted limit (25 MB).',
        });
      }
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
};

module.exports = {
  handleResourceUpload,
  fileFilter,
  uploadDir,
  allowedExtensions,
  allowedMimeTypes,
};
