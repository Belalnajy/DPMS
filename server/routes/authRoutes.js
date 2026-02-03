const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../middleware/upload');

router.post('/login', authController.login);
router.post(
  '/register',
  upload.single('profile_picture'),
  authController.register,
);

// Manual seed endpoint for doctor account
router.get('/seed-doctor', authController.seedDoctor);

module.exports = router;
