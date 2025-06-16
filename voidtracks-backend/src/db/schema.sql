-- Tabella utenti
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tokens INT NOT NULL DEFAULT 10,
  role VARCHAR(10) NOT NULL DEFAULT 'user', -- 'user' o 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella brani
CREATE TABLE tracks (
  id UUID PRIMARY KEY,
  titolo VARCHAR(100) NOT NULL,
  artista VARCHAR(100) NOT NULL,
  album VARCHAR(100) NOT NULL,
  music_path VARCHAR(255) NOT NULL,
  cover_path VARCHAR(255) NOT NULL,
  costo INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella acquisti (brani acquistati dagli utenti)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP DEFAULT NOW() NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  used_flag BOOLEAN DEFAULT FALSE NOT NULL,
  costo INTEGER NOT NULL,
  download_token UUID NOT NULL UNIQUE
);

-- Tabella playlist
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella playlist_tracks (brani nelle playlist)
CREATE TABLE playlist_tracks (
  id SERIAL PRIMARY KEY,
  playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (playlist_id, track_id)
);