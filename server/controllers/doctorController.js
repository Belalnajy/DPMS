const { db } = require('../database/db');

// List all patients with latest glucose reading
const getAllPatients = (req, res) => {
  db.query(
    "SELECT id, name, national_id, phone, gender, profile_picture, diabetes_type FROM users WHERE role = 'patient'",
    [],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const patients = result.rows || [];

      // For each patient, get the latest reading
      const promises = patients.map((patient) => {
        return new Promise((resolve) => {
          db.query(
            'SELECT * FROM glucose_readings WHERE user_id = $1 ORDER BY date DESC, id DESC LIMIT 1',
            [patient.id],
            (err, readingResult) => {
              patient.latestReading = readingResult.rows
                ? readingResult.rows[0]
                : null;
              resolve(patient);
            },
          );
        });
      });

      Promise.all(promises).then((data) => res.json(data));
    },
  );
};

// Get single patient details (Info + History + Plan + Notes)
const getPatientDetails = (req, res) => {
  const patientId = req.params.id;
  const data = {};

  db.query(
    'SELECT id, role, name, national_id, phone, gender, profile_picture, diabetes_type FROM users WHERE id = $1',
    [patientId],
    (err, result) => {
      if (err || !result.rows || result.rows.length === 0)
        return res.status(404).json({ error: 'Patient not found' });

      data.user = result.rows[0];

      db.query(
        'SELECT * FROM treatment_plans WHERE user_id = $1',
        [patientId],
        (err, planResult) => {
          data.treatmentPlan = planResult.rows ? planResult.rows[0] || {} : {};

          db.query(
            'SELECT * FROM glucose_readings WHERE user_id = $1 ORDER BY date DESC',
            [patientId],
            (err, readingResult) => {
              data.readings = readingResult.rows || [];

              db.query(
                'SELECT * FROM notes WHERE patient_id = $1 ORDER BY date DESC',
                [patientId],
                (err, noteResult) => {
                  data.notes = noteResult.rows || [];
                  res.json(data);
                },
              );
            },
          );
        },
      );
    },
  );
};

// Update Treatment Plan
const updateTreatmentPlan = (req, res) => {
  const patientId = req.params.id;
  const {
    breakfast_insulin,
    lunch_insulin,
    dinner_insulin,
    long_acting_insulin,
    medication,
    diet_recommendations,
  } = req.body;

  // Check if plan exists
  db.query(
    'SELECT id FROM treatment_plans WHERE user_id = $1',
    [patientId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.rows && result.rows.length > 0) {
        db.query(
          'UPDATE treatment_plans SET breakfast_insulin = $1, lunch_insulin = $2, dinner_insulin = $3, long_acting_insulin = $4, medication = $5, diet_recommendations = $6 WHERE user_id = $7',
          [
            breakfast_insulin,
            lunch_insulin,
            dinner_insulin,
            long_acting_insulin,
            medication,
            diet_recommendations,
            patientId,
          ],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan updated' });
          },
        );
      } else {
        db.query(
          'INSERT INTO treatment_plans (user_id, breakfast_insulin, lunch_insulin, dinner_insulin, long_acting_insulin, medication, diet_recommendations) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            patientId,
            breakfast_insulin,
            lunch_insulin,
            dinner_insulin,
            long_acting_insulin,
            medication,
            diet_recommendations,
          ],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan created' });
          },
        );
      }
    },
  );
};

// Send Message / Alert
const sendMessage = (req, res) => {
  const { doctor_id, message, is_urgent } = req.body;
  const patientId = req.params.id;
  const date = new Date().toISOString();

  db.query(
    'INSERT INTO messages (doctor_id, patient_id, message, is_urgent, date) VALUES ($1, $2, $3, $4, $5)',
    [doctor_id, patientId, message, is_urgent ? true : false, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Message sent' });
    },
  );
};

// Get all messages sent by doctors
const getAllMessages = (req, res) => {
  db.query(
    'SELECT m.*, u.name as patient_name, u.national_id as patient_national_id FROM messages m JOIN users u ON m.patient_id = u.id ORDER BY m.date DESC',
    [],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result.rows || []);
    },
  );
};

module.exports = {
  getAllPatients,
  getPatientDetails,
  updateTreatmentPlan,
  sendMessage,
  getAllMessages,
};
