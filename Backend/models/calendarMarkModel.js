const { pool } = require('../config/db');

const CalendarMark = {
  async createOrUpdate({ user_id, mark_date, text, is_locked }) {
    const sql = `
      INSERT INTO calendar_marks (user_id, mark_date, text, is_locked)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        text = VALUES(text),
        is_locked = VALUES(is_locked),
        updated_at = CURRENT_TIMESTAMP;
    `;
    try {
      const [result] = await pool.query(sql, [user_id, mark_date, text, is_locked]);
      const selectSql = 'SELECT * FROM calendar_marks WHERE user_id = ? AND mark_date = ?';
      const [rows] = await pool.query(selectSql, [user_id, mark_date]);
      return rows[0];
    } catch (error) {
      console.error("Error in CalendarMark.createOrUpdate:", error);
      throw error;
    }
  },

  async findByUserId(user_id) {
    const sql = 'SELECT id, user_id, mark_date, text, is_locked, created_at, updated_at FROM calendar_marks WHERE user_id = ? ORDER BY mark_date ASC';
    try {
      const [rows] = await pool.query(sql, [user_id]);
      return rows;
    } catch (error) {
      console.error("Error in CalendarMark.findByUserId:", error);
      throw error;
    }
  },

  async findByUserIdAndDate(user_id, mark_date) {
    const sql = 'SELECT id, user_id, mark_date, text, is_locked, created_at, updated_at FROM calendar_marks WHERE user_id = ? AND mark_date = ?';
    try {
      const [rows] = await pool.query(sql, [user_id, mark_date]);
      return rows[0]; // Returns the mark object or undefined
    } catch (error) {
      console.error("Error in CalendarMark.findByUserIdAndDate:", error);
      throw error;
    }
  },

  async delete(id, user_id) { // Ensure user can only delete their own marks
    const sql = 'DELETE FROM calendar_marks WHERE id = ? AND user_id = ?';
    try {
      const [result] = await pool.query(sql, [id, user_id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in CalendarMark.delete:", error);
      throw error;
    }
  },
  
  async updateLockStatus(user_id, mark_date, is_locked) {
    const sql = 'UPDATE calendar_marks SET is_locked = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND mark_date = ?';
    try {
      const [result] = await pool.query(sql, [is_locked, user_id, mark_date]);
      if (result.affectedRows > 0) {
        return this.findByUserIdAndDate(user_id, mark_date);
      }
      return null;
    } catch (error) {
      console.error("Error in CalendarMark.updateLockStatus:", error);
      throw error;
    }
  }
};

module.exports = CalendarMark;