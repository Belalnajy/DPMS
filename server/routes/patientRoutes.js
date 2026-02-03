const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// In a real app, we'd add middleware here to verify the token and ensuring the user matches :id
router.get('/:id/dashboard', patientController.getDashboardData);
router.post('/:id/readings', patientController.addReading);
router.post('/:id/notes', patientController.addWeeklyNote);

router.put('/:id/messages/read-all', patientController.markAllMessagesRead);
router.put('/:id/settings', patientController.updateSettings);

module.exports = router;
