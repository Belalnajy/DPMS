const { db } = require('../database/db');

const updateSchema = () => {
  console.log('Adding settings column to users table...');
  const query = 'ALTER TABLE users ADD COLUMN settings TEXT';

  db.query(query, [], (err, res) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('Column settings already exists.');
      } else {
        console.error('Error adding column:', err.message);
      }
    } else {
      console.log('Successfully added settings column.');
    }
  });
};

updateSchema();
