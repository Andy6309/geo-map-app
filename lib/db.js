// lib/db.js
const { Pool } = require('pg')

const pool = new Pool({
  user: 'your-username',
  host: 'localhost', // or your DB host
  database: 'your-database',
  password: 'your-password',
  port: 5432,
})

module.exports = pool
