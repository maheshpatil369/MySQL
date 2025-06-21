const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    throw error; // Re-throw to be caught by server.js or calling function
  }
}

// Removed createChatMessagesTable, saveChatMessage, and getChatMessages functions

async function createEventsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL, -- Assuming user ID is a string, adjust if it's an INT and references a users table
      title VARCHAR(255) NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      all_day BOOLEAN DEFAULT FALSE,
      description TEXT,
      location VARCHAR(255),
      distance INT, -- Added distance column
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      -- If user_id is an INT and references a users table, you might add:
      -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  try {
    const connection = await pool.getConnection();
    await connection.query(createTableQuery);
    console.log('Events table checked/created successfully.');
    connection.release();
  } catch (error) {
    console.error('Error creating events table:', error.message);
    throw error;
  }
}

async function createCalendarMarksTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS calendar_marks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL, -- Assuming user_id from auth is a string like in events table
      mark_date DATE NOT NULL,
      text TEXT,
      is_locked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      -- If user_id were an INT referencing a users table:
      -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY user_date_unique (user_id, mark_date) -- Ensures one mark per user per day
    );
  `;
  try {
    const connection = await pool.getConnection();
    await connection.query(createTableQuery);
    console.log('Calendar marks table checked/created successfully.');
    connection.release();
  } catch (error) {
    console.error('Error creating calendar_marks table:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  // createChatMessagesTable, // Removed
  // saveChatMessage, // Removed
  // getChatMessages, // Removed
  createEventsTable,
  createCalendarMarksTable // Export the new function
};
