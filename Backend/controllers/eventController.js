const { pool } = require('../config/db'); // Using MySQL pool
const asyncHandler = require('express-async-handler');

// Helper function to format ISO date string to MySQL DATETIME format
const formatDateForMySQL = (isoDateString) => {
  if (!isoDateString) return null;
  return new Date(isoDateString).toISOString().slice(0, 19).replace('T', ' ');
};

// @desc    Get all events for a user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
  // Assuming req.user.id contains the authenticated user's ID
  const [events] = await pool.query('SELECT id, user_id, title, start_time AS start, end_time AS end, all_day AS allDay, description, location, distance, created_at, updated_at FROM events WHERE user_id = ?', [req.user.id]);
  res.status(200).json(events);
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  // Log the entire req.body as received by the controller
  console.log('Backend CONTROLLER: createEvent called. Full req.body:', JSON.stringify(req.body, null, 2));

  const { title, start, end, allDay, description, location, distance } = req.body; // Added distance
  const userId = req.user.id; // Assuming req.user.id is available

  // Log the destructured values immediately before validation
  console.log(`Backend CONTROLLER: Destructured values before validation - title: "${title}", start: "${start}", end: "${end}"`);

  if (!title || !start || !end) {
    // Log the actual values that caused the validation to fail
    console.error(`Backend CONTROLLER: Validation Error! title: "${title}", start: "${start}", end: "${end}"`);
    res.status(400);
    throw new Error('Please provide title, start, and end dates for the event');
  }

  // Ensure distance is a number or null, not undefined, if it's optional
  const dbDistance = (distance === undefined || distance === '') ? null : Number(distance);
  if (isNaN(dbDistance) && dbDistance !== null) {
      console.error(`Backend CONTROLLER: Validation Error! Distance is not a valid number: "${distance}"`);
      res.status(400);
      throw new Error('Distance must be a valid number.');
  }

  const query = 'INSERT INTO events (user_id, title, start_time, end_time, all_day, description, location, distance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'; // Added distance
  // Log the query and parameters before execution
  console.log('Backend CONTROLLER: Executing SQL query:', query);
  const formattedStart = formatDateForMySQL(start);
  const formattedEnd = formatDateForMySQL(end);

  console.log('Backend CONTROLLER: Query parameters:', JSON.stringify([userId, title, formattedStart, formattedEnd, allDay || false, description, location, dbDistance], null, 2));

  try {
    const [result] = await pool.query(query, [userId, title, formattedStart, formattedEnd, allDay || false, description, location, dbDistance]); 

    if (result.affectedRows === 1) {
      const insertId = result.insertId;
      console.log('Backend CONTROLLER: Event created successfully. Insert ID:', insertId);
      console.log('Backend CONTROLLER: Attempting to fetch newly created event with ID:', insertId);
      const [newEventResult] = await pool.query('SELECT id, user_id, title, start_time AS start, end_time AS end, all_day AS allDay, description, location, distance, created_at, updated_at FROM events WHERE id = ?', [insertId]);
      
      console.log('Backend CONTROLLER: Result of fetching new event:', JSON.stringify(newEventResult, null, 2));

      if (newEventResult && newEventResult.length > 0) {
        res.status(201).json(newEventResult[0]);
      } else {
        console.error(`Backend CONTROLLER: Event created (ID: ${insertId}) but failed to fetch the new event details. newEventResult length: ${newEventResult ? newEventResult.length : 'undefined/null'}.`);
        res.status(201).json({ id: insertId, message: "Event created, but full details could not be retrieved." });
      }
    } else {
      console.error('Backend CONTROLLER: Failed to create event in DB - no rows affected or unexpected result. Result:', result);
      const creationError = new Error('Failed to create event in database.');
      creationError.status = 500; 
      throw creationError; 
    }
  } catch (dbError) {
    console.error('Backend CONTROLLER: DATABASE ERROR during event creation:', dbError);
    throw dbError; // Re-throw the error to be caught by asyncHandler
  }
});


const getEventById = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  const [events] = await pool.query('SELECT id, user_id, title, start_time AS start, end_time AS end, all_day AS allDay, description, location, distance, created_at, updated_at FROM events WHERE id = ?', [eventId]);

  if (events.length === 0) {
    res.status(404);
    throw new Error('Event not found');
  }

  const event = events[0];
  // Ensure user owns the event
  if (event.user_id.toString() !== userId.toString()) { // Ensure consistent type for comparison
    res.status(401);
    throw new Error('User not authorized');
  }

  res.status(200).json(event);
});


const updateEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const { title, start, end, allDay, description, location, distance } = req.body; // Added distance

  const [existingEvents] = await pool.query('SELECT user_id FROM events WHERE id = ?', [eventId]);

  if (existingEvents.length === 0) {
    res.status(404);
    throw new Error('Event not found');
  }

  const eventOwnerId = existingEvents[0].user_id;
  if (eventOwnerId.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const formattedStartUpdate = formatDateForMySQL(start);
  const formattedEndUpdate = formatDateForMySQL(end);

  const query = 'UPDATE events SET title = ?, start_time = ?, end_time = ?, all_day = ?, description = ?, location = ?, distance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'; // Added distance
  const [result] = await pool.query(query, [title, formattedStartUpdate, formattedEndUpdate, allDay || false, description, location, distance, eventId]); // Added distance

  if (result.affectedRows === 1) {
    const [updatedEvent] = await pool.query('SELECT id, user_id, title, start_time AS start, end_time AS end, all_day AS allDay, description, location, distance, created_at, updated_at FROM events WHERE id = ?', [eventId]);
    res.status(200).json(updatedEvent[0]);
  } else {
   
    const [currentEvent] = await pool.query('SELECT id, user_id, title, start_time AS start, end_time AS end, all_day AS allDay, description, location, distance, created_at, updated_at FROM events WHERE id = ?', [eventId]);
    res.status(200).json(currentEvent[0]);
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  const [events] = await pool.query('SELECT user_id FROM events WHERE id = ?', [eventId]);

  if (events.length === 0) {
    res.status(404);
    throw new Error('Event not found');
  }

  const eventOwnerId = events[0].user_id;
  if (eventOwnerId.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const [result] = await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

  if (result.affectedRows === 1) {
    res.status(200).json({ id: eventId, message: 'Event removed' });
  } else {
    res.status(404); 
    throw new Error('Event not found or could not be deleted');
  }
});

module.exports = {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
};