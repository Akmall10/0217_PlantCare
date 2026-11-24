const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return fail(res, 'Token akses tidak ditemukan', 401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_access_key', (err, user) => {
    if (err) {
      return fail(res, 'Token tidak valid atau kedaluwarsa', 401);
    }
    req.user = user;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return fail(res, 'Akses ditolak. Hanya untuk admin', 403);
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
