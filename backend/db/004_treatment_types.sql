CREATE TABLE IF NOT EXISTS treatment_types (
  id          SERIAL PRIMARY KEY,
  nama        VARCHAR(50) NOT NULL UNIQUE,
  satuan      VARCHAR(20) NOT NULL,
  deskripsi   TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
