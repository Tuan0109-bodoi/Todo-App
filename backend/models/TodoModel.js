const pool = require('../config/db');

const TodoModel = {
    getTotalItems: async (userId) => {
        const result = await pool.query("SELECT COUNT(*) AS total FROM tasktodo WHERE user_id = $1", [userId]);
        return parseInt(result.rows[0].total);
    },
    getTasks: async (userId, limit, offset) => {
        const sql = "SELECT * FROM tasktodo WHERE user_id = $1 ORDER BY ID DESC LIMIT $2 OFFSET $3";
        const result = await pool.query(sql, [userId, limit, offset]);
        return result.rows;
    },
    createTask: async (userId, taskname, status) => {
        const sql = 'INSERT INTO tasktodo (user_id, TaskName, Status) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(sql, [userId, taskname, status]);
        return result.rows[0];
    },
    updateTask: async (userId, id, taskname, status) => {
        const sql = "UPDATE tasktodo SET TaskName = $1, Status = $2 WHERE user_id = $3 AND id = $4 RETURNING *";
        const result = await pool.query(sql, [taskname, status, userId, id]);
        return result.rows[0];
    },
    deleteTask: async (userId, id) => {
        const sql = "DELETE FROM tasktodo WHERE user_id = $1 AND id = $2 RETURNING *";
        const result = await pool.query(sql, [userId, id]);
        return result.rows[0];
    },
    doneTask: async (userId, id) => {
        const sql = "UPDATE tasktodo SET Status = 1 WHERE user_id = $1 AND id = $2 RETURNING *";
        const result = await pool.query(sql, [userId, id]);
        return result.rows[0];
    },
    searchTasks: async (userId, taskname, status, limit, offset) => {
        let sql = "SELECT * FROM tasktodo WHERE user_id = $1";
        let queryParams = [userId];
        let paramIndex = 2;

        if (taskname) {
            sql += ` AND TaskName ILIKE $${paramIndex++}`;
            queryParams.push(`%${taskname}%`);
        }
        if (status !== null && status !== undefined) {
            sql += ` AND Status = $${paramIndex++}`;
            queryParams.push(status);
        }
        sql += ` ORDER BY ID DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        queryParams.push(limit, offset);

        const result = await pool.query(sql, queryParams);
        return result.rows;
    },
    countSearchTasks: async (userId, taskname, status) => {
        let sql = "SELECT COUNT(*) AS total FROM tasktodo WHERE user_id = $1";
        let queryParams = [userId];
        let paramIndex = 2;

        if (taskname) {
            sql += ` AND TaskName ILIKE $${paramIndex++}`;
            queryParams.push(`%${taskname}%`);
        }
        if (status !== null && status !== undefined) {
            sql += ` AND Status = $${paramIndex++}`;
            queryParams.push(status);
        }
        const result = await pool.query(sql, queryParams);
        return parseInt(result.rows[0].total);
    },
    countAllTasks: async () => {
        const sql = 'SELECT COUNT(*) as count FROM tasktodo';
        const result = await pool.query(sql);
        return parseInt(result.rows[0].count);
    },
    countAllCompletedTasks: async () => {
        const sql = 'SELECT COUNT(*) as count FROM tasktodo WHERE Status = 1';
        const result = await pool.query(sql);
        return parseInt(result.rows[0].count);
    }
};

module.exports = TodoModel;