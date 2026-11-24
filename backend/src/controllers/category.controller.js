const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM categories';
    let params = [];

    if (search) {
      query += ' WHERE LOWER(nama) LIKE LOWER($1) OR LOWER(deskripsi) LIKE LOWER($1)';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    return ok(res, result.rows, 'Daftar kategori berhasil dimuat');
  } catch (err) {
    console.error('Get categories error:', err);
    return fail(res, err.message, 500);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return fail(res, 'Kategori tidak ditemukan', 404);
    }
    return ok(res, result.rows[0], 'Detail kategori berhasil dimuat');
  } catch (err) {
    console.error('Get category detail error:', err);
    return fail(res, err.message, 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { nama, deskripsi, kebutuhan_cahaya } = req.body;
    if (!nama || !kebutuhan_cahaya) {
      return fail(res, 'Nama dan kebutuhan cahaya wajib diisi', 400);
    }
    if (nama.length > 50) {
      return fail(res, 'Nama kategori maksimal 50 karakter', 400);
    }
    if (!['rendah', 'sedang', 'tinggi'].includes(kebutuhan_cahaya)) {
      return fail(res, 'Kebutuhan cahaya harus rendah, sedang, atau tinggi', 400);
    }

    const existing = await pool.query('SELECT id FROM categories WHERE LOWER(nama) = LOWER($1)', [nama]);
    if (existing.rowCount > 0) {
      return fail(res, 'Nama kategori sudah ada', 400);
    }

    const result = await pool.query(
      'INSERT INTO categories (nama, deskripsi, kebutuhan_cahaya) VALUES ($1, $2, $3) RETURNING *',
      [nama, deskripsi || null, kebutuhan_cahaya]
    );

    return ok(res, result.rows[0], 'Kategori berhasil ditambahkan', 201);
  } catch (err) {
    console.error('Create category error:', err);
    return fail(res, err.message, 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, kebutuhan_cahaya } = req.body;

    const check = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return fail(res, 'Kategori tidak ditemukan', 404);
    }

    if (!nama || !kebutuhan_cahaya) {
      return fail(res, 'Nama dan kebutuhan cahaya wajib diisi', 400);
    }
    if (nama.length > 50) {
      return fail(res, 'Nama kategori maksimal 50 karakter', 400);
    }
    if (!['rendah', 'sedang', 'tinggi'].includes(kebutuhan_cahaya)) {
      return fail(res, 'Kebutuhan cahaya harus rendah, sedang, atau tinggi', 400);
    }

    const result = await pool.query(
      'UPDATE categories SET nama = $1, deskripsi = $2, kebutuhan_cahaya = $3 WHERE id = $4 RETURNING *',
      [nama, deskripsi || null, kebutuhan_cahaya, id]
    );

    return ok(res, result.rows[0], 'Kategori berhasil diperbarui');
  } catch (err) {
    console.error('Update category error:', err);
    return fail(res, err.message, 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return fail(res, 'Kategori tidak ditemukan', 404);
    }

    // Check if category is used by plants
    const used = await pool.query('SELECT id FROM plants WHERE category_id = $1 LIMIT 1', [id]);
    if (used.rowCount > 0) {
      return fail(res, 'Kategori masih dipakai oleh tanaman dan tidak dapat dihapus', 409);
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return ok(res, null, 'Kategori berhasil dihapus');
  } catch (err) {
    console.error('Delete category error:', err);
    return fail(res, err.message, 500);
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
