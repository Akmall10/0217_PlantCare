const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

const getAllPlants = async (req, res) => {
  try {
    const { search, category_id } = req.query;
    let query = `
      SELECT p.*, c.nama AS category_nama, u.nama AS owner_nama
      FROM plants p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
    `;
    let conditions = [];
    let params = [];

    // If user is not admin, only show own plants
    if (req.user.role !== 'admin') {
      conditions.push(`p.user_id = $${params.length + 1}`);
      params.push(req.user.id);
    }

    if (search) {
      conditions.push(`(LOWER(p.nama) LIKE LOWER($${params.length + 1}) OR LOWER(p.nama_latin) LIKE LOWER($${params.length + 1}))`);
      params.push(`%${search}%`);
    }

    if (category_id) {
      conditions.push(`p.category_id = $${params.length + 1}`);
      params.push(category_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.id DESC';

    const result = await pool.query(query, params);
    return ok(res, result.rows, 'Daftar tanaman berhasil dimuat');
  } catch (err) {
    console.error('Get plants error:', err);
    return fail(res, err.message, 500);
  }
};

const getPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    const plantRes = await pool.query(`
      SELECT p.*, c.nama AS category_nama, u.nama AS owner_nama
      FROM plants p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (plantRes.rowCount === 0) {
      return fail(res, 'Tanaman tidak ditemukan', 404);
    }

    const plant = plantRes.rows[0];

    // Ownership check for user
    if (req.user.role !== 'admin' && plant.user_id !== req.user.id) {
      return fail(res, 'Akses ditolak ke tanaman pengguna lain', 403);
    }

    // Get schedules
    const schedulesRes = await pool.query(`
      SELECT s.*, t.nama AS treatment_nama, t.satuan
      FROM schedules s
      JOIN treatment_types t ON s.treatment_type_id = t.id
      WHERE s.plant_id = $1
      ORDER BY s.tanggal_berikutnya ASC
    `, [id]);

    // Get journals
    const journalsRes = await pool.query(`
      SELECT * FROM journals WHERE plant_id = $1 ORDER BY tanggal DESC
    `, [id]);

    plant.schedules = schedulesRes.rows;
    plant.journals = journalsRes.rows;

    return ok(res, plant, 'Detail tanaman berhasil dimuat');
  } catch (err) {
    console.error('Get plant detail error:', err);
    return fail(res, err.message, 500);
  }
};

const createPlant = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return fail(res, 'Admin tidak dapat menambah tanaman', 403);
    }

    const { category_id, nama, nama_latin, tanggal_tanam, lokasi, jumlah, catatan } = req.body;
    if (!category_id || !nama || !tanggal_tanam || !jumlah) {
      return fail(res, 'Kategori, nama, tanggal tanam, dan jumlah wajib diisi', 400);
    }

    if (nama.length > 100) {
      return fail(res, 'Nama tanaman maksimal 100 karakter', 400);
    }

    const tanamDate = new Date(tanggal_tanam);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (tanamDate > today) {
      return fail(res, 'Tanggal tanam tidak boleh di masa depan', 400);
    }

    if (jumlah < 1) {
      return fail(res, 'Jumlah minimal 1', 400);
    }

    // Verify category exists
    const catCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (catCheck.rowCount === 0) {
      return fail(res, 'Kategori tidak ditemukan', 404);
    }

    const result = await pool.query(`
      INSERT INTO plants (user_id, category_id, nama, nama_latin, tanggal_tanam, lokasi, jumlah, catatan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [req.user.id, category_id, nama, nama_latin || null, tanggal_tanam, lokasi || null, jumlah, catatan || null]);

    return ok(res, result.rows[0], 'Tanaman berhasil ditambahkan', 201);
  } catch (err) {
    console.error('Create plant error:', err);
    return fail(res, err.message, 500);
  }
};

const updatePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const plantCheck = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);
    if (plantCheck.rowCount === 0) {
      return fail(res, 'Tanaman tidak ditemukan', 404);
    }

    const plant = plantCheck.rows[0];
    if (req.user.role !== 'admin' && plant.user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    const { category_id, nama, nama_latin, tanggal_tanam, lokasi, jumlah, catatan } = req.body;
    if (!category_id || !nama || !tanggal_tanam || !jumlah) {
      return fail(res, 'Kategori, nama, tanggal tanam, dan jumlah wajib diisi', 400);
    }

    const result = await pool.query(`
      UPDATE plants
      SET category_id = $1, nama = $2, nama_latin = $3, tanggal_tanam = $4, lokasi = $5, jumlah = $6, catatan = $7
      WHERE id = $8
      RETURNING *
    `, [category_id, nama, nama_latin || null, tanggal_tanam, lokasi || null, jumlah, catatan || null, id]);

    return ok(res, result.rows[0], 'Tanaman berhasil diperbarui');
  } catch (err) {
    console.error('Update plant error:', err);
    return fail(res, err.message, 500);
  }
};

const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const plantCheck = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);
    if (plantCheck.rowCount === 0) {
      return fail(res, 'Tanaman tidak ditemukan', 404);
    }

    const plant = plantCheck.rows[0];
    if (req.user.role !== 'admin' && plant.user_id !== req.user.id) {
      return fail(res, 'Akses ditolak', 403);
    }

    // Cascade delete handles schedules & journals in database foreign key,
    // but if journals have local photo files, we can also query them if needed.
    await pool.query('DELETE FROM plants WHERE id = $1', [id]);

    return ok(res, null, 'Tanaman berhasil dihapus beserta jadwal dan jurnal terkait');
  } catch (err) {
    console.error('Delete plant error:', err);
    return fail(res, err.message, 500);
  }
};

module.exports = { getAllPlants, getPlantById, createPlant, updatePlant, deletePlant };
