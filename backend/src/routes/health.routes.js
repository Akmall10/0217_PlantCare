const express = require('express');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// GET /api/health : memastikan server dan database terhubung
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS waktu');
    return ok(res, { database: 'terhubung', waktu: result.rows[0].waktu }, 'Server berjalan');
  } catch (err) {
    console.error(err.message);
    return fail(res, 'Database tidak dapat dihubungi', 500);
  }
});

module.exports = router;
