const CalendarMark = require('../models/calendarMarkModel');

exports.getUserMarks = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const marks = await CalendarMark.findByUserId(user_id);
    res.status(200).json(marks);
  } catch (error) {
    console.error("Error in getUserMarks controller:", error);
    res.status(500).json({ message: 'Error fetching calendar marks', error: error.message });
  }
};

exports.createOrUpdateMark = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { mark_date, text, is_locked } = req.body;

    if (!mark_date) {
      return res.status(400).json({ msg: 'Mark date is required.' });
    }

    const markData = {
      user_id,
      mark_date,
      text: text || '', 
      is_locked: typeof is_locked === 'boolean' ? is_locked : false, 
    };

    const savedMark = await CalendarMark.createOrUpdate(markData);
    res.status(201).json(savedMark);
  } catch (error) {
    console.error("Error in createOrUpdateMark controller:", error);
    res.status(500).json({ message: 'Error saving calendar mark', error: error.message });
  }
};

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
exports.updateMarkLockStatus = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { mark_date } = req.params; 
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
            res.status(404).json({ message: 'Mark not found for the given user and date.' });
        }
    } catch (error) {
        console.error("Error in updateMarkLockStatus controller:", error);
        res.status(500).json({ message: 'Error updating mark lock status', error: error.message });
    }
};