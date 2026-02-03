const { db } = require('../database/db');

const updateSchema = () => {
  console.log('Adding is_read column to messages table...');
  const query = 'ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT 0';

  db.query(query, [], (err, res) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('Column is_read already exists.');
      } else {
        console.error('Error adding column:', err.message);
      }
    } else {
      console.log('Successfully added is_read column.');
    }
  });
};

updateSchema();
