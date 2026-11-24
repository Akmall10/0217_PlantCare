const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const getAllJournals = async (req, res) => {
  try {
    const { search, kondisi, plant_id } = req.query;
    let query = `
      SELECT j.*, p.nama AS plant_nama
      FROM journals j
      JOIN plants p ON j.plant_id = p.id
    `;
    let conditions = [];
    let params = [];

    if (req.user.role !== 'admin') {
      conditions.push(`p.user_id = $${params.length + 1}`);
      params.push(req.user.id);
    }

    if (plant_id) {
      conditions.push(`j.plant_id = $${params.length + 1}`);
      params.push(plant_id);
    }

    if (kondisi) {
      conditions.push(`j.kondisi = $${params.length + 1}`);
      params.push(kondisi);
    }

    if (search) {
      conditions.push(`LOWER(j.catatan) LIKE LOWER($${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY j.tanggal DESC';

    const result = await pool.query(query, params);
    return ok(res, result.rows, 'Daftar jurnal berhasil dimuat');
  } catch (err) {
    console.error('Get journals error:', err);
    return fail(res, err.message, 500);
  }
};

const getJournalById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT j.*, p.nama AS plant_nama, p.user_id
      FROM journals j
      JOIN plants p ON j.plant_id = p.id
      WHERE j.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return fail(res, 'Jurnal tidak ditemukan', 404);
    }

    const journal = result.rows[0];
    if (req.user.role !== 'admin' && journal.user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    return ok(res, journal, 'Detail jurnal berhasil dimuat');
  } catch (err) {
    console.error('Get journal detail error:', err);
    return fail(res, err.message, 500);
  }
};

const createJournal = async (req, res) => {
  try {
    const { plant_id, tanggal, tinggi_cm, jumlah_daun, kondisi, catatan, foto_path } = req.body;
    if (!plant_id || !tanggal || !kondisi) {
      return fail(res, 'Plant, tanggal, dan kondisi wajib diisi', 400);
    }

    if (!['sehat', 'perlu perhatian', 'sakit'].includes(kondisi)) {
      return fail(res, 'Kondisi harus sehat, perlu perhatian, atau sakit', 400);
    }

    // Verify plant ownership
    const plantCheck = await pool.query('SELECT user_id FROM plants WHERE id = $1', [plant_id]);
    if (plantCheck.rowCount === 0) {
      return fail(res, 'Tanaman tidak ditemukan', 404);
    }
    if (plantCheck.rows[0].user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    const result = await pool.query(`
      INSERT INTO journals (plant_id, tanggal, tinggi_cm, jumlah_daun, kondisi, catatan, foto_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      plant_id,
      tanggal,
      tinggi_cm !== undefined && tinggi_cm !== '' ? tinggi_cm : null,
      jumlah_daun !== undefined && jumlah_daun !== '' ? jumlah_daun : null,
      kondisi,
      catatan || null,
      foto_path || null
    ]);

    return ok(res, result.rows[0], 'Jurnal berhasil ditambahkan', 201);
  } catch (err) {
    console.error('Create journal error:', err);
    return fail(res, err.message, 500);
  }
};

const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const journalCheck = await pool.query(`
      SELECT j.*, p.user_id FROM journals j
      JOIN plants p ON j.plant_id = p.id
      WHERE j.id = $1
    `, [id]);

    if (journalCheck.rowCount === 0) {
      return fail(res, 'Jurnal tidak ditemukan', 404);
    }

    if (journalCheck.rows[0].user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    const { plant_id, tanggal, tinggi_cm, jumlah_daun, kondisi, catatan, foto_path } = req.body;
    if (!plant_id || !tanggal || !kondisi) {
      return fail(res, 'Plant, tanggal, dan kondisi wajib diisi', 400);
    }

    const result = await pool.query(`
      UPDATE journals
      SET plant_id = $1, tanggal = $2, tinggi_cm = $3, jumlah_daun = $4, kondisi = $5, catatan = $6, foto_path = $7
      WHERE id = $8
      RETURNING *
    `, [
      plant_id,
      tanggal,
      tinggi_cm !== undefined && tinggi_cm !== '' ? tinggi_cm : null,
      jumlah_daun !== undefined && jumlah_daun !== '' ? jumlah_daun : null,
      kondisi,
      catatan || null,
      foto_path || null,
      id
    ]);

    return ok(res, result.rows[0], 'Jurnal berhasil diperbarui');
  } catch (err) {
    console.error('Update journal error:', err);
    return fail(res, err.message, 500);
  }
};

const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const journalCheck = await pool.query(`
      SELECT j.*, p.user_id FROM journals j
      JOIN plants p ON j.plant_id = p.id
      WHERE j.id = $1
    `, [id]);

    if (journalCheck.rowCount === 0) {
      return fail(res, 'Jurnal tidak ditemukan', 404);
    }

    if (journalCheck.rows[0].user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    await pool.query('DELETE FROM journals WHERE id = $1', [id]);
    return ok(res, null, 'Jurnal berhasil dihapus');
  } catch (err) {
    console.error('Delete journal error:', err);
    return fail(res, err.message, 500);
  }
};

module.exports = { getAllJournals, getJournalById, createJournal, updateJournal, deleteJournal };
