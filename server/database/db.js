const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use environment variable for database connection
const connectionString = process.env.POSTGRES_URL;

let pool = null;
let sqliteDb = null;

if (connectionString) {
  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  console.log('No POSTGRES_URL found. Using SQLite for local development.');
  const dbPath = path.resolve(__dirname, '..', 'local.db');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to SQLite database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');
      // Enable foreign keys
      sqliteDb.run('PRAGMA foreign_keys = ON');
    }
  });
}

const db = {
  query: (text, params, callback) => {
    if (pool) {
      return pool.query(text, params, callback);
    } else if (sqliteDb) {
      // Convert Postgres query to SQLite
      // 1. Convert $1, $2, etc to ?
      let sql = text.replace(/\$\d+/g, '?');

      // 2. Handle RETURNING clause (rough approximation for ID)
      const isInsert = /INSERT/i.test(text);
      const hasReturning = /RETURNING/i.test(text);
      if (hasReturning) {
        sql = sql.replace(/RETURNING\s+.*/i, '');
      }

      if (isInsert && hasReturning) {
        // Run insert and return ID
        sqliteDb.run(sql, params || [], function (err) {
          if (err) {
            if (callback) callback(err, null);
            return;
          }
          // specific mock for RETURNING id
          const mockResult = {
            rows: [{ id: this.lastID }],
            rowCount: this.changes,
          };
          if (callback) callback(null, mockResult);
        });
      } else {
        // Standard query
        sqliteDb.all(sql, params || [], (err, rows) => {
          if (err) {
            if (callback) callback(err, null);
            return;
          }
          const mockResult = {
            rows: rows,
            rowCount: rows.length,
          };
          if (callback) callback(null, mockResult);
        });
      }
    } else {
      if (callback)
        callback(new Error('No database connection initialized.'), null);
    }
  },
};

const initDb = async () => {
  if (pool) {
    try {
      // Postgres Initialization (Existing)
      await pool.query(`CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              role TEXT NOT NULL,
              name TEXT NOT NULL,
              national_id TEXT UNIQUE,
              phone TEXT,
              gender TEXT,
              password TEXT NOT NULL,
              profile_picture TEXT,
              diabetes_type TEXT,
              settings TEXT
          )`);

      await pool.query(`CREATE TABLE IF NOT EXISTS glucose_readings (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL REFERENCES users(id),
              date TEXT NOT NULL,
              meal_type TEXT NOT NULL,
              value INTEGER NOT NULL
          )`);

      await pool.query(`CREATE TABLE IF NOT EXISTS treatment_plans (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
                breakfast_insulin INTEGER,
                lunch_insulin INTEGER,
                dinner_insulin INTEGER,
                long_acting_insulin INTEGER,
                medication TEXT,
                diet_recommendations TEXT
            )`);

      await pool.query(`CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                doctor_id INTEGER NOT NULL REFERENCES users(id),
                patient_id INTEGER NOT NULL REFERENCES users(id),
                message TEXT NOT NULL,
                is_urgent BOOLEAN DEFAULT false,
                is_read BOOLEAN DEFAULT false,
                date TEXT NOT NULL
            )`);

      await pool.query(`CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(id),
                week TEXT NOT NULL,
                text TEXT NOT NULL,
                date TEXT NOT NULL
            )`);

      console.log('PostgreSQL Tables verified/created.');
      await seedDefaultDoctor(pool);
    } catch (err) {
      console.error('Error initializing PostgreSQL:', err.message);
    }
  } else if (sqliteDb) {
    // SQLite Initialization
    const runAsync = (sql) =>
      new Promise((resolve, reject) => {
        sqliteDb.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

    try {
      await runAsync(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            national_id TEXT UNIQUE,
            phone TEXT,
            gender TEXT,
            password TEXT NOT NULL,
            profile_picture TEXT,
            diabetes_type TEXT,
            settings TEXT
        )`);

      await runAsync(`CREATE TABLE IF NOT EXISTS glucose_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            meal_type TEXT NOT NULL,
            value INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

      await runAsync(`CREATE TABLE IF NOT EXISTS treatment_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            breakfast_insulin INTEGER,
            lunch_insulin INTEGER,
            dinner_insulin INTEGER,
            long_acting_insulin INTEGER,
            medication TEXT,
            diet_recommendations TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

      await runAsync(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id INTEGER NOT NULL,
            patient_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            is_urgent BOOLEAN DEFAULT 0,
            is_read BOOLEAN DEFAULT 0,
            date TEXT NOT NULL,
            FOREIGN KEY(doctor_id) REFERENCES users(id),
            FOREIGN KEY(patient_id) REFERENCES users(id)
        )`);

      await runAsync(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            week TEXT NOT NULL,
            text TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(patient_id) REFERENCES users(id)
        )`);

      console.log('SQLite Tables verified/created.');

      // Check for doctor
      console.log('SQLite Tables verified/created.');

      // Check for doctor (Promisified)
      await new Promise((resolve, reject) => {
        sqliteDb.get(
          "SELECT * FROM users WHERE role = 'doctor' LIMIT 1",
          [],
          async (err, row) => {
            if (err) {
              console.error('Error checking for doctor:', err);
              resolve(); // Don't crash
              return;
            }
            if (!row) {
              try {
                const hashedPassword = await bcrypt.hash('password123', 10);
                sqliteDb.run(
                  'INSERT INTO users (role, name, national_id, phone, gender, password, diabetes_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [
                    'doctor',
                    'Dr. Admin',
                    '100100',
                    '0000000000',
                    'Male',
                    hashedPassword,
                    'Endocrinologist',
                  ],
                  (err) => {
                    if (err) console.error('Error seeding SQLite doctor:', err);
                    else
                      console.log(
                        'Default doctor account created in SQLite: 100100 / password123',
                      );
                    resolve();
                  },
                );
              } catch (hashError) {
                console.error('Error hashing password:', hashError);
                resolve();
              }
            } else {
              resolve();
            }
          },
        );
      });
    } catch (err) {
      console.error('Error initializing SQLite:', err);
    }
  }
};

// Helper for seeding Postgres
async function seedDefaultDoctor(pool) {
  const doctorCheck = await pool.query(
    "SELECT * FROM users WHERE role = 'doctor' LIMIT 1",
  );
  if (doctorCheck.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await pool.query(
      'INSERT INTO users (role, name, national_id, phone, gender, password, diabetes_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        'doctor',
        'Dr. Admin',
        '100100',
        '0000000000',
        'Male',
        hashedPassword,
        'Endocrinologist',
      ],
    );
    console.log('Default doctor account created: 100100 / password123');
  }
}

module.exports = { db, initDb, pool };
