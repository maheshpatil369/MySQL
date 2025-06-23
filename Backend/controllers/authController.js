// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { pool } = require('../config/db');
// require('dotenv').config();

// const JWT_SECRET = process.env.JWT_SECRET;

// // Helper function to create users table if it doesn't exist
// async function createUserTableIfNotExists() {
//   const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL UNIQUE,
//       password VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;
//   try {
//     const [rows, fields] = await pool.execute(createTableQuery);
//     if (rows.warningStatus === 0) {
//       // console.log("Users table checked/created successfully.");
//     }
//   } catch (error) {
//     console.error('Error creating users table:', error);
//     // We might want to throw this error or handle it more gracefully
//     // For now, we'll let the server start but log the error.
//   }
// }

// // Call this function once when the module is loaded
// createUserTableIfNotExists();

// // Register User
// exports.registerUser = async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({ msg: 'Please enter all fields' });
//   }

//   try {
//     // Check if user already exists
//     const [existingUsers] = await pool.execute('SELECT email FROM users WHERE email = ?', [email]);
//     if (existingUsers.length > 0) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Insert user into database
//     const [result] = await pool.execute(
//       'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//       [name, email, hashedPassword]
//     );

//     const userId = result.insertId;

//     // Create token
//     const token = jwt.sign({ id: userId, name: name, email: email }, JWT_SECRET, {
//       expiresIn: '1h' // Token expires in 1 hour
//     });

//     res.status(201).json({
//       token,
//       user: {
//         id: userId,
//         name: name,
//         email: email
//       },
//       msg: 'User registered successfully'
//     });

//   } catch (err) {
//     console.error('Server error during registration:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// // Login User
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ msg: 'Please enter all fields' });
//   }

//   try {
//     // Check for user
//     const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
//     if (users.length === 0) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     const user = users[0];

//     // Validate password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     // Create token
//     const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
//       expiresIn: '1h' // Token expires in 1 hour
//     });

//     res.json({
//   success: true,
//   token,
//   user: {
//     id: user.id,
//     name: user.name,
//     email: user.email
//   },
//   msg: 'Logged in successfully'
// });

//   } catch (err) {
//     console.error('Server error during login:', err.message);
//     res.status(500).send('Server error');
//   }
// };



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

async function createUserTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NULL,
      location VARCHAR(255) NULL,
      bio TEXT NULL,
      avatar_url VARCHAR(2048) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.execute(createTableQuery);
    console.log('✅ Users table structure base checked/created.');

    const columnsToAdd = [
      { name: 'phone', definition: 'VARCHAR(20) NULL' },
      { name: 'location', definition: 'VARCHAR(255) NULL' },
      { name: 'bio', definition: 'TEXT NULL' },
      { name: 'avatar_url', definition: 'VARCHAR(2048) NULL' }
    ];

    const [dbNameRows] = await pool.query('SELECT DATABASE() as dbName;');
    const dbName = dbNameRows[0].dbName;

    for (const column of columnsToAdd) {
      const [columnExistsRows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
        [dbName, column.name]
      );

      if (columnExistsRows[0].count === 0) {
        await pool.execute(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`✅ Added missing column '${column.name}' to 'users' table.`);
      }
    }
    console.log('✅ Users table schema verified and updated if necessary.');

  } catch (error) {
    console.error('❌ Error during users table setup/migration:', error.message, error.stack);
  }
}

createUserTableIfNotExists();

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const [existingUsers] = await pool.execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, name, email }, // Keep JWT payload concise for now, or add new fields if needed everywhere
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Fetch the core user object to return. Optional fields might not exist if ALTER TABLE failed.
    // This is a workaround for the "Unknown column" error during registration.
    // The schema migration issue (ALTER TABLE) needs to be addressed for full functionality.
    const [newUsers] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [userId]);

    res.status(201).json({
      success: true,
      token,
      user: newUsers[0], // Return the full new user object
      msg: 'User registered successfully'
    });

  } catch (err) {
    console.error('Server error during registration:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email }, // Keep JWT payload concise
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const { password: _, ...userWithoutPassword } = user; 

    res.json({
      success: true,
      token,
      user: userWithoutPassword, 
      msg: 'Logged in successfully'
    });

  } catch (err) {
    console.error('Server error during login:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  const { name, phone, location, bio, avatar_url } = req.body;
  const userId = req.user.id;

  let updateFields = [];
  let queryParams = [];

  if (name !== undefined) {
    updateFields.push('name = ?');
    queryParams.push(name);
  }
  if (phone !== undefined) {
    updateFields.push('phone = ?');
    queryParams.push(phone);
  }
  if (location !== undefined) {
    updateFields.push('location = ?');
    queryParams.push(location);
  }
  if (bio !== undefined) {
    updateFields.push('bio = ?');
    queryParams.push(bio);
  }
  if (avatar_url !== undefined) {
    updateFields.push('avatar_url = ?');
    queryParams.push(avatar_url);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ msg: 'No fields provided for update.' });
  }

  queryParams.push(userId); // For the WHERE clause

  try {
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'User not found or no changes made.' });
    }

    // Fetch updated user details (all fields)
    const [updatedUsers] = await pool.execute('SELECT id, name, email, phone, location, bio, avatar_url FROM users WHERE id = ?', [userId]);
    if (updatedUsers.length === 0) {
        return res.status(404).json({ msg: 'Updated user not found.' });
    }
    const updatedUser = updatedUsers[0];

    const newToken = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token: newToken,
      user: updatedUser,
      msg: 'Profile updated successfully'
    });

  } catch (err) {
    console.error('Server error during profile update:', err.message);
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) { 
        return res.status(400).json({ msg: 'Email already exists.' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
