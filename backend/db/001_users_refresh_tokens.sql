-- Tabel pengguna dan refresh token
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP    NOT NULL,
  revoked    BOOLEAN      NOT NULL DEFAULT FALSE
);
