CREATE TABLE IF NOT EXISTS plants (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  nama            VARCHAR(100) NOT NULL,
  nama_latin      VARCHAR(100),
  tanggal_tanam   DATE NOT NULL,
  lokasi          VARCHAR(100),
  jumlah          INTEGER NOT NULL DEFAULT 1 CHECK (jumlah >= 1),
  catatan         TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
