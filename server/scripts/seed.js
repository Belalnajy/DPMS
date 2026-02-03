const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { db } = require('../database/db');

// Ensure tables exist before seeding
const { initDb } = require('../database/db');
initDb();

const SALT_ROUNDS = 10;

const seedparsed = async () => {
  // Wait a bit for table creation if it's the very first run
  setTimeout(async () => {
    console.log('Seeding data...');

    // Clear existing data (optional, for clean slate)
    db.run('DELETE FROM users');
    db.run('DELETE FROM glucose_readings');
    db.run('DELETE FROM treatment_plans');

    const doctorPassword = await bcrypt.hash('doctor123', SALT_ROUNDS);
    const patientPassword = await bcrypt.hash('patient123', SALT_ROUNDS);

    // 1. Create Doctor
    db.run(
      `INSERT INTO users (role, name, national_id, phone, gender, password, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'doctor',
        'Dr. Ayman',
        '1000000001',
        '01000000001',
        'Male',
        doctorPassword,
        null,
      ],
      function (err) {
        if (err) return console.error(err.message);
        console.log(`Doctor created with ID: ${this.lastID}`);
      },
    );

    // 2. Create Patients
    const patients = [
      {
        name: 'Ahmed Ali',
        nid: '2000000001',
        phone: '01200000001',
        gender: 'Male',
      },
      {
        name: 'Sarah Mona',
        nid: '2000000002',
        phone: '01200000002',
        gender: 'Female',
      },
      {
        name: 'Khaled Omar',
        nid: '2000000003',
        phone: '01200000003',
        gender: 'Male',
      },
    ];

    patients.forEach((p) => {
      db.run(
        `INSERT INTO users (role, name, national_id, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)`,
        ['patient', p.name, p.nid, p.phone, p.gender, patientPassword],
        function (err) {
          if (err) return console.error(err.message);
          const patientId = this.lastID;
          console.log(`Patient ${p.name} created with ID: ${patientId}`);

          // Create Dummy Treatment Plan
          db.run(
            `INSERT INTO treatment_plans (user_id, breakfast_insulin, lunch_insulin, dinner_insulin, long_acting_insulin, doctor_notes) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              patientId,
              10,
              15,
              10,
              20,
              'Keep monitoring your sugar levels closely.',
            ],
          );

          // Create Dummy Readings (Last 7 days)
          for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Random values mimic somewhat realistic fluctuations
            const meals = [
              'before_breakfast',
              'after_breakfast',
              'before_lunch',
              'after_lunch',
              'before_dinner',
              'after_dinner',
            ];
            meals.forEach((meal) => {
              const val = Math.floor(Math.random() * (180 - 80 + 1)) + 80; // Mostly normal range
              db.run(
                `INSERT INTO glucose_readings (user_id, date, meal_type, value) VALUES (?, ?, ?, ?)`,
                [patientId, dateStr, meal, val],
              );
            });
          }
        },
      );
    });
  }, 1000);
};

seedparsed();
