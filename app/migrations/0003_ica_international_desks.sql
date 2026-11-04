-- Additive migration: ICA international newsrooms and attributed external source wire.
-- External linked headlines are NOT ICA-authored reporting.
ALTER TABLE ica_articles ADD COLUMN desk TEXT NOT NULL DEFAULT 'news';
ALTER TABLE ica_articles ADD COLUMN region TEXT NOT NULL DEFAULT 'bilateral';
ALTER TABLE ica_articles ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ica_articles ADD COLUMN trending INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ica_articles ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_ica_articles_desks ON ica_articles(status, desk, region, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ica_articles_featured ON ica_articles(status, featured, trending, priority DESC);
CREATE TABLE IF NOT EXISTS ica_wire_sources (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 publisher TEXT NOT NULL,
 feed_url TEXT NOT NULL UNIQUE,
 source_type TEXT NOT NULL CHECK(source_type IN ('rss','hkma-json')),
 region TEXT NOT NULL,
 desk TEXT NOT NULL,
 enabled INTEGER NOT NULL DEFAULT 1,
 checked_at TEXT,
 last_success_at TEXT,
 last_error TEXT,
 imported_count INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ica_wire_items (
 id TEXT PRIMARY KEY,
 source_id TEXT,
 source_url TEXT NOT NULL UNIQUE,
 headline TEXT NOT NULL,
 source_name TEXT NOT NULL,
 region TEXT NOT NULL DEFAULT 'world',
 desk TEXT NOT NULL DEFAULT 'news',
 summary TEXT NOT NULL DEFAULT '',
 published_at TEXT NOT NULL,
 added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 status TEXT NOT NULL CHECK(status IN ('linked','hidden')) DEFAULT 'linked',
 pinned INTEGER NOT NULL DEFAULT 0,
 origin TEXT NOT NULL CHECK(origin IN ('feed','editor')) DEFAULT 'feed'
);
CREATE INDEX IF NOT EXISTS idx_ica_wire_region ON ica_wire_items(status,region,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ica_wire_desk ON ica_wire_items(status,desk,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ica_wire_pins ON ica_wire_items(status,pinned,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ica_wire_source ON ica_wire_items(source_id,published_at DESC);
INSERT OR IGNORE INTO ica_wire_sources(id,name,publisher,feed_url,source_type,region,desk) VALUES
('rthk-hk','Hong Kong Latest','RTHK','https://rthk.hk/rthk/news/rss/e_expressnews_elocal.xml','rss','hong-kong','news'),
('rthk-china','Greater China','RTHK','https://rthk.hk/rthk/news/rss/e_expressnews_egreaterchina.xml','rss','china','news'),
('rthk-world','World Headlines','RTHK','https://rthk.hk/rthk/news/rss/e_expressnews_einternational.xml','rss','world','news'),
('rthk-finance','Financial Markets','RTHK','https://rthk.hk/rthk/news/rss/e_expressnews_efinance.xml','rss','hong-kong','finance'),
('asean','ASEAN Secretariat','ASEAN Secretariat','https://asean.org/feed/','rss','asean','business'),
('hk-government','Hong Kong Government','Government of Hong Kong SAR','https://www.news.gov.hk/rss/news/topstories_en.xml','rss','hong-kong','news'),
('hkma','Hong Kong Monetary Authority','Hong Kong Monetary Authority','https://api.hkma.gov.hk/public/press-releases?lang=en&offset=0','hkma-json','hong-kong','finance'),
('un-news','UN News','United Nations','https://news.un.org/feed/subscribe/en/news/all/rss.xml','rss','world','news');
