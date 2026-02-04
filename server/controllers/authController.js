const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');

const SECRET_KEY = process.env.JWT_SECRET || 'simple_secret_key_for_demo_only';

const { uploadToBlob } = require('../middleware/upload');

const login = (req, res) => {
  const { national_id, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE national_id = $1',
    [national_id],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const user = result.rows ? result.rows[0] : null;
      if (!user) return res.status(404).json({ error: 'User not found' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(401).json({ error: 'Invalid password' });

      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        SECRET_KEY,
        { expiresIn: '1h' },
      );
      res.json({
        token,
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          phone: user.phone,
          gender: user.gender,
          profile_picture: user.profile_picture,
          diabetes_type: user.diabetes_type,
          settings: user.settings,
        },
      });
    },
  );
};

const register = async (req, res) => {
  const { name, national_id, phone, gender, password, diabetes_type } =
    req.body;

  // Upload to Vercel Blob if file exists
  let profile_picture = null;
  if (req.file) {
    try {
      profile_picture = await uploadToBlob(req.file);
    } catch (uploadErr) {
      console.error('Blob upload failed:', uploadErr);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  }

  if (!name || !national_id || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (role, name, national_id, phone, gender, password, profile_picture, diabetes_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [
        'patient',
        name,
        national_id,
        phone,
        gender,
        hashedPassword,
        profile_picture,
        diabetes_type,
      ],
      (err, result) => {
        if (err) {
          if (
            err.message.includes('unique constraint') ||
            err.message.includes('UNIQUE constraint')
          ) {
            return res
              .status(400)
              .json({ error: 'National ID already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Patient registered successfully',
          userId: result.rows[0].id,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const seedDoctor = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    db.query(
      "SELECT * FROM users WHERE role = 'doctor' LIMIT 1",
      [],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rows.length > 0) {
          return res
            .status(200)
            .json({ message: 'Doctor account already exists' });
        }

        db.query(
          'INSERT INTO users (role, name, national_id, phone, gender, password, diabetes_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [
            'doctor',
            'Dr. Admin',
            '100100',
            '0000000000',
            'Male',
            hashedPassword,
            'Endocrinologist',
          ],
          (insertErr, insertResult) => {
            if (insertErr)
              return res.status(500).json({ error: insertErr.message });
            res.status(201).json({
              message: 'Doctor account created successfully',
              id: insertResult.rows[0].id,
            });
          },
        );
      },
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error during seeding' });
  }
};

module.exports = { login, register, seedDoctor, SECRET_KEY };
