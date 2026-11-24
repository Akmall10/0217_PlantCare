const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const getAllTreatments = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM treatment_types';
    let params = [];

    if (search) {
      query += ' WHERE LOWER(nama) LIKE LOWER($1) OR LOWER(deskripsi) LIKE LOWER($1)';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY id ASC';

    const result = await pool.query(query, params);
    return ok(res, result.rows, 'Daftar jenis perawatan berhasil dimuat');
  } catch (err) {
    console.error('Get treatments error:', err);
    return fail(res, err.message, 500);
  }
};

const createTreatment = async (req, res) => {
  try {
    const { nama, satuan, deskripsi } = req.body;
    if (!nama || !satuan) {
      return fail(res, 'Nama dan satuan wajib diisi', 400);
    }

    const existing = await pool.query('SELECT id FROM treatment_types WHERE LOWER(nama) = LOWER($1)', [nama]);
    if (existing.rowCount > 0) {
      return fail(res, 'Nama jenis perawatan sudah ada', 400);
    }

    const result = await pool.query(
      'INSERT INTO treatment_types (nama, satuan, deskripsi) VALUES ($1, $2, $3) RETURNING *',
      [nama, satuan, deskripsi || null]
    );

    return ok(res, result.rows[0], 'Jenis perawatan berhasil ditambahkan', 201);
  } catch (err) {
    console.error('Create treatment error:', err);
    return fail(res, err.message, 500);
  }
};

const updateTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, satuan, deskripsi } = req.body;

    const check = await pool.query('SELECT * FROM treatment_types WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return fail(res, 'Jenis perawatan tidak ditemukan', 404);
    }

    if (!nama || !satuan) {
      return fail(res, 'Nama dan satuan wajib diisi', 400);
    }

    const result = await pool.query(
      'UPDATE treatment_types SET nama = $1, satuan = $2, deskripsi = $3 WHERE id = $4 RETURNING *',
      [nama, satuan, deskripsi || null, id]
    );

    return ok(res, result.rows[0], 'Jenis perawatan berhasil diperbarui');
  } catch (err) {
    console.error('Update treatment error:', err);
    return fail(res, err.message, 500);
  }
};

const deleteTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT * FROM treatment_types WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return fail(res, 'Jenis perawatan tidak ditemukan', 404);
    }

    const used = await pool.query('SELECT id FROM schedules WHERE treatment_type_id = $1 LIMIT 1', [id]);
    if (used.rowCount > 0) {
      return fail(res, 'Jenis perawatan masih dipakai oleh jadwal dan tidak dapat dihapus', 409);
    }

    await pool.query('DELETE FROM treatment_types WHERE id = $1', [id]);
    return ok(res, null, 'Jenis perawatan berhasil dihapus');
  } catch (err) {
    console.error('Delete treatment error:', err);
    return fail(res, err.message, 500);
  }
};

module.exports = { getAllTreatments, createTreatment, updateTreatment, deleteTreatment };
