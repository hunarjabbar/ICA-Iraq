CREATE TABLE IF NOT EXISTS ica_articles (
 id TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 type TEXT NOT NULL CHECK(type IN ('news','press','culture','entertainment','analysis')),
 status TEXT NOT NULL CHECK(status IN ('draft','published','archived')) DEFAULT 'draft',
 lang TEXT NOT NULL DEFAULT 'en',
 title TEXT NOT NULL,
 excerpt TEXT NOT NULL,
 body TEXT NOT NULL,
 author TEXT NOT NULL DEFAULT 'ICA Editorial Desk',
 image_url TEXT,
 published_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ica_articles_published ON ica_articles(status, type, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ica_articles_lang ON ica_articles(lang, status);
CREATE TABLE IF NOT EXISTS ica_media (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('video','audio','photo')),
 category TEXT NOT NULL DEFAULT 'editorial',
 description TEXT NOT NULL DEFAULT '',
 url TEXT NOT NULL,
 poster_url TEXT,
 published INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ica_media_published ON ica_media(published,created_at DESC);
CREATE TABLE IF NOT EXISTS ica_messages (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 topic TEXT NOT NULL,
 message TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ica_subscribers (
 email TEXT PRIMARY KEY,
 lang TEXT NOT NULL DEFAULT 'en',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ica_rate_limits (
 id TEXT PRIMARY KEY,
 requests INTEGER NOT NULL DEFAULT 1,
 expires_at INTEGER NOT NULL
);
