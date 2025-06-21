const CalendarMark = require('../models/calendarMarkModel');

// Get all marks for the authenticated user
exports.getUserMarks = async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming authMiddleware provides req.user.id as a string
    const marks = await CalendarMark.findByUserId(user_id);
    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getUserMarks controller:", error);
    res.status(500).json({ message: 'Error fetching calendar marks', error: error.message });
  }
};

// Create or Update a mark for a specific date for the authenticated user
exports.createOrUpdateMark = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { mark_date, text, is_locked } = req.body;

    if (!mark_date) {
      return res.status(400).json({ msg: 'Mark date is required.' });
    }
    // Text can be empty if user just wants to lock/unlock a date or clear a note
    // is_locked should default if not provided, model handles this or controller can set default.

    const markData = {
      user_id,
      mark_date,
      text: text || '', // Default to empty string if not provided
      is_locked: typeof is_locked === 'boolean' ? is_locked : false, // Default to false
    };

    const savedMark = await CalendarMark.createOrUpdate(markData);
    res.status(201).json(savedMark);
  } catch (error) {
    console.error("Error in createOrUpdateMark controller:", error);
    res.status(500).json({ message: 'Error saving calendar mark', error: error.message });
  }
};

// Delete a specific mark by its ID for the authenticated user
exports.deleteMarkById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const markId = req.params.id;

    const deleted = await CalendarMark.delete(markId, user_id);
    if (deleted) {
      res.status(200).json({ message: 'Calendar mark deleted successfully' });
    } else {
      res.status(404).json({ message: 'Mark not found or user not authorized to delete' });
    }
  } catch (error) {
    console.error("Error in deleteMarkById controller:", error);
    res.status(500).json({ message: 'Error deleting calendar mark', error: error.message });
  }
};

// Controller specifically for updating lock status (can also be part of createOrUpdateMark)
exports.updateMarkLockStatus = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { mark_date } = req.params; // Assuming date is part of the URL for this specific action
        const { is_locked } = req.body;

        if (typeof is_locked !== 'boolean') {
            return res.status(400).json({ msg: 'is_locked (boolean) is required in the body.' });
        }
        if (!mark_date) {
            return res.status(400).json({ msg: 'mark_date is required as a URL parameter.' });
        }
        
        const updatedMark = await CalendarMark.updateLockStatus(user_id, mark_date, is_locked);
        if (updatedMark) {
            res.status(200).json(updatedMark);
        } else {
            // This could happen if the mark doesn't exist for that user and date
            // To be more robust, one might create the mark if it doesn't exist before locking.
            // For now, assume it must exist.
            res.status(404).json({ message: 'Mark not found for the given user and date.' });
        }
    } catch (error) {
        console.error("Error in updateMarkLockStatus controller:", error);
        res.status(500).json({ message: 'Error updating mark lock status', error: error.message });
    }
};