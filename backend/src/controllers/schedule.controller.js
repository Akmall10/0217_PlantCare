const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const getAllSchedules = async (req, res) => {
  try {
    const { search, status, plant_id } = req.query;
    let query = `
      SELECT s.*, p.nama AS plant_nama, t.nama AS treatment_nama, t.satuan
      FROM schedules s
      JOIN plants p ON s.plant_id = p.id
      JOIN treatment_types t ON s.treatment_type_id = t.id
    `;
    let conditions = [];
    let params = [];

    if (req.user.role !== 'admin') {
      conditions.push(`p.user_id = $${params.length + 1}`);
      params.push(req.user.id);
    }

    if (plant_id) {
      conditions.push(`s.plant_id = $${params.length + 1}`);
      params.push(plant_id);
    }

    if (status) {
      conditions.push(`s.status = $${params.length + 1}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(LOWER(p.nama) LIKE LOWER($${params.length + 1}) OR LOWER(t.nama) LIKE LOWER($${params.length + 1}))`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.tanggal_berikutnya ASC';

    const result = await pool.query(query, params);

    // Check overdue status
    const todayStr = new Date().toISOString().split('T')[0];
    const schedules = result.rows.map(s => {
      const isOverdue = s.status === 'aktif' && s.tanggal_berikutnya < todayStr;
      return { ...s, is_overdue: isOverdue };
    });

    return ok(res, schedules, 'Daftar jadwal berhasil dimuat');
  } catch (err) {
    console.error('Get schedules error:', err);
    return fail(res, err.message, 500);
  }
};

const getHomeSchedules = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const query = `
      SELECT s.*, p.nama AS plant_nama, t.nama AS treatment_nama, t.satuan
      FROM schedules s
      JOIN plants p ON s.plant_id = p.id
      JOIN treatment_types t ON s.treatment_type_id = t.id
      WHERE p.user_id = $1 AND s.status = 'aktif' AND s.tanggal_berikutnya <= $2
      ORDER BY s.tanggal_berikutnya ASC
    `;
    const result = await pool.query(query, [req.user.id, todayStr]);
    return ok(res, result.rows, 'Jadwal hari ini dan terlambat berhasil dimuat');
  } catch (err) {
    console.error('Get home schedules error:', err);
    return fail(res, err.message, 500);
  }
};

const createSchedule = async (req, res) => {
  try {
    const { plant_id, treatment_type_id, interval_hari, tanggal_berikutnya, jam_perawatan, status, catatan } = req.body;
    if (!plant_id || !treatment_type_id || !interval_hari || !tanggal_berikutnya) {
      return fail(res, 'Plant, jenis perawatan, interval, dan tanggal berikutnya wajib diisi', 400);
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
      INSERT INTO schedules (plant_id, treatment_type_id, interval_hari, tanggal_berikutnya, jam_perawatan, status, catatan)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [plant_id, treatment_type_id, interval_hari, tanggal_berikutnya, jam_perawatan || null, status || 'aktif', catatan || null]);

    return ok(res, result.rows[0], 'Jadwal berhasil ditambahkan', 201);
  } catch (err) {
    console.error('Create schedule error:', err);
    return fail(res, err.message, 500);
  }
};

const markScheduleDone = async (req, res) => {
  try {
    const { id } = req.params;
    const schedCheck = await pool.query(`
      SELECT s.*, p.user_id FROM schedules s
      JOIN plants p ON s.plant_id = p.id
      WHERE s.id = $1
    `, [id]);

    if (schedCheck.rowCount === 0) {
      return fail(res, 'Jadwal tidak ditemukan', 404);
    }

    const sched = schedCheck.rows[0];
    if (sched.user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    // Calculate next date: today + interval_hari
    const today = new Date();
    today.setDate(today.getDate() + parseInt(sched.interval_hari));
    const nextDateStr = today.toISOString().split('T')[0];

    const result = await pool.query(`
      UPDATE schedules SET tanggal_berikutnya = $1 WHERE id = $2 RETURNING *
    `, [nextDateStr, id]);

    return ok(res, result.rows[0], 'Jadwal ditandai selesai dan tanggal berikutnya diperbarui');
  } catch (err) {
    console.error('Mark schedule done error:', err);
    return fail(res, err.message, 500);
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedCheck = await pool.query(`
      SELECT s.*, p.user_id FROM schedules s
      JOIN plants p ON s.plant_id = p.id
      WHERE s.id = $1
    `, [id]);

    if (schedCheck.rowCount === 0) {
      return fail(res, 'Jadwal tidak ditemukan', 404);
    }

    if (schedCheck.rows[0].user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    const { plant_id, treatment_type_id, interval_hari, tanggal_berikutnya, jam_perawatan, status, catatan } = req.body;
    if (!plant_id || !treatment_type_id || !interval_hari || !tanggal_berikutnya) {
      return fail(res, 'Semua field wajib diisi', 400);
    }

    const result = await pool.query(`
      UPDATE schedules
      SET plant_id = $1, treatment_type_id = $2, interval_hari = $3, tanggal_berikutnya = $4, jam_perawatan = $5, status = $6, catatan = $7
      WHERE id = $8
      RETURNING *
    `, [plant_id, treatment_type_id, interval_hari, tanggal_berikutnya, jam_perawatan || null, status || 'aktif', catatan || null, id]);

    return ok(res, result.rows[0], 'Jadwal berhasil diperbarui');
  } catch (err) {
    console.error('Update schedule error:', err);
    return fail(res, err.message, 500);
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedCheck = await pool.query(`
      SELECT s.*, p.user_id FROM schedules s
      JOIN plants p ON s.plant_id = p.id
      WHERE s.id = $1
    `, [id]);

    if (schedCheck.rowCount === 0) {
      return fail(res, 'Jadwal tidak ditemukan', 404);
    }

    if (schedCheck.rows[0].user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
    return ok(res, null, 'Jadwal berhasil dihapus');
  } catch (err) {
    console.error('Delete schedule error:', err);
    return fail(res, err.message, 500);
  }
};

module.exports = { getAllSchedules, getHomeSchedules, createSchedule, markScheduleDone, updateSchedule, deleteSchedule };
