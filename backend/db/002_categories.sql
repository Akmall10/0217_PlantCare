CREATE TABLE IF NOT EXISTS categories (
  id                SERIAL PRIMARY KEY,
  nama              VARCHAR(50) NOT NULL UNIQUE,
  deskripsi         TEXT,
  kebutuhan_cahaya  VARCHAR(20) NOT NULL CHECK (kebutuhan_cahaya IN ('rendah', 'sedang', 'tinggi')),
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);
