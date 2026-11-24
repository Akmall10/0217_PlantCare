const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_access_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'secret_refresh_key';

const register = async (req, res) => {
  try {
    const { nama, email, password, konfirmasi_password } = req.body;

    if (!nama || !email || !password || !konfirmasi_password) {
      return fail(res, 'Semua field wajib diisi', 400);
    }

    if (password !== konfirmasi_password) {
      return fail(res, 'Konfirmasi password tidak cocok', 400);
    }

    if (password.length < 8) {
      return fail(res, 'Password minimal 8 karakter', 400);
    }

    // Check email format & uniqueness
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(res, 'Format email tidak valid', 400);
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return fail(res, 'Email sudah terdaftar', 400);
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (nama, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, nama, email, role, created_at`,
      [nama, email, hash]
    );

    return ok(res, result.rows[0], 'Registrasi berhasil', 201);
  } catch (err) {
    console.error('Register error:', err);
    return fail(res, err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 'Email dan password wajib diisi', 400);
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return fail(res, 'Email atau password salah', 401);
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return fail(res, 'Email atau password salah', 401);
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    return ok(res, {
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      access_token: accessToken,
      refresh_token: refreshToken
    }, 'Login berhasil');
  } catch (err) {
    console.error('Login error:', err);
    return fail(res, err.message, 500);
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return fail(res, 'Refresh token diperlukan', 400);
    }

    const tokenRecord = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = FALSE',
      [refresh_token]
    );
    if (tokenRecord.rowCount === 0) {
      return fail(res, 'Refresh token tidak valid atau dicabut', 401);
    }

    jwt.verify(refresh_token, REFRESH_SECRET, (err, user) => {
      if (err) {
        return fail(res, 'Refresh token kedaluwarsa', 401);
      }
      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      return ok(res, { access_token: accessToken }, 'Token berhasil diperbarui');
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return fail(res, err.message, 500);
  }
};

const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [refresh_token]);
    }
    return ok(res, null, 'Logout berhasil');
  } catch (err) {
    console.error('Logout error:', err);
    return fail(res, err.message, 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nama, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return fail(res, 'Pengguna tidak ditemukan', 404);
    }
    return ok(res, result.rows[0], 'Profil berhasil dimuat');
  } catch (err) {
    console.error('Profile error:', err);
    return fail(res, err.message, 500);
  }
};

module.exports = { register, login, refreshTokenHandler, logout, getProfile };
