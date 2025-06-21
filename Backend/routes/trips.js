const express = require('express');
const router = express.Router();
const db = require('../db'); // your MySQL connection instance

router.post('/', async (req, res) => {
  const {
    name,
    destination,
    startDate,
    endDate,
    teamMembers,
    budget,
    notes,
    interests,
    travelers
  } = req.body;

  try {
    const query = `
      INSERT INTO trips 
      (name, destination, start_date, end_date, team_members, budget, notes, interests, travelers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      destination,
      startDate,
      endDate,
      JSON.stringify(teamMembers || []),
      budget,
      notes,
      JSON.stringify(interests || []),
      travelers
    ];

    await db.execute(query, values);
    res.status(201).json({ message: 'Trip saved successfully' });
  } catch (err) {
    console.error('Insert Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
