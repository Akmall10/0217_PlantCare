CREATE TABLE IF NOT EXISTS schedules (
  id                  SERIAL PRIMARY KEY,
  plant_id            INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  treatment_type_id   INTEGER NOT NULL REFERENCES treatment_types(id) ON DELETE RESTRICT,
  interval_hari       INTEGER NOT NULL CHECK (interval_hari >= 1),
  tanggal_berikutnya  DATE NOT NULL,
  jam_perawatan       VARCHAR(10),
  status              VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  catatan             TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
