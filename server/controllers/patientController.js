const { db } = require('../database/db');

// Get Patient Dashboard Data (Info + Treatment Plan + Messages + Recent Readings)
const getDashboardData = (req, res) => {
  const patientId = req.params.id;
  const data = {};

  db.query(
    "SELECT id, role, name, national_id, phone, gender, profile_picture, diabetes_type, settings FROM users WHERE id = $1 AND role = 'patient'",
    [patientId],
    (err, result) => {
      if (err || !result.rows || result.rows.length === 0)
        return res.status(404).json({ error: 'Patient not found' });

      const user = result.rows[0];
      data.user = user;

      db.query(
        'SELECT * FROM treatment_plans WHERE user_id = $1',
        [patientId],
        (err, planResult) => {
          data.treatmentPlan = planResult.rows ? planResult.rows[0] || {} : {};

          db.query(
            'SELECT * FROM messages WHERE patient_id = $1 ORDER BY date DESC',
            [patientId],
            (err, msgResult) => {
              data.messages = msgResult.rows || [];

              db.query(
                'SELECT * FROM glucose_readings WHERE user_id = $1 ORDER BY date DESC, id DESC LIMIT 20',
                [patientId],
                (err, readingResult) => {
                  data.readings = readingResult.rows || [];
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

const addReading = (req, res) => {
  const patientId = req.params.id;
  const { date, meal_type, value } = req.body;

  if (!date || !meal_type || value === undefined || value === '') {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const glucoseValue = parseInt(value, 10);
  if (isNaN(glucoseValue) || glucoseValue < 0 || glucoseValue > 700) {
    return res
      .status(400)
      .json({ error: 'Glucose value must be between 0 and 700 mg/dL' });
  }

  db.query(
    'INSERT INTO glucose_readings (user_id, date, meal_type, value) VALUES ($1, $2, $3, $4) RETURNING id',
    [patientId, date, meal_type, glucoseValue],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Reading added', id: result.rows[0].id });
    },
  );
};

const addWeeklyNote = (req, res) => {
  const patientId = req.params.id;
  const { week, text } = req.body;
  const date = new Date().toISOString();

  if (!week || !text) return res.status(400).json({ error: 'Missing fields' });

  db.query(
    'INSERT INTO notes (patient_id, week, text, date) VALUES ($1, $2, $3, $4) RETURNING id',
    [patientId, week, text, date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Note added', id: result.rows[0].id });
    },
  );
};

const markAllMessagesRead = (req, res) => {
  const patientId = req.params.id;

  db.query(
    'UPDATE messages SET is_read = true WHERE patient_id = $1',
    [patientId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'All messages marked as read' });
    },
  );
};

const updateSettings = (req, res) => {
  const patientId = req.params.id;
  const { settings } = req.body;

  db.query(
    'UPDATE users SET settings = $1 WHERE id = $2',
    [settings, patientId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Settings updated' });
    },
  );
};

module.exports = {
  getDashboardData,
  addReading,
  addWeeklyNote,
  markAllMessagesRead,
  updateSettings,
};
