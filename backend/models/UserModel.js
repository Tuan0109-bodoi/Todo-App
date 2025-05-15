const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

const UserModel = {
  createUser: (username, email, password) => {
    return pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, password]
    );
  },

  findUserByUsername: (username) => {
    return pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    ).then(res => res.rows[0]);
  },

  findUserByEmail: (email) => {
    return pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    ).then(res => res.rows[0]);
  },

  saveResetToken: (userId, token) => {
    const expires = new Date(Date.now() + 3600000); // 1 hour
    return pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [token, expires, userId]
    );
  },

  findUserByResetToken: (token) => {
    return pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    ).then(res => res.rows[0]);
  },

  updatePassword: (userId, password) => {
    return pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [password, userId]
    );
  },

  getAllUsers: () => {
    return pool.query(
      'SELECT id, username, email, role, created_at, last_login FROM users'
    ).then(res => res.rows);
  },

  findUserById: (id) => {
    return pool.query(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = $1',
      [id]
    ).then(res => res.rows[0]);
  },

  updateUser: (id, userData) => {
    const { username, email, role } = userData;
    return pool.query(
      'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4',
      [username, email, role, id]
    );
  },

  deleteUser: (id) => {
    return pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
  },

  countUsers: () => {
    return pool.query(
      'SELECT COUNT(*) as count FROM users'
    ).then(res => res.rows[0].count);
  },

  countActiveUsers: () => {
    return pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM tasktodo'
    ).then(res => res.rows[0].count);
  }
};

module.exports = UserModel;