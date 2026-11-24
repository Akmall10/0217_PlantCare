require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seed() {
  const { ADMIN_NAMA, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD harus diisi di .env');
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const result = await pool.query(
    `INSERT INTO users (nama, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [ADMIN_NAMA || 'Admin', ADMIN_EMAIL, hash]
  );
  console.log(result.rowCount ? 'Akun admin dibuat.' : 'Akun admin sudah ada, dilewati.');

  // Seed jenis perawatan (JNS-06)
  const treatments = [
    ['Menyiram', 'ml', 'Penyiraman rutin tanaman'],
    ['Memupuk', 'gram', 'Pemupukan berkala untuk nutrisi tanaman'],
    ['Memangkas', 'kali', 'Pemangkasan daun atau ranting mati'],
    ['Mengganti Media Tanam', 'kali', 'Penggantian media tanam / pot']
  ];

  for (const t of treatments) {
    await pool.query(
      `INSERT INTO treatment_types (nama, satuan, deskripsi)
       VALUES ($1, $2, $3)
       ON CONFLICT (nama) DO NOTHING`,
      t
    );
  }
  console.log('Jenis perawatan (seed) berhasil.');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
