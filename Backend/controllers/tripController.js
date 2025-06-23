const { pool } = require('../config/db');

// Helper function to create trips table if it doesn't exist
async function createTripsTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS trips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      start_city VARCHAR(255) NOT NULL,
      end_city VARCHAR(255) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      travelers INT NOT NULL,
      interests JSON, -- Store as JSON array of strings
      travel_option_type VARCHAR(50),
      travel_option_name VARCHAR(100),
      travel_option_price VARCHAR(50), -- Storing as VARCHAR as it might contain currency symbols or ranges
      travel_option_duration VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  try {
    const [rows, fields] = await pool.execute(createTableQuery);
    if (rows.warningStatus === 0) {
      // console.log("Trips table checked/created successfully.");
    }
  } catch (error) {
    console.error('Error creating trips table:', error);
  }
}

// Call this function once when the module is loaded
createTripsTableIfNotExists();

// Create a new trip plan
exports.createTrip = async (req, res) => {
  const {
    startCity,
    endCity,
    startDate,
    endDate,
    travelers,
    selectedInterests, // Array of strings
    travelOption // Object { type, name, price, duration }
  } = req.body;
  
  const userId = req.user.id; // From authMiddleware

  if (!startCity || !endCity || !startDate || !endDate || !travelers || !travelOption || !travelOption.type) {
    return res.status(400).json({ msg: 'Please provide all required trip details.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO trips (user_id, start_city, end_city, start_date, end_date, travelers, interests, travel_option_type, travel_option_name, travel_option_price, travel_option_duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        startCity,
        endCity,
        new Date(startDate).toISOString().slice(0, 10), // Ensure date is in YYYY-MM-DD format
        new Date(endDate).toISOString().slice(0, 10),   // Ensure date is in YYYY-MM-DD format
        travelers,
        JSON.stringify(selectedInterests || []), // Store interests as JSON string
        travelOption.type,
        travelOption.name,
        travelOption.price,
        travelOption.duration
      ]
    );

    res.status(201).json({
      msg: 'Trip created successfully',
      tripId: result.insertId,
      trip: {
        id: result.insertId,
        userId,
        startCity,
        endCity,
        startDate,
        endDate,
        travelers,
        selectedInterests: selectedInterests || [],
        travelOption
      }
    });
  } catch (err) {
    console.error('Server error during trip creation:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all trips for the logged-in user
exports.getMyTrips = async (req, res) => {
  const userId = req.user.id;

  try {
    const [trips] = await pool.execute(
      'SELECT id, start_city, end_city, start_date, end_date, travelers, interests, travel_option_type, travel_option_name, travel_option_price, travel_option_duration, created_at FROM trips WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Safely parse interests JSON string back to array
    const formattedTrips = trips.map(trip => {
      let parsedInterests = [];
      if (trip.interests) {
        try {
          parsedInterests = JSON.parse(trip.interests);
          if (!Array.isArray(parsedInterests)) { // Ensure it's an array
            parsedInterests = [String(parsedInterests)];
          }
        } catch (e) {
          if (typeof trip.interests === 'string') {
            parsedInterests = trip.interests.split(',').map(s => s.trim()).filter(s => s);
          } else {
            parsedInterests = [String(trip.interests)]; // Fallback
          }
        }
      }
      return {
        ...trip,
        interests: parsedInterests
      };
    });
    
    res.json(formattedTrips);
  } catch (err) {
    console.error('Server error while fetching trips:', err.message);
    res.status(500).json({ msg: 'Server error while fetching trips', error: err.message });
  }
};

// Get a specific trip by ID
exports.getTripById = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id; 

  try {
    const [trips] = await pool.execute(
      'SELECT id, user_id, start_city, end_city, start_date, end_date, travelers, interests, travel_option_type, travel_option_name, travel_option_price, travel_option_duration, created_at FROM trips WHERE id = ? AND user_id = ?',
      [tripId, userId]
    );

    if (trips.length === 0) {
      return res.status(404).json({ msg: 'Trip not found or not authorized' });
    }
    
    const trip = trips[0];
    let parsedInterests = [];
    if (trip.interests) {
      try {
        parsedInterests = JSON.parse(trip.interests);
        if (!Array.isArray(parsedInterests)) { // Ensure it's an array
          parsedInterests = [String(parsedInterests)];
        }
      } catch (e) {
        if (typeof trip.interests === 'string') {
          parsedInterests = trip.interests.split(',').map(s => s.trim()).filter(s => s);
        } else {
          parsedInterests = [String(trip.interests)]; // Fallback
        }
      }
    }
    const formattedTrip = {
        ...trip,
        interests: parsedInterests
    };

    res.json(formattedTrip);
  } catch (err) {
    console.error('Server error while fetching trip by ID:', err.message);
    res.status(500).json({ msg: 'Server error while fetching trip by ID', error: err.message });
  }
};
