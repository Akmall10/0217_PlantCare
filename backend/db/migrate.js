// Menjalankan semua file .sql di folder db secara berurutan (001_, 002_, ...)
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrate() {
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    await pool.query(sql);
    console.log('Migrasi selesai:', file);
  }
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migrasi gagal:', err.message);
  process.exit(1);
});
