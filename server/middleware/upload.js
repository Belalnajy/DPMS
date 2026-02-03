const { put } = require('@vercel/blob');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Standard multer for handling the parsing of multipart/form-data
// In serverless, we use memoryStorage because disk is ephemeral
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Helper for Vercel Blob upload (used in controller if preferred or middleware handle)
const uploadToBlob = async (file) => {
  if (!file) return null;

  // Check if Vercel Blob is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(file.originalname, file.buffer, {
        access: 'public',
      });
      return blob.url;
    } catch (error) {
      console.error('Vercel Blob upload failed:', error);
      throw error;
    }
  }

  // Fallback to local storage
  console.log('No BLOB_READ_WRITE_TOKEN found. Saving file locally.');
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads');

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    // Return local URL
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}/uploads/${filename}`;
  } catch (error) {
    console.error('Local file upload failed:', error);
    throw new Error('File upload failed');
  }
};

module.exports = { upload, uploadToBlob };
