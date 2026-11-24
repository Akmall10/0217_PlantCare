CREATE TABLE IF NOT EXISTS journals (
  id            SERIAL PRIMARY KEY,
  plant_id      INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,
  tinggi_cm     DECIMAL(5,2) CHECK (tinggi_cm >= 0),
  jumlah_daun   INTEGER CHECK (jumlah_daun >= 0),
  kondisi       VARCHAR(20) NOT NULL CHECK (kondisi IN ('sehat', 'perlu perhatian', 'sakit')),
  catatan       TEXT,
  foto_path     VARCHAR(255),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
