const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/patients', doctorController.getAllPatients);
router.get('/patients/:id', doctorController.getPatientDetails);
router.put('/patients/:id/treatment', doctorController.updateTreatmentPlan);
router.put('/patients/:id/settings', doctorController.updatePatientSettings);
router.post('/patients/:id/messages', doctorController.sendMessage);
router.get('/messages', doctorController.getAllMessages);

router.put('/patients/:id/messages/read', doctorController.markMessagesRead);

module.exports = router;
